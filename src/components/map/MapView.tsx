import React, { useEffect, useRef, useState } from 'react'
import { useMaps } from '@/hooks/useMaps'
import { Activity, LatLng } from '@/types/trip'
import { Maximize2, Minimize2 } from 'lucide-react'

interface MapViewProps {
  activities: Activity[]
  selectedDay?: number
  onMarkerClick?: (activityId: string) => void
}

export function MapView({ activities, selectedDay, onMarkerClick }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const { mapRef, initMap, isLoaded, error } = useMaps()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const markersRef = useRef<google.maps.Marker[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const polylinesRef = useRef<google.maps.Polyline[]>([])

  // Initialize map
  useEffect(() => {
    if (mapContainerRef.current && !isLoaded) {
      initMap(mapContainerRef.current)
    }
  }, [initMap, isLoaded])

  // Clear existing markers and polylines
  const clearMap = () => {
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []
    polylinesRef.current.forEach((polyline) => polyline.setMap(null))
    polylinesRef.current = []
    if (infoWindowRef.current) {
      infoWindowRef.current.close()
    }
  }

  // Update markers when activities change
  useEffect(() => {
    if (!mapRef.current || !isLoaded || activities.length === 0) return

    clearMap()

    const bounds = new google.maps.LatLngBounds()
    const dayColors = [
      '#4F46E5', // indigo-600
      '#7C3AED', // violet-600
      '#EC4899', // pink-600
      '#F59E0B', // amber-500
      '#10B981', // emerald-500
      '#3B82F6', // blue-500
      '#8B5CF6', // purple-500
    ]

    // Group activities by day
    const activitiesByDay = activities.reduce((acc, activity) => {
      const dayNum = selectedDay || 1
      if (!acc[dayNum]) acc[dayNum] = []
      acc[dayNum].push(activity)
      return acc
    }, {} as Record<number, Activity[]>)

    // Create markers and polylines for each day
    Object.entries(activitiesByDay).forEach(([dayStr, dayActivities]) => {
      const dayNum = parseInt(dayStr)
      const color = dayColors[(dayNum - 1) % dayColors.length]

      // Create markers
      dayActivities.forEach((activity, index) => {
        const marker = new google.maps.Marker({
          position: activity.location,
          map: mapRef.current,
          title: activity.name,
          label: {
            text: (index + 1).toString(),
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 20,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 3,
          },
          animation: google.maps.Animation.DROP,
        })

        // Create info window
        marker.addListener('click', () => {
          if (!infoWindowRef.current) {
            infoWindowRef.current = new google.maps.InfoWindow()
          }

          const content = `
            <div style="padding: 12px; max-width: 280px;">
              <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0; color: #111827;">
                ${activity.name}
              </h3>
              <p style="font-size: 14px; color: #6B7280; margin: 0 0 8px 0;">
                ${activity.description}
              </p>
              <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #6B7280; margin-bottom: 4px;">
                <span>⏰ ${activity.startTime} - ${activity.endTime}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #6B7280; margin-bottom: 4px;">
                <span>💰 $${activity.cost.toFixed(2)}</span>
              </div>
              <div style="font-size: 12px; color: #6B7280; margin-top: 8px;">
                📍 ${activity.address}
              </div>
              ${
                activity.bookingUrl
                  ? `<a href="${activity.bookingUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 8px; padding: 6px 12px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 500;">Book Now</a>`
                  : ''
              }
            </div>
          `

          infoWindowRef.current.setContent(content)
          infoWindowRef.current.open(mapRef.current, marker)

          if (onMarkerClick) {
            onMarkerClick(activity.id)
          }
        })

        markersRef.current.push(marker)
        bounds.extend(activity.location)
      })

      // Draw polyline connecting activities
      if (dayActivities.length > 1) {
        const path = dayActivities.map((a) => a.location)
        const polyline = new google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWeight: 3,
          map: mapRef.current,
        })
        polylinesRef.current.push(polyline)
      }
    })

    // Fit bounds to show all markers
    if (activities.length > 0) {
      mapRef.current.fitBounds(bounds)
      // Add padding
      const padding = { top: 50, right: 50, bottom: 50, left: 50 }
      mapRef.current.fitBounds(bounds, padding)
    }
  }, [activities, selectedDay, isLoaded, mapRef, onMarkerClick])

  // Recenter map
  const handleRecenter = () => {
    if (!mapRef.current || activities.length === 0) return

    const bounds = new google.maps.LatLngBounds()
    activities.forEach((activity) => {
      bounds.extend(activity.location)
    })
    mapRef.current.fitBounds(bounds)
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">Failed to load map</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'}`}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map Controls */}
      {isLoaded && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={handleRecenter}
            className="bg-white rounded-lg shadow-md p-3 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Recenter map"
            title="Recenter map"
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          <button
            onClick={toggleFullscreen}
            className="bg-white rounded-lg shadow-md p-3 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 text-gray-700" />
            ) : (
              <Maximize2 className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>
      )}

      {/* Day Legend */}
      {isLoaded && selectedDay && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Day {selectedDay}</h4>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-3 h-3 rounded-full bg-indigo-600" />
            <span>{activities.length} activities</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Made with Bob
