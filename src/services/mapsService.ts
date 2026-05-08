import { Loader } from '@googlemaps/js-api-loader'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

if (!API_KEY) {
  throw new Error('VITE_GOOGLE_MAPS_API_KEY is not set in environment variables')
}

let loaderInstance: Loader | null = null
let isLoaded = false

export async function loadGoogleMaps(): Promise<typeof google.maps> {
  if (isLoaded && window.google?.maps) {
    return window.google.maps
  }

  if (!loaderInstance) {
    loaderInstance = new Loader({
      apiKey: API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry', 'marker'],
    })
  }

  try {
    await loaderInstance.load()
    isLoaded = true
    return window.google.maps
  } catch (error) {
    throw new Error(`Failed to load Google Maps: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function isGoogleMapsLoaded(): boolean {
  return isLoaded && !!window.google?.maps
}

export async function createMap(
  container: HTMLElement,
  options: google.maps.MapOptions
): Promise<google.maps.Map> {
  const maps = await loadGoogleMaps()
  return new maps.Map(container, options)
}

export async function createMarker(
  options: google.maps.MarkerOptions
): Promise<google.maps.Marker> {
  const maps = await loadGoogleMaps()
  return new maps.Marker(options)
}

export async function createInfoWindow(
  options: google.maps.InfoWindowOptions
): Promise<google.maps.InfoWindow> {
  const maps = await loadGoogleMaps()
  return new maps.InfoWindow(options)
}

export async function createPolyline(
  options: google.maps.PolylineOptions
): Promise<google.maps.Polyline> {
  const maps = await loadGoogleMaps()
  return new maps.Polyline(options)
}

export function decodePolyline(encoded: string): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = []
  let index = 0
  const len = encoded.length
  let lat = 0
  let lng = 0

  while (index < len) {
    let b: number
    let shift = 0
    let result = 0

    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)

    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1
    lat += dlat

    shift = 0
    result = 0

    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)

    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1
    lng += dlng

    points.push({
      lat: lat / 1e5,
      lng: lng / 1e5,
    })
  }

  return points
}

export async function fitBounds(
  map: google.maps.Map,
  bounds: google.maps.LatLngBounds
): Promise<void> {
  map.fitBounds(bounds)
}

export async function createBounds(
  points: Array<{ lat: number; lng: number }>
): Promise<google.maps.LatLngBounds> {
  const maps = await loadGoogleMaps()
  const bounds = new maps.LatLngBounds()
  
  points.forEach(point => {
    bounds.extend(new maps.LatLng(point.lat, point.lng))
  })
  
  return bounds
}

export const MAP_STYLES = {
  light: [
    {
      featureType: 'all',
      elementType: 'geometry',
      stylers: [{ color: '#f5f5f5' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#e0e7ff' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#ffffff' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
}

// Made with Bob
