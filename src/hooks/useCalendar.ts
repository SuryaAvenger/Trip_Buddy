import { useState, useCallback } from 'react'
import {
  initGoogleAuth,
  createCalendarEvents,
  createTripCalendar,
} from '../services/calendarService'
import { Itinerary } from '../types/trip'
import { GoogleAPIError } from '../types/google'

interface UseCalendarReturn {
  exportToCalendar: (itinerary: Itinerary) => Promise<string[] | null>
  createCalendar: (tripName: string) => Promise<string | null>
  isExporting: boolean
  isAuthenticated: boolean
  error: string | null
  authenticate: () => Promise<boolean>
}

export function useCalendar(): UseCalendarReturn {
  const [isExporting, setIsExporting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const authenticate = useCallback(async (): Promise<boolean> => {
    setError(null)

    try {
      await initGoogleAuth()
      setIsAuthenticated(true)
      return true
    } catch (err) {
      const errorMessage =
        err instanceof GoogleAPIError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to authenticate with Google'

      setError(errorMessage)
      setIsAuthenticated(false)
      return false
    }
  }, [])

  const exportToCalendar = useCallback(
    async (itinerary: Itinerary): Promise<string[] | null> => {
      setIsExporting(true)
      setError(null)

      try {
        // Ensure authenticated
        if (!isAuthenticated) {
          const authSuccess = await authenticate()
          if (!authSuccess) {
            setIsExporting(false)
            return null
          }
        }

        const eventIds = await createCalendarEvents(itinerary)
        setIsExporting(false)
        return eventIds
      } catch (err) {
        const errorMessage =
          err instanceof GoogleAPIError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Failed to export to calendar'

        setError(errorMessage)
        setIsExporting(false)
        return null
      }
    },
    [isAuthenticated, authenticate]
  )

  const createCalendar = useCallback(
    async (tripName: string): Promise<string | null> => {
      setIsExporting(true)
      setError(null)

      try {
        // Ensure authenticated
        if (!isAuthenticated) {
          const authSuccess = await authenticate()
          if (!authSuccess) {
            setIsExporting(false)
            return null
          }
        }

        const calendarId = await createTripCalendar(tripName)
        setIsExporting(false)
        return calendarId
      } catch (err) {
        const errorMessage =
          err instanceof GoogleAPIError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Failed to create calendar'

        setError(errorMessage)
        setIsExporting(false)
        return null
      }
    },
    [isAuthenticated, authenticate]
  )

  return {
    exportToCalendar,
    createCalendar,
    isExporting,
    isAuthenticated,
    error,
    authenticate,
  }
}

// Made with Bob
