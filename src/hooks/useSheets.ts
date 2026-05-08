import { useState, useCallback } from 'react'
import { exportBudgetToSheets } from '../services/sheetsService'
import { initGoogleAuth } from '../services/calendarService'
import { Itinerary } from '../types/trip'
import { GoogleAPIError } from '../types/google'

interface UseSheetsReturn {
  exportBudget: (itinerary: Itinerary) => Promise<string | null>
  isExporting: boolean
  isAuthenticated: boolean
  error: string | null
  authenticate: () => Promise<boolean>
}

export function useSheets(): UseSheetsReturn {
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

  const exportBudget = useCallback(
    async (itinerary: Itinerary): Promise<string | null> => {
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

        const spreadsheetUrl = await exportBudgetToSheets(itinerary)
        setIsExporting(false)
        return spreadsheetUrl
      } catch (err) {
        const errorMessage =
          err instanceof GoogleAPIError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Failed to export budget to Google Sheets'

        setError(errorMessage)
        setIsExporting(false)
        return null
      }
    },
    [isAuthenticated, authenticate]
  )

  return {
    exportBudget,
    isExporting,
    isAuthenticated,
    error,
    authenticate,
  }
}

// Made with Bob
