import { useState, useCallback, useRef } from 'react'
import { generateItinerary, refineWithChat } from '../services/geminiService'
import { TripPreferences, Itinerary, ChatMessage } from '../types/trip'
import { PlaceResult } from '../types/google'
import { GeminiError } from '../types/gemini'

interface UseGeminiReturn {
  generateItinerary: (
    preferences: TripPreferences,
    places: PlaceResult[]
  ) => Promise<Itinerary | null>
  refineItinerary: (
    message: string,
    currentItinerary: Itinerary,
    history: ChatMessage[]
  ) => Promise<{ response: string; mutations: Partial<Itinerary> } | null>
  isLoading: boolean
  error: string | null
  streamingText: string
  cancel: () => void
}

export function useGemini(): UseGeminiReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [streamingText, setStreamingText] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsLoading(false)
      setStreamingText('')
    }
  }, [])

  const generateItineraryCallback = useCallback(
    async (
      preferences: TripPreferences,
      places: PlaceResult[]
    ): Promise<Itinerary | null> => {
      setIsLoading(true)
      setError(null)
      setStreamingText('')
      abortControllerRef.current = new AbortController()

      try {
        // Generate itinerary directly from preferences with streaming
        const generator = generateItinerary(preferences, places)
        let fullText = ''
        let itinerary: Itinerary | null = null

        for await (const chunk of generator) {
          if (abortControllerRef.current?.signal.aborted) {
            return null
          }
          
          // Check if this is the final result (Itinerary object) or a chunk (string)
          if (typeof chunk === 'string') {
            fullText += chunk
            setStreamingText(fullText)
          } else {
            // This is the final itinerary
            itinerary = chunk as Itinerary
          }
        }

        setIsLoading(false)
        setStreamingText('')
        return itinerary
      } catch (err) {
        if (abortControllerRef.current?.signal.aborted) {
          return null
        }

        const errorMessage =
          err instanceof GeminiError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Failed to generate itinerary'

        setError(errorMessage)
        setIsLoading(false)
        setStreamingText('')
        return null
      }
    },
    []
  )

  const refineItineraryCallback = useCallback(
    async (
      message: string,
      currentItinerary: Itinerary,
      history: ChatMessage[]
    ): Promise<{ response: string; mutations: Partial<Itinerary> } | null> => {
      setIsLoading(true)
      setError(null)
      setStreamingText('')
      abortControllerRef.current = new AbortController()

      try {
        const generator = refineWithChat(message, currentItinerary, history)
        let fullText = ''
        let result: { response: string; mutations: Partial<Itinerary> } | null = null

        for await (const chunk of generator) {
          if (abortControllerRef.current?.signal.aborted) {
            return null
          }
          
          // Check if this is the final result or a chunk
          if (typeof chunk === 'string') {
            fullText += chunk
            setStreamingText(fullText)
          } else {
            // This is the final response
            result = chunk
          }
        }

        setIsLoading(false)
        setStreamingText('')
        return result
      } catch (err) {
        if (abortControllerRef.current?.signal.aborted) {
          return null
        }

        const errorMessage =
          err instanceof GeminiError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Failed to refine itinerary'

        setError(errorMessage)
        setIsLoading(false)
        setStreamingText('')
        return null
      }
    },
    []
  )

  return {
    generateItinerary: generateItineraryCallback,
    refineItinerary: refineItineraryCallback,
    isLoading,
    error,
    streamingText,
    cancel,
  }
}

// Made with Bob
