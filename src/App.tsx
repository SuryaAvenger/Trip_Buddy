import React, { useState, useEffect } from 'react'
import { TripProvider, useTripContext } from '@/contexts/TripContext'
import { ChatProvider } from '@/contexts/ChatContext'
import { MapProvider } from '@/contexts/MapContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import { PreferenceForm } from '@/components/onboarding/PreferenceForm'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { ItineraryView } from '@/components/itinerary/ItineraryView'
import { MapView } from '@/components/map/MapView'
import { ExportPanel } from '@/components/export/ExportPanel'
import { TripPreferences } from '@/types/trip'
import { useGemini } from '@/hooks/useGemini'
import { useDirections } from '@/hooks/useDirections'
import { geocodeAddress } from '@/services/geocodingService'
import { searchNearbyPlaces } from '@/services/placesService'
import { Loader2 } from 'lucide-react'

function AppContent() {
  const { itinerary, setItinerary } = useTripContext()
  const { generateItinerary, isLoading: isGenerating, error: geminiError } = useGemini()
  const { optimizeActivities } = useDirections()
  const [isInitializing, setIsInitializing] = useState(false)
  const [selectedDay, setSelectedDay] = useState(1)
  const [generationProgress, setGenerationProgress] = useState('')

  // Handle preference form submission
  const handlePreferencesSubmit = async (preferences: TripPreferences) => {
    setIsInitializing(true)
    setGenerationProgress('Finding your destination...')

    try {
      // Step 1: Geocode destination
      const destinationLocation = await geocodeAddress(preferences.destination)

      // Step 2: Search for places based on interests
      setGenerationProgress('Discovering amazing places...')
      const allPlaces = []
      for (const interest of preferences.interests) {
        const places = await searchNearbyPlaces(
          destinationLocation,
          interest,
          10000 // 10km radius
        )
        allPlaces.push(...places)
      }

      // Step 3: Generate itinerary with Gemini (single API call - optimized!)
      setGenerationProgress('Creating your personalized itinerary...')
      const generatedItinerary = await generateItinerary(preferences, allPlaces)

      if (!generatedItinerary) {
        throw new Error('Failed to generate itinerary')
      }

      // Step 4: Set the itinerary (skip route optimization due to CORS)
      // The Gemini-generated itinerary already has optimized routes
      setGenerationProgress('Finalizing your itinerary...')
      setItinerary(generatedItinerary)
      setGenerationProgress('Your trip is ready!')
    } catch (error) {
      console.error('Failed to generate itinerary:', error)
      
      // Show user-friendly error message
      let errorMessage = 'Failed to generate itinerary. Please try again.'
      
      if (error instanceof Error) {
        if (error.message.includes('503') || error.message.includes('high demand')) {
          errorMessage = 'The AI service is experiencing high demand. Please wait a moment and try again.'
        } else if (error.message.includes('404')) {
          errorMessage = 'AI model not available. Please check your configuration.'
        } else if (error.message.includes('API key')) {
          errorMessage = 'API key issue. Please check your configuration.'
        }
      }
      
      setGenerationProgress(errorMessage)
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setGenerationProgress('')
        setIsInitializing(false)
      }, 5000)
    } finally {
      // Don't set to false immediately if there's an error message showing
      if (!generationProgress.includes('Failed') && !generationProgress.includes('experiencing')) {
        setIsInitializing(false)
      }
    }
  }

  // Handle activity reordering
  const handleActivityReorder = async (
    dayNumber: number,
    activityId: string,
    direction: 'up' | 'down'
  ) => {
    if (!itinerary) return

    const dayIndex = itinerary.days.findIndex((d) => d.dayNumber === dayNumber)
    if (dayIndex === -1) return

    const day = itinerary.days[dayIndex]
    const activityIndex = day.activities.findIndex((a) => a.id === activityId)
    if (activityIndex === -1) return

    const newActivities = [...day.activities]
    const targetIndex = direction === 'up' ? activityIndex - 1 : activityIndex + 1

    if (targetIndex < 0 || targetIndex >= newActivities.length) return

    // Swap activities
    ;[newActivities[activityIndex], newActivities[targetIndex]] = [
      newActivities[targetIndex],
      newActivities[activityIndex],
    ]

    // Optimize route with new order
    const optimizedActivities = await optimizeActivities(newActivities)

    const updatedDays = [...itinerary.days]
    updatedDays[dayIndex] = {
      ...day,
      activities: optimizedActivities,
    }

    setItinerary({
      ...itinerary,
      days: updatedDays,
    })
  }

  // Show onboarding if no itinerary
  if (!itinerary) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50">
        <div className="w-full max-w-4xl px-6">
          {isInitializing || isGenerating ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Creating Your Perfect Trip
              </h2>
              <p className="text-gray-600 mb-6">{generationProgress}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full animate-pulse w-3/4" />
              </div>
              {geminiError && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{geminiError}</p>
                </div>
              )}
            </div>
          ) : (
            <PreferenceForm onSubmit={handlePreferencesSubmit} />
          )}
        </div>
      </div>
    )
  }

  // Main app with 3-panel layout
  const currentDayActivities = itinerary.days.find((d) => d.dayNumber === selectedDay)?.activities || []

  return (
    <AppShell>
      <div className="h-full flex">
        {/* Left Panel: Chat */}
        <div className="w-96 border-r border-gray-200 flex flex-col bg-white">
          <div className="flex-1 overflow-hidden">
            <ChatPanel />
          </div>
          <div className="border-t border-gray-200 p-4">
            <ExportPanel itinerary={itinerary} />
          </div>
        </div>

        {/* Center Panel: Itinerary */}
        <div className="flex-1 overflow-hidden">
          <ItineraryView
            itinerary={itinerary}
            onActivityReorder={handleActivityReorder}
          />
        </div>

        {/* Right Panel: Map */}
        <div className="w-[500px] border-l border-gray-200">
          <MapView
            activities={currentDayActivities}
            selectedDay={selectedDay}
            onMarkerClick={(activityId) => {
              console.log('Marker clicked:', activityId)
            }}
          />
        </div>
      </div>
    </AppShell>
  )
}

function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <ChatProvider>
          <MapProvider>
            <AppContent />
          </MapProvider>
        </ChatProvider>
      </TripProvider>
    </AuthProvider>
  )
}

export default App

// Made with Bob
