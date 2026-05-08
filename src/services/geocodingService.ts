import { LatLng } from '../types/trip'
import { GeocodingResult, GeocodingError } from '../types/google'
import { withRetry, mapsRateLimiter } from '../utils/rateLimiter'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

if (!API_KEY) {
  throw new Error('VITE_GOOGLE_MAPS_API_KEY is not set in environment variables')
}

const GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json'

export async function geocodeAddress(address: string): Promise<LatLng> {
  await mapsRateLimiter.acquire()

  const url = new URL(GEOCODING_API_URL)
  url.searchParams.append('address', address)
  url.searchParams.append('key', API_KEY)

  try {
    const result = await withRetry(async () => {
      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new GeocodingError(
          `HTTP error: ${response.status}`,
          'HTTP_ERROR'
        )
      }

      const data = await response.json()

      if (data.status !== 'OK') {
        throw new GeocodingError(
          `Geocoding failed: ${data.status} - ${data.error_message || 'Unknown error'}`,
          data.status
        )
      }

      if (!data.results || data.results.length === 0) {
        throw new GeocodingError(
          'No results found for the given address',
          'ZERO_RESULTS'
        )
      }

      return data
    })

    const location = result.results[0].geometry.location
    return {
      lat: location.lat,
      lng: location.lng,
    }
  } catch (error) {
    if (error instanceof GeocodingError) {
      throw error
    }

    throw new GeocodingError(
      `Failed to geocode address: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR'
    )
  }
}

export async function reverseGeocode(location: LatLng): Promise<string> {
  await mapsRateLimiter.acquire()

  const url = new URL(GEOCODING_API_URL)
  url.searchParams.append('latlng', `${location.lat},${location.lng}`)
  url.searchParams.append('key', API_KEY)

  try {
    const result = await withRetry(async () => {
      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new GeocodingError(
          `HTTP error: ${response.status}`,
          'HTTP_ERROR'
        )
      }

      const data = await response.json()

      if (data.status !== 'OK') {
        throw new GeocodingError(
          `Reverse geocoding failed: ${data.status}`,
          data.status
        )
      }

      if (!data.results || data.results.length === 0) {
        throw new GeocodingError(
          'No results found for the given coordinates',
          'ZERO_RESULTS'
        )
      }

      return data
    })

    return result.results[0].formatted_address
  } catch (error) {
    if (error instanceof GeocodingError) {
      throw error
    }

    throw new GeocodingError(
      `Failed to reverse geocode: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR'
    )
  }
}

export async function getGeocodingDetails(address: string): Promise<GeocodingResult> {
  await mapsRateLimiter.acquire()

  const url = new URL(GEOCODING_API_URL)
  url.searchParams.append('address', address)
  url.searchParams.append('key', API_KEY)

  try {
    const result = await withRetry(async () => {
      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new GeocodingError(
          `HTTP error: ${response.status}`,
          'HTTP_ERROR'
        )
      }

      const data = await response.json()

      if (data.status !== 'OK') {
        throw new GeocodingError(
          `Geocoding failed: ${data.status}`,
          data.status
        )
      }

      if (!data.results || data.results.length === 0) {
        throw new GeocodingError(
          'No results found',
          'ZERO_RESULTS'
        )
      }

      return data
    })

    const firstResult = result.results[0]
    return {
      formattedAddress: firstResult.formatted_address,
      location: {
        lat: firstResult.geometry.location.lat,
        lng: firstResult.geometry.location.lng,
      },
      placeId: firstResult.place_id,
      types: firstResult.types,
      addressComponents: firstResult.address_components.map((component: {
        long_name: string
        short_name: string
        types: string[]
      }) => ({
        longName: component.long_name,
        shortName: component.short_name,
        types: component.types,
      })),
    }
  } catch (error) {
    if (error instanceof GeocodingError) {
      throw error
    }

    throw new GeocodingError(
      `Failed to get geocoding details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR'
    )
  }
}

// Made with Bob
