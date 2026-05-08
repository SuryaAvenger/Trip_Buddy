import { useState, useCallback } from 'react'
import {
  searchNearbyPlaces,
  getPlaceDetails,
  searchRestaurants,
} from '../services/placesService'
import { PlaceResult, PlaceDetails, PlacesError } from '../types/google'
import { LatLng, Interest } from '../types/trip'

interface UsePlacesReturn {
  searchPlaces: (
    location: LatLng,
    type: string,
    radius?: number
  ) => Promise<PlaceResult[]>
  getDetails: (placeId: string) => Promise<PlaceDetails | null>
  searchRestaurantsByType: (
    location: LatLng,
    cuisine: string,
    priceLevel?: number
  ) => Promise<PlaceResult[]>
  searchByInterest: (
    location: LatLng,
    interest: Interest,
    radius?: number
  ) => Promise<PlaceResult[]>
  isLoading: boolean
  error: string | null
}

const INTEREST_TO_PLACE_TYPE: Record<Interest, string[]> = {
  culture: ['museum', 'art_gallery', 'historical_landmark', 'cultural_center'],
  food: ['restaurant', 'cafe', 'bakery', 'food'],
  nature: ['park', 'natural_feature', 'hiking_area', 'botanical_garden'],
  adventure: ['amusement_park', 'adventure_sports', 'water_park', 'ski_resort'],
  shopping: ['shopping_mall', 'store', 'market', 'boutique'],
  nightlife: ['night_club', 'bar', 'live_music_venue', 'casino'],
  history: ['historical_landmark', 'monument', 'archaeological_site', 'heritage_site'],
  art: ['art_gallery', 'museum', 'theater', 'performing_arts_theater'],
  wellness: ['spa', 'gym', 'yoga_studio', 'wellness_center'],
}

export function usePlaces(): UsePlacesReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchPlaces = useCallback(
    async (
      location: LatLng,
      type: string,
      radius: number = 5000
    ): Promise<PlaceResult[]> => {
      setIsLoading(true)
      setError(null)

      try {
        const results = await searchNearbyPlaces(location, type, radius)
        setIsLoading(false)
        return results
      } catch (err) {
        const errorMessage =
          err instanceof PlacesError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Failed to search places'

        setError(errorMessage)
        setIsLoading(false)
        return []
      }
    },
    []
  )

  const getDetails = useCallback(async (placeId: string): Promise<PlaceDetails | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const details = await getPlaceDetails(placeId)
      setIsLoading(false)
      return details
    } catch (err) {
      const errorMessage =
        err instanceof PlacesError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to get place details'

      setError(errorMessage)
      setIsLoading(false)
      return null
    }
  }, [])

  const searchRestaurantsByType = useCallback(
    async (
      location: LatLng,
      cuisine: string,
      priceLevel?: number
    ): Promise<PlaceResult[]> => {
      setIsLoading(true)
      setError(null)

      try {
        const results = await searchRestaurants(location, cuisine, priceLevel ?? 2)
        setIsLoading(false)
        return results
      } catch (err) {
        const errorMessage =
          err instanceof PlacesError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Failed to search restaurants'

        setError(errorMessage)
        setIsLoading(false)
        return []
      }
    },
    []
  )

  const searchByInterest = useCallback(
    async (
      location: LatLng,
      interest: Interest,
      radius: number = 5000
    ): Promise<PlaceResult[]> => {
      setIsLoading(true)
      setError(null)

      try {
        const placeTypes = INTEREST_TO_PLACE_TYPE[interest] || []
        
        // Search for all place types related to this interest
        const searchPromises = placeTypes.map((type) =>
          searchNearbyPlaces(location, type, radius)
        )

        const resultsArrays = await Promise.all(searchPromises)
        
        // Flatten and deduplicate by placeId
        const allResults = resultsArrays.flat()
        const uniqueResults = Array.from(
          new Map(allResults.map((place) => [place.placeId, place])).values()
        )

        // Sort by rating descending
        uniqueResults.sort((a, b) => (b.rating || 0) - (a.rating || 0))

        setIsLoading(false)
        return uniqueResults.slice(0, 20) // Return top 20
      } catch (err) {
        const errorMessage =
          err instanceof PlacesError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Failed to search by interest'

        setError(errorMessage)
        setIsLoading(false)
        return []
      }
    },
    []
  )

  return {
    searchPlaces,
    getDetails,
    searchRestaurantsByType,
    searchByInterest,
    isLoading,
    error,
  }
}

// Made with Bob
