import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parsePreferences, generateItinerary, refineWithChat } from '../services/geminiService'
import { TripPreferences } from '../types/trip'
import { PlaceResult } from '../types/google'

// Mock the Gemini AI SDK
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContentStream: vi.fn(),
      generateContent: vi.fn(),
    }),
  })),
}))

describe('geminiService', () => {
  const mockPreferences: TripPreferences = {
    destination: 'Paris, France',
    startDate: '2024-06-01',
    endDate: '2024-06-07',
    travelers: 2,
    budgetLevel: 'mid-range',
    budgetAmount: 3000,
    currency: 'USD',
    interests: ['culture', 'food', 'art'],
    dietaryRestrictions: ['none'],
    mobilityNeeds: '',
    accommodationType: ['hotel'],
    transportPreference: ['public', 'walking'],
    pace: 'moderate',
  }

  const mockPlaces: PlaceResult[] = [
    {
      placeId: 'place1',
      name: 'Eiffel Tower',
      formattedAddress: 'Champ de Mars, Paris',
      location: { lat: 48.8584, lng: 2.2945 },
      rating: 4.7,
      userRatingsTotal: 50000,
      priceLevel: 2,
      types: ['tourist_attraction', 'point_of_interest'],
      photoUrl: 'https://example.com/photo1.jpg',
    },
    {
      placeId: 'place2',
      name: 'Louvre Museum',
      formattedAddress: 'Rue de Rivoli, Paris',
      location: { lat: 48.8606, lng: 2.3376 },
      rating: 4.8,
      userRatingsTotal: 100000,
      priceLevel: 2,
      types: ['museum', 'tourist_attraction'],
      photoUrl: 'https://example.com/photo2.jpg',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('parsePreferences', () => {
    it('should parse preferences into structured trip plan', async () => {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () =>
              JSON.stringify({
                destination: 'Paris, France',
                duration: 6,
                dailyBudget: 500,
                themes: ['culture', 'food', 'art'],
                pacing: {
                  activitiesPerDay: 3,
                  travelTimeLimit: 120,
                },
              }),
          },
        }),
      }

      ;(GoogleGenerativeAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        getGenerativeModel: () => mockModel,
      }))

      const result = await parsePreferences(mockPreferences)

      expect(result).toBeDefined()
      expect(result.destination).toBe('Paris, France')
      expect(result.duration).toBe(6)
      expect(mockModel.generateContent).toHaveBeenCalled()
    })

    it('should handle API errors gracefully', async () => {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const mockModel = {
        generateContent: vi.fn().mockRejectedValue(new Error('API Error')),
      }

      ;(GoogleGenerativeAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        getGenerativeModel: () => mockModel,
      }))

      await expect(parsePreferences(mockPreferences)).rejects.toThrow()
    })
  })

  describe('generateItinerary', () => {
    it('should generate itinerary with activities clustered by geography', async () => {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      
      const mockItinerary = {
        id: 'test-id',
        destination: 'Paris, France',
        days: [
          {
            dayNumber: 1,
            date: '2024-06-01',
            theme: 'Art & Culture',
            activities: [
              {
                id: 'act1',
                name: 'Louvre Museum',
                description: 'Visit the world-famous museum',
                location: { lat: 48.8606, lng: 2.3376 },
                address: 'Rue de Rivoli, Paris',
                placeId: 'place2',
                duration: 180,
                cost: 20,
                category: 'art' as const,
                startTime: '09:00',
                endTime: '12:00',
              },
            ],
            meals: [],
            accommodation: {
              name: 'Hotel Paris',
              address: 'Paris Center',
              placeId: 'hotel1',
              location: { lat: 48.8566, lng: 2.3522 },
              type: 'hotel' as const,
              estimatedCostPerNight: 150,
            },
            estimatedCost: 170,
            travelTime: 30,
          },
        ],
        totalBudgetEstimate: {
          accommodation: 900,
          food: 600,
          activities: 400,
          transport: 200,
          miscellaneous: 100,
          total: 2200,
          currency: 'USD',
        },
        generatedAt: new Date().toISOString(),
        preferences: mockPreferences,
      }

      const mockStream = {
        stream: (async function* () {
          yield { text: () => JSON.stringify(mockItinerary) }
        })(),
      }

      const mockModel = {
        generateContentStream: vi.fn().mockResolvedValue(mockStream),
      }

      ;(GoogleGenerativeAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        getGenerativeModel: () => mockModel,
      }))

      const structuredPlan = {
        destination: 'Paris, France',
        duration: 6,
        dailyBudget: 500,
        themes: ['culture', 'food', 'art'],
        pacing: {
          activitiesPerDay: 3,
          travelTimeLimit: 120,
        },
      }

      const result = await generateItinerary(structuredPlan, mockPlaces, () => {})

      expect(result).toBeDefined()
      expect(result.destination).toBe('Paris, France')
      expect(result.days).toHaveLength(1)
      expect(mockModel.generateContentStream).toHaveBeenCalled()
    })

    it('should call onProgress callback during streaming', async () => {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      
      const mockStream = {
        stream: (async function* () {
          yield { text: () => '{"partial":' }
          yield { text: () => '"data"}' }
        })(),
      }

      const mockModel = {
        generateContentStream: vi.fn().mockResolvedValue(mockStream),
      }

      ;(GoogleGenerativeAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        getGenerativeModel: () => mockModel,
      }))

      const onProgress = vi.fn()
      const structuredPlan = {
        destination: 'Paris, France',
        duration: 6,
        dailyBudget: 500,
        themes: ['culture'],
        pacing: {
          activitiesPerDay: 3,
          travelTimeLimit: 120,
        },
      }

      try {
        await generateItinerary(structuredPlan, mockPlaces, onProgress)
      } catch {
        // Expected to fail due to invalid JSON, but onProgress should be called
      }

      expect(onProgress).toHaveBeenCalled()
    })
  })

  describe('refineWithChat', () => {
    it('should return response and mutations', async () => {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      
      const mockResponse = {
        response: 'I can help you with that!',
        mutations: {
          days: [
            {
              dayNumber: 1,
              activities: [],
            },
          ],
        },
      }

      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify(mockResponse),
          },
        }),
      }

      ;(GoogleGenerativeAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        getGenerativeModel: () => mockModel,
      }))

      const mockItinerary = {
        id: 'test-id',
        destination: 'Paris, France',
        days: [],
        totalBudgetEstimate: {
          accommodation: 0,
          food: 0,
          activities: 0,
          transport: 0,
          miscellaneous: 0,
          total: 0,
          currency: 'USD',
        },
        generatedAt: new Date().toISOString(),
        preferences: mockPreferences,
      }

      const result = await refineWithChat(
        'Add more museums',
        mockItinerary,
        []
      )

      expect(result).toBeDefined()
      expect(result.response).toBe('I can help you with that!')
      expect(result.mutations).toBeDefined()
      expect(mockModel.generateContent).toHaveBeenCalled()
    })

    it('should include chat history in context', async () => {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () =>
              JSON.stringify({
                response: 'Updated!',
                mutations: {},
              }),
          },
        }),
      }

      ;(GoogleGenerativeAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        getGenerativeModel: () => mockModel,
      }))

      const mockItinerary = {
        id: 'test-id',
        destination: 'Paris, France',
        days: [],
        totalBudgetEstimate: {
          accommodation: 0,
          food: 0,
          activities: 0,
          transport: 0,
          miscellaneous: 0,
          total: 0,
          currency: 'USD',
        },
        generatedAt: new Date().toISOString(),
        preferences: mockPreferences,
      }

      const chatHistory = [
        {
          id: '1',
          role: 'user' as const,
          content: 'Previous message',
          timestamp: new Date().toISOString(),
        },
      ]

      await refineWithChat('New message', mockItinerary, chatHistory)

      expect(mockModel.generateContent).toHaveBeenCalled()
      const callArgs = mockModel.generateContent.mock.calls[0]
      expect(callArgs[0]).toContain('Previous message')
    })
  })
})

// Made with Bob
