import { useState, useCallback } from 'react'
import { getRoute, optimizeRoute, getDistanceMatrix } from '../services/directionsService'
import { Activity, LatLng, TransportMode } from '../types/trip'
import { RouteResult, DirectionsError } from '../types/google'

interface UseDirectionsReturn {
  calculateRoute: (
    waypoints: LatLng[],
    mode: TransportMode
  ) => Promise<RouteResult | null>
  optimizeActivities: (activities: Activity[]) => Promise<Activity[]>
  calculateDistances: (
    origins: LatLng[],
    destinations: LatLng[]
  ) => Promise<number[][] | null>
  isCalculating: boolean
  error: string | null
}

export function useDirections(): UseDirectionsReturn {
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculateRoute = useCallback(
    async (waypoints: LatLng[], mode: TransportMode): Promise<RouteResult | null> => {
      if (waypoints.length < 2) {
        setError('At least 2 waypoints are required')
        return null
      }

      setIsCalculating(true)
      setError(null)

      try {
        const result = await getRoute(waypoints, mode)
        setIsCalculating(false)
        return result
      } catch (err) {
        const errorMessage =
          err instanceof DirectionsError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Failed to calculate route'

        setError(errorMessage)
        setIsCalculating(false)
        return null
      }
    },
    []
  )

  const optimizeActivities = useCallback(async (activities: Activity[]): Promise<Activity[]> => {
    if (activities.length === 0) {
      return activities
    }

    setIsCalculating(true)
    setError(null)

    try {
      const optimized = await optimizeRoute(activities)
      setIsCalculating(false)
      return optimized
    } catch (err) {
      const errorMessage =
        err instanceof DirectionsError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to optimize route'

      setError(errorMessage)
      setIsCalculating(false)
      return activities // Return original on error
    }
  }, [])

  const calculateDistances = useCallback(
    async (origins: LatLng[], destinations: LatLng[]): Promise<number[][] | null> => {
      if (origins.length === 0 || destinations.length === 0) {
        setError('Origins and destinations cannot be empty')
        return null
      }

      setIsCalculating(true)
      setError(null)

      try {
        const distances = await getDistanceMatrix(origins, destinations)
        setIsCalculating(false)
        return distances
      } catch (err) {
        const errorMessage =
          err instanceof DirectionsError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Failed to calculate distances'

        setError(errorMessage)
        setIsCalculating(false)
        return null
      }
    },
    []
  )

  return {
    calculateRoute,
    optimizeActivities,
    calculateDistances,
    isCalculating,
    error,
  }
}

// Made with Bob
