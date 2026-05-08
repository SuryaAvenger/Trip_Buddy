import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { LatLng } from '../types/trip'

interface MapContextValue {
  selectedDayIndex: number | null
  setSelectedDayIndex: (index: number | null) => void
  hoveredActivityId: string | null
  setHoveredActivityId: (id: string | null) => void
  mapCenter: LatLng | null
  setMapCenter: (center: LatLng | null) => void
  mapZoom: number
  setMapZoom: (zoom: number) => void
  showAllDays: boolean
  setShowAllDays: (show: boolean) => void
}

const MapContext = createContext<MapContextValue | undefined>(undefined)

interface MapProviderProps {
  children: ReactNode
}

export function MapProvider({ children }: MapProviderProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null)
  const [hoveredActivityId, setHoveredActivityId] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<LatLng | null>(null)
  const [mapZoom, setMapZoom] = useState<number>(13)
  const [showAllDays, setShowAllDays] = useState<boolean>(true)

  const value: MapContextValue = {
    selectedDayIndex,
    setSelectedDayIndex: useCallback((index: number | null) => {
      setSelectedDayIndex(index)
    }, []),
    hoveredActivityId,
    setHoveredActivityId: useCallback((id: string | null) => {
      setHoveredActivityId(id)
    }, []),
    mapCenter,
    setMapCenter: useCallback((center: LatLng | null) => {
      setMapCenter(center)
    }, []),
    mapZoom,
    setMapZoom: useCallback((zoom: number) => {
      setMapZoom(zoom)
    }, []),
    showAllDays,
    setShowAllDays: useCallback((show: boolean) => {
      setShowAllDays(show)
    }, []),
  }

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>
}

export function useMapContext(): MapContextValue {
  const context = useContext(MapContext)
  if (context === undefined) {
    throw new Error('useMapContext must be used within a MapProvider')
  }
  return context
}

// Made with Bob
