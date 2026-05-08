import { Itinerary, Activity, Meal } from '../types/trip'
import { CalendarEvent, GoogleAPIError } from '../types/google'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CALENDAR_CLIENT_ID
const API_SCOPE = import.meta.env.VITE_GOOGLE_API_SCOPE

if (!CLIENT_ID) {
  throw new Error('VITE_GOOGLE_CALENDAR_CLIENT_ID is not set in environment variables')
}

let tokenClient: google.accounts.oauth2.TokenClient | null = null
let accessToken: string | null = null

export async function initGoogleAuth(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof google === 'undefined' || !google.accounts) {
      reject(new GoogleAPIError('Google Identity Services not loaded', 'INIT_ERROR'))
      return
    }

    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: API_SCOPE,
      callback: (response) => {
        if (response.error) {
          reject(new GoogleAPIError(response.error, 'AUTH_ERROR'))
          return
        }
        accessToken = response.access_token
        sessionStorage.setItem('google_access_token', response.access_token)
        sessionStorage.setItem('google_token_expiry', String(Date.now() + (response.expires_in * 1000)))
        resolve()
      },
    })

    resolve()
  })
}

export async function requestAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  const cachedToken = sessionStorage.getItem('google_access_token')
  const expiry = sessionStorage.getItem('google_token_expiry')
  
  if (cachedToken && expiry && Date.now() < parseInt(expiry)) {
    accessToken = cachedToken
    return cachedToken
  }

  // Request new token
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new GoogleAPIError('Token client not initialized', 'AUTH_ERROR'))
      return
    }

    tokenClient.callback = (response) => {
      if (response.error) {
        reject(new GoogleAPIError(response.error, 'AUTH_ERROR'))
        return
      }
      accessToken = response.access_token
      sessionStorage.setItem('google_access_token', response.access_token)
      sessionStorage.setItem('google_token_expiry', String(Date.now() + (response.expires_in * 1000)))
      resolve(response.access_token)
    }

    tokenClient.requestAccessToken({ prompt: 'consent' })
  })
}

export async function createTripCalendar(tripName: string): Promise<string> {
  if (!accessToken) {
    await requestAccessToken()
  }

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: tripName,
      description: `Travel itinerary created by TripBuddy`,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  })

  if (!response.ok) {
    throw new GoogleAPIError(
      `Failed to create calendar: ${response.statusText}`,
      'CALENDAR_ERROR',
      response.status
    )
  }

  const data = await response.json()
  return data.id
}

export async function createCalendarEvents(
  itinerary: Itinerary,
  calendarId: string = 'primary'
): Promise<string[]> {
  if (!accessToken) {
    await requestAccessToken()
  }

  const events: CalendarEvent[] = []
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  // Create events for each day
  for (const day of itinerary.days) {
    // Add activities
    for (const activity of day.activities) {
      events.push(createActivityEvent(activity, day.date, timeZone))
    }

    // Add meals
    for (const meal of day.meals) {
      events.push(createMealEvent(meal, day.date, timeZone))
    }
  }

  // Create all events
  const eventIds: string[] = []

  for (const event of events) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      )

      if (response.ok) {
        const data = await response.json()
        eventIds.push(data.id)
      }
    } catch (error) {
      console.error('Failed to create event:', error)
    }
  }

  return eventIds
}

function createActivityEvent(
  activity: Activity,
  date: string,
  timeZone: string
): CalendarEvent {
  const startDateTime = `${date}T${activity.startTime}:00`
  const endDateTime = `${date}T${activity.endTime}:00`

  return {
    summary: activity.name,
    description: `${activity.description}\n\nCategory: ${activity.category}\nCost: $${activity.cost}\n\nView on Google Maps: https://www.google.com/maps/search/?api=1&query=${activity.location.lat},${activity.location.lng}`,
    location: activity.address,
    start: {
      dateTime: startDateTime,
      timeZone: timeZone,
    },
    end: {
      dateTime: endDateTime,
      timeZone: timeZone,
    },
    colorId: '9', // Blue color for activities
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
      ],
    },
  }
}

function createMealEvent(
  meal: Meal,
  date: string,
  timeZone: string
): CalendarEvent {
  // Estimate meal times based on type
  const mealTimes: Record<string, { start: string; end: string }> = {
    breakfast: { start: '08:00', end: '09:00' },
    lunch: { start: '12:30', end: '13:30' },
    dinner: { start: '19:00', end: '20:30' },
    snack: { start: '15:00', end: '15:30' },
  }

  const times = mealTimes[meal.type] || { start: '12:00', end: '13:00' }
  const startDateTime = `${date}T${times.start}:00`
  const endDateTime = `${date}T${times.end}:00`

  return {
    summary: `${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} at ${meal.restaurantName}`,
    description: `${meal.name}\n\nCuisine: ${meal.cuisineType}\nPrice Range: ${meal.priceRange}\nEstimated Cost: $${meal.estimatedCost}\n\nView on Google Maps: https://www.google.com/maps/search/?api=1&query=${meal.location.lat},${meal.location.lng}`,
    location: meal.address,
    start: {
      dateTime: startDateTime,
      timeZone: timeZone,
    },
    end: {
      dateTime: endDateTime,
      timeZone: timeZone,
    },
    colorId: '11', // Red color for meals
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 15 },
      ],
    },
  }
}

export function revokeAccess(): void {
  if (accessToken) {
    google.accounts.oauth2.revoke(accessToken, () => {
      accessToken = null
      sessionStorage.removeItem('google_access_token')
      sessionStorage.removeItem('google_token_expiry')
    })
  }
}

export function isAuthenticated(): boolean {
  const token = sessionStorage.getItem('google_access_token')
  const expiry = sessionStorage.getItem('google_token_expiry')
  
  if (!token || !expiry) {
    return false
  }
  
  return Date.now() < parseInt(expiry)
}

// Made with Bob
