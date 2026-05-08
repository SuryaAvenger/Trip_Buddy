import { LatLng, Activity } from '../types/trip'
import { RouteResult, DirectionsError } from '../types/google'
import { withRetry, directionsRateLimiter } from '../utils/rateLimiter'
import { hashWaypoints } from '../utils/formatters'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

if (!API_KEY) {
  throw new Error('VITE_GOOGLE_MAPS_API_KEY is not set in environment variables')
}

const DIRECTIONS_API_URL = 'https://maps.googleapis.com/maps/api/directions/json'

// Cache for routes to avoid redundant API calls
const routeCache = new Map<string, RouteResult>()

export async function getRoute(
  waypoints: LatLng[],
  mode: 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT' = 'DRIVING'
): Promise<RouteResult> {
  if (waypoints.length < 2) {
    throw new DirectionsError('At least 2 waypoints required', 'INVALID_REQUEST')
  }

  // Check cache
  const cacheKey = `${hashWaypoints(waypoints)}-${mode}`
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)!
  }

  await directionsRateLimiter.acquire()

  const origin = waypoints[0]
  const destination = waypoints[waypoints.length - 1]
  
  if (!origin || !destination) {
    throw new DirectionsError('Invalid waypoints', 'INVALID_REQUEST')
  }
  
  const intermediateWaypoints = waypoints.slice(1, -1)

  const url = new URL(DIRECTIONS_API_URL)
  url.searchParams.append('origin', `${origin.lat},${origin.lng}`)
  url.searchParams.append('destination', `${destination.lat},${destination.lng}`)
  
  if (intermediateWaypoints.length > 0) {
    const waypointsStr = intermediateWaypoints
      .map(wp => `${wp.lat},${wp.lng}`)
      .join('|')
    url.searchParams.append('waypoints', waypointsStr)
  }
  
  url.searchParams.append('mode', mode.toLowerCase())
  url.searchParams.append('key', API_KEY)

  try {
    const result = await withRetry(async () => {
      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new DirectionsError(
          `HTTP error: ${response.status}`,
          'HTTP_ERROR'
        )
      }

      const data = await response.json()

      if (data.status !== 'OK') {
        throw new DirectionsError(
          `Directions request failed: ${data.status} - ${data.error_message || 'Unknown error'}`,
          data.status
        )
      }

      return data
    })

    const routeResult: RouteResult = {
      routes: result.routes.map((route: {
        legs: Array<{
          start_address: string
          end_address: string
          start_location: { lat: number; lng: number }
          end_location: { lat: number; lng: number }
          distance: { text: string; value: number }
          duration: { text: string; value: number }
          steps: Array<{
            distance: { text: string; value: number }
            duration: { text: string; value: number }
            start_location: { lat: number; lng: number }
            end_location: { lat: number; lng: number }
            html_instructions: string
            travel_mode: string
            polyline: { points: string }
          }>
        }>
        overview_polyline: { points: string }
        bounds: {
          northeast: { lat: number; lng: number }
          southwest: { lat: number; lng: number }
        }
        copyrights: string
        warnings: string[]
        waypoint_order: number[]
        summary: string
      }) => ({
        legs: route.legs.map(leg => ({
          startAddress: leg.start_address,
          endAddress: leg.end_address,
          startLocation: {
            lat: leg.start_location.lat,
            lng: leg.start_location.lng,
          },
          endLocation: {
            lat: leg.end_location.lat,
            lng: leg.end_location.lng,
          },
          distance: leg.distance,
          duration: leg.duration,
          steps: leg.steps.map(step => ({
            distance: step.distance,
            duration: step.duration,
            startLocation: {
              lat: step.start_location.lat,
              lng: step.start_location.lng,
            },
            endLocation: {
              lat: step.end_location.lat,
              lng: step.end_location.lng,
            },
            htmlInstructions: step.html_instructions,
            travelMode: step.travel_mode,
            polyline: step.polyline.points,
          })),
        })),
        overviewPolyline: route.overview_polyline.points,
        bounds: {
          northeast: {
            lat: route.bounds.northeast.lat,
            lng: route.bounds.northeast.lng,
          },
          southwest: {
            lat: route.bounds.southwest.lat,
            lng: route.bounds.southwest.lng,
          },
        },
        copyrights: route.copyrights,
        warnings: route.warnings,
        waypointOrder: route.waypoint_order,
        summary: route.summary,
      })),
      status: result.status,
    }

    // Cache the result
    routeCache.set(cacheKey, routeResult)

    return routeResult
  } catch (error) {
    if (error instanceof DirectionsError) {
      throw error
    }

    throw new DirectionsError(
      `Failed to get route: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR'
    )
  }
}

export async function optimizeRoute(activities: Activity[]): Promise<Activity[]> {
  if (activities.length <= 2) {
    return activities
  }

  const firstActivity = activities[0]
  const lastActivity = activities[activities.length - 1]
  
  if (!firstActivity || !lastActivity) {
    throw new DirectionsError('Invalid activities array', 'INVALID_REQUEST')
  }

  await directionsRateLimiter.acquire()

  const origin = firstActivity.location
  const destination = lastActivity.location
  const intermediateWaypoints = activities.slice(1, -1).map(a => a.location)

  const url = new URL(DIRECTIONS_API_URL)
  url.searchParams.append('origin', `${origin.lat},${origin.lng}`)
  url.searchParams.append('destination', `${destination.lat},${destination.lng}`)
  
  if (intermediateWaypoints.length > 0) {
    const waypointsStr = 'optimize:true|' + intermediateWaypoints
      .map(wp => `${wp.lat},${wp.lng}`)
      .join('|')
    url.searchParams.append('waypoints', waypointsStr)
  }
  
  url.searchParams.append('mode', 'driving')
  url.searchParams.append('key', API_KEY)

  try {
    const result = await withRetry(async () => {
      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new DirectionsError(
          `HTTP error: ${response.status}`,
          'HTTP_ERROR'
        )
      }

      const data = await response.json()

      if (data.status !== 'OK') {
        throw new DirectionsError(
          `Route optimization failed: ${data.status}`,
          data.status
        )
      }

      return data
    })

    // Get the optimized waypoint order
    const waypointOrder = result.routes[0].waypoint_order

    // Reorder activities based on optimized waypoints
    const optimizedActivities: Activity[] = [firstActivity] // Start with first activity

    // Add intermediate activities in optimized order
    waypointOrder.forEach((index: number) => {
      const activity = activities[index + 1]
      if (activity) {
        optimizedActivities.push(activity)
      }
    })

    // Add last activity
    optimizedActivities.push(lastActivity)

    // Calculate total travel time
    const totalTravelTime = result.routes[0].legs.reduce(
      (sum: number, leg: { duration: { value: number } }) => sum + leg.duration.value,
      0
    )

    // Update activity times based on new order
    return updateActivityTimes(optimizedActivities, totalTravelTime)
  } catch (error) {
    if (error instanceof DirectionsError) {
      throw error
    }

    // If optimization fails, return original order
    console.error('Route optimization failed:', error)
    return activities
  }
}

export async function getDistanceMatrix(
  origins: LatLng[],
  destinations: LatLng[]
): Promise<number[][]> {
  await directionsRateLimiter.acquire()

  const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json')
  
  const originsStr = origins.map(o => `${o.lat},${o.lng}`).join('|')
  const destinationsStr = destinations.map(d => `${d.lat},${d.lng}`).join('|')
  
  url.searchParams.append('origins', originsStr)
  url.searchParams.append('destinations', destinationsStr)
  url.searchParams.append('mode', 'driving')
  url.searchParams.append('key', API_KEY)

  try {
    const result = await withRetry(async () => {
      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new DirectionsError(
          `HTTP error: ${response.status}`,
          'HTTP_ERROR'
        )
      }

      const data = await response.json()

      if (data.status !== 'OK') {
        throw new DirectionsError(
          `Distance matrix request failed: ${data.status}`,
          data.status
        )
      }

      return data
    })

    // Extract distance values in seconds
    return result.rows.map((row: { elements: Array<{ duration: { value: number } }> }) =>
      row.elements.map(element => element.duration.value)
    )
  } catch (error) {
    if (error instanceof DirectionsError) {
      throw error
    }

    throw new DirectionsError(
      `Failed to get distance matrix: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR'
    )
  }
}

function updateActivityTimes(activities: Activity[], totalTravelTime: number): Activity[] {
  // This is a simplified version - in production, you'd calculate precise times
  // based on actual route legs and activity durations
  
  const firstActivity = activities[0]
  if (!firstActivity) {
    return activities
  }
  
  let currentTime = new Date(`2000-01-01T${firstActivity.startTime}`)
  
  return activities.map((activity, index) => {
    if (index === 0) {
      return activity
    }

    // Add travel time from previous activity (simplified - use actual leg duration)
    const travelTimeMinutes = Math.ceil(totalTravelTime / (activities.length - 1) / 60)
    currentTime = new Date(currentTime.getTime() + travelTimeMinutes * 60000)

    const startTime = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`
    
    // Add activity duration
    currentTime = new Date(currentTime.getTime() + activity.duration * 60000)
    
    const endTime = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`

    return {
      ...activity,
      startTime,
      endTime,
    }
  })
}

export function clearRouteCache(): void {
  routeCache.clear()
}

// Made with Bob
