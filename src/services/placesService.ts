import { LatLng } from '../types/trip'
import { PlaceResult, PlaceDetails, PlacesError } from '../types/google'
import { withRetry, placesRateLimiter } from '../utils/rateLimiter'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

if (!API_KEY) {
  throw new Error('VITE_GOOGLE_MAPS_API_KEY is not set in environment variables')
}

const PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchNearby'
const PLACE_DETAILS_URL = 'https://places.googleapis.com/v1/places'

// Map user-friendly interest types to valid Google Places API types
function mapInterestToPlaceType(interest: string): string {
  const typeMap: Record<string, string> = {
    'shopping': 'shopping_mall',
    'food': 'restaurant',
    'culture': 'museum',
    'history': 'tourist_attraction',
    'nature': 'park',
    'entertainment': 'amusement_park',
    'nightlife': 'night_club',
    'sports': 'stadium',
    'art': 'art_gallery',
    'beach': 'beach',
    'hiking': 'park',
    'adventure': 'tourist_attraction',
  }
  
  // Return mapped type or original if not in map
  return typeMap[interest.toLowerCase()] || interest.toLowerCase().replace(/\s+/g, '_')
}

export async function searchNearbyPlaces(
  location: LatLng,
  type: string,
  radius: number = 5000
): Promise<PlaceResult[]> {
  await placesRateLimiter.acquire()

  try {
    const result = await withRetry(async () => {
      const response = await fetch(PLACES_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.types,places.photos,places.currentOpeningHours,places.websiteUri,places.nationalPhoneNumber',
        },
        body: JSON.stringify({
          includedTypes: [mapInterestToPlaceType(type)],
          maxResultCount: 20,
          locationRestriction: {
            circle: {
              center: {
                latitude: location.lat,
                longitude: location.lng,
              },
              radius: radius,
            },
          },
          rankPreference: 'POPULARITY',
        }),
      })

      if (!response.ok) {
        throw new PlacesError(
          `HTTP error: ${response.status}`,
          'HTTP_ERROR'
        )
      }

      const data = await response.json()
      return data
    })

    if (!result.places || result.places.length === 0) {
      return []
    }

    // Filter and transform results
    const places: PlaceResult[] = result.places
      .filter((place: { rating?: number; currentOpeningHours?: { openNow?: boolean } }) => {
        // Filter by rating >= 4.0
        if (place.rating && place.rating < 4.0) return false
        return true
      })
      .slice(0, 10) // Limit to 10 results
      .map((place: {
        id: string
        displayName: { text: string }
        formattedAddress: string
        location: { latitude: number; longitude: number }
        rating?: number
        userRatingCount?: number
        priceLevel?: string
        types: string[]
        photos?: Array<{ name: string }>
        currentOpeningHours?: { openNow: boolean; weekdayDescriptions: string[] }
        websiteUri?: string
        nationalPhoneNumber?: string
      }) => ({
        placeId: place.id,
        name: place.displayName.text,
        formattedAddress: place.formattedAddress,
        location: {
          lat: place.location.latitude,
          lng: place.location.longitude,
        },
        rating: place.rating,
        userRatingsTotal: place.userRatingCount,
        priceLevel: place.priceLevel ? parsePriceLevel(place.priceLevel) : undefined,
        types: place.types,
        photoUrl: place.photos && place.photos.length > 0 && place.photos[0]
          ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?key=${API_KEY}&maxHeightPx=400&maxWidthPx=400`
          : undefined,
        openingHours: place.currentOpeningHours ? {
          openNow: place.currentOpeningHours.openNow,
          weekdayText: place.currentOpeningHours.weekdayDescriptions || [],
        } : undefined,
        website: place.websiteUri,
        phoneNumber: place.nationalPhoneNumber,
      }))

    // Sort by rating descending
    return places.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  } catch (error) {
    if (error instanceof PlacesError) {
      throw error
    }

    throw new PlacesError(
      `Failed to search nearby places: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR'
    )
  }
}

