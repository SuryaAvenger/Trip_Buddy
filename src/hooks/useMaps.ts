import { useState, useEffect, useRef, useCallback } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { LatLng } from '../types/trip'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

interface UseMapsReturn {
  mapRef: React.RefObject<HTMLDivElement>
  map: google.maps.Map | null
  isLoaded: boolean
  error: string | null
  initMap: (center: LatLng, zoom?: number) => Promise<void>
  addMarker: (position: LatLng, title: string, icon?: string) => google.maps.Marker | null
  addPolyline: (path: LatLng[], color: string) => google.maps.Polyline | null
  fitBounds: (locations: LatLng[]) => void
  clearMarkers: () => void
  clearPolylines: () => void
}

export function useMaps(): UseMapsReturn {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const polylinesRef = useRef<google.maps.Polyline[]>([])
  const loaderRef = useRef<Loader | null>(null)

  useEffect(() => {
    if (!API_KEY) {
      setError('Google Maps API key is not configured')
      return
    }

    // Initialize loader only once
    if (!loaderRef.current) {
      loaderRef.current = new Loader({
        apiKey: API_KEY,
        version: 'weekly',
        libraries: ['places', 'geometry'],
      })
    }

    // Load the Maps JavaScript API
    loaderRef.current
      .load()
      .then(() => {
        setIsLoaded(true)
      })
      .catch((err) => {
        setError(`Failed to load Google Maps: ${err.message}`)
      })
  }, [])

  const initMap = useCallback(
    async (center: LatLng, zoom: number = 13): Promise<void> => {
      if (!isLoaded || !mapRef.current) {
        throw new Error('Google Maps is not loaded or map container is not available')
      }

      try {
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: center.lat, lng: center.lng },
          zoom,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        })

        setMap(mapInstance)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize map'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    [isLoaded]
  )

  const addMarker = useCallback(
    (position: LatLng, title: string, icon?: string): google.maps.Marker | null => {
      if (!map) {
        return null
      }

      const marker = new google.maps.Marker({
        position: { lat: position.lat, lng: position.lng },
        map,
        title,
        icon: icon
          ? {
              url: icon,
              scaledSize: new google.maps.Size(32, 32),
            }
          : undefined,
        animation: google.maps.Animation.DROP,
      })

      markersRef.current.push(marker)
      return marker
    },
    [map]
  )

  const addPolyline = useCallback(
    (path: LatLng[], color: string): google.maps.Polyline | null => {
      if (!map) {
        return null
      }

      const polyline = new google.maps.Polyline({
        path: path.map((p) => ({ lat: p.lat, lng: p.lng })),
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 3,
        map,
      })

      polylinesRef.current.push(polyline)
      return polyline
    },
    [map]
  )

  const fitBounds = useCallback(
    (locations: LatLng[]): void => {
      if (!map || locations.length === 0) {
        return
      }

      const bounds = new google.maps.LatLngBounds()
      locations.forEach((loc) => {
        bounds.extend({ lat: loc.lat, lng: loc.lng })
      })

      map.fitBounds(bounds)

      // Add padding
      const padding = { top: 50, right: 50, bottom: 50, left: 50 }
      map.fitBounds(bounds, padding)
    },
    [map]
  )

  const clearMarkers = useCallback((): void => {
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []
  }, [])

  const clearPolylines = useCallback((): void => {
    polylinesRef.current.forEach((polyline) => polyline.setMap(null))
    polylinesRef.current = []
  }, [])

  return {
    mapRef,
    map,
    isLoaded,
    error,
    initMap,
    addMarker,
    addPolyline,
    fitBounds,
    clearMarkers,
    clearPolylines,
  }
}

// Made with Bob
