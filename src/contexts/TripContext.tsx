import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Itinerary, TripPreferences } from '../types/trip'

interface TripContextValue {
  itinerary: Itinerary | null
  preferences: TripPreferences | null
  setItinerary: (itinerary: Itinerary | null) => void
  setPreferences: (preferences: TripPreferences | null) => void
  updateItinerary: (updates: Partial<Itinerary>) => void
  clearTrip: () => void
}

const TripContext = createContext<TripContextValue | undefined>(undefined)

interface TripProviderProps {
  children: ReactNode
}

export function TripProvider({ children }: TripProviderProps) {
  const [itinerary, setItineraryState] = useState<Itinerary | null>(null)
  const [preferences, setPreferencesState] = useState<TripPreferences | null>(null)

  const setItinerary = useCallback((newItinerary: Itinerary | null) => {
    setItineraryState(newItinerary)
  }, [])

  const setPreferences = useCallback((newPreferences: TripPreferences | null) => {
    setPreferencesState(newPreferences)
  }, [])

  const updateItinerary = useCallback((updates: Partial<Itinerary>) => {
    setItineraryState((current) => {
      if (!current) return null
      return { ...current, ...updates }
    })
  }, [])

  const clearTrip = useCallback(() => {
    setItineraryState(null)
    setPreferencesState(null)
  }, [])

  const value: TripContextValue = {
    itinerary,
    preferences,
    setItinerary,
    setPreferences,
    updateItinerary,
    clearTrip,
  }

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}

export function useTripContext(): TripContextValue {
  const context = useContext(TripContext)
  if (context === undefined) {
    throw new Error('useTripContext must be used within a TripProvider')
  }
  return context
}

// Made with Bob