export async function searchRestaurants(
  location: LatLng,
  cuisine: string,
  priceLevel: number
): Promise<PlaceResult[]> {
  await placesRateLimiter.acquire()

  try {
    const result = await withRetry(async () => {
      const response = await fetch(PLACES_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.types,places.photos,places.currentOpeningHours',
        },
        body: JSON.stringify({
          includedTypes: ['restaurant'],
          maxResultCount: 20,
          locationRestriction: {
            circle: {
              center: {
                latitude: location.lat,
                longitude: location.lng,
              },
              radius: 3000,
            },
          },
          rankPreference: 'POPULARITY',
        }),
      })

      if (!response.ok) {
        throw new PlacesError(
          `HTTP error: ${response.status}`,
          'HTTP_ERROR'
        )
      }

      const data = await response.json()
      return data
    })

    if (!result.places || result.places.length === 0) {
      return []
    }

    // Filter and transform results
    const places: PlaceResult[] = result.places
      .filter((place: { rating?: number; priceLevel?: string }) => {
        if (place.rating && place.rating < 4.0) return false
        if (place.priceLevel) {
          const level = parsePriceLevel(place.priceLevel)
          if (level !== undefined && Math.abs(level - priceLevel) > 1) return false
        }
        return true
      })
      .slice(0, 10)
      .map((place: {
        id: string
        displayName: { text: string }
        formattedAddress: string
        location: { latitude: number; longitude: number }
        rating?: number
        userRatingCount?: number
        priceLevel?: string
        types: string[]
        photos?: Array<{ name: string }>
        currentOpeningHours?: { openNow: boolean; weekdayDescriptions: string[] }
      }) => ({
        placeId: place.id,
        name: place.displayName.text,
        formattedAddress: place.formattedAddress,
        location: {
          lat: place.location.latitude,
          lng: place.location.longitude,
        },
        rating: place.rating,
        userRatingsTotal: place.userRatingCount,
        priceLevel: place.priceLevel ? parsePriceLevel(place.priceLevel) : undefined,
        types: place.types,
        photoUrl: place.photos && place.photos.length > 0 && place.photos[0]
          ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?key=${API_KEY}&maxHeightPx=400&maxWidthPx=400`
          : undefined,
        openingHours: place.currentOpeningHours ? {
          openNow: place.currentOpeningHours.openNow,
          weekdayText: place.currentOpeningHours.weekdayDescriptions || [],
        } : undefined,
      }))

    return places.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  } catch (error) {
    if (error instanceof PlacesError) {
      throw error
    }

    throw new PlacesError(
      `Failed to search restaurants: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR'
    )
  }
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  await placesRateLimiter.acquire()

  try {
    const result = await withRetry(async () => {
      const response = await fetch(`${PLACE_DETAILS_URL}/${placeId}`, {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,rating,userRatingCount,priceLevel,types,photos,currentOpeningHours,websiteUri,nationalPhoneNumber,reviews,businessStatus,utcOffsetMinutes',
        },
      })

      if (!response.ok) {
        throw new PlacesError(
          `HTTP error: ${response.status}`,
          'HTTP_ERROR'
        )
      }

      const data = await response.json()
      return data
    })

    return {
      placeId: result.id,
      name: result.displayName.text,
      formattedAddress: result.formattedAddress,
      location: {
        lat: result.location.latitude,
        lng: result.location.longitude,
      },
      rating: result.rating,
      userRatingsTotal: result.userRatingCount,
      priceLevel: result.priceLevel ? parsePriceLevel(result.priceLevel) : undefined,
      types: result.types,
      photoUrl: result.photos && result.photos.length > 0
        ? `https://places.googleapis.com/v1/${result.photos[0].name}/media?key=${API_KEY}&maxHeightPx=800&maxWidthPx=800`
        : undefined,
      openingHours: result.currentOpeningHours ? {
        openNow: result.currentOpeningHours.openNow,
        weekdayText: result.currentOpeningHours.weekdayDescriptions || [],
      } : undefined,
      website: result.websiteUri,
      phoneNumber: result.nationalPhoneNumber,
      reviews: result.reviews?.slice(0, 5).map((review: {
        authorAttribution: { displayName: string }
        rating: number
        text: { text: string }
        publishTime: string
        relativePublishTimeDescription: string
      }) => ({
        authorName: review.authorAttribution.displayName,
        rating: review.rating,
        text: review.text.text,
        time: new Date(review.publishTime).getTime(),
        relativeTimeDescription: review.relativePublishTimeDescription,
      })),
      photos: result.photos?.slice(0, 10).map((photo: { name: string; heightPx: number; widthPx: number }) => ({
        photoReference: photo.name,
        height: photo.heightPx,
        width: photo.widthPx,
        htmlAttributions: [],
      })),
      businessStatus: result.businessStatus,
      utcOffset: result.utcOffsetMinutes,
    }
  } catch (error) {
    if (error instanceof PlacesError) {
      throw error
    }

    throw new PlacesError(
      `Failed to get place details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR'
    )
  }
}

function parsePriceLevel(priceLevel: string): number | undefined {
  const mapping: Record<string, number> = {
    'PRICE_LEVEL_FREE': 0,
    'PRICE_LEVEL_INEXPENSIVE': 1,
    'PRICE_LEVEL_MODERATE': 2,
    'PRICE_LEVEL_EXPENSIVE': 3,
    'PRICE_LEVEL_VERY_EXPENSIVE': 4,
  }
  return mapping[priceLevel]
}

// Made with Bob
