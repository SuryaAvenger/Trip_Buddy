import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useGemini } from '../hooks/useGemini'

// Mock the geminiService
vi.mock('../services/geminiService', () => ({
  parsePreferences: vi.fn(),
  generateItinerary: vi.fn(),
  refineWithChat: vi.fn(),
}))

describe('useGemini', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useGemini())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.streamingText).toBe('')
  })

  it('should set loading state during generation', async () => {
    const { parsePreferences } = await import('../services/geminiService')
    
    ;(parsePreferences as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    const { result } = renderHook(() => useGemini())

    const mockPreferences = {
      destination: 'Paris',
      startDate: '2024-06-01',
      endDate: '2024-06-07',
      travelers: 2,
      budgetLevel: 'mid-range' as const,
      budgetAmount: 3000,
      currency: 'USD',
      interests: ['culture' as const],
      dietaryRestrictions: ['none' as const],
      mobilityNeeds: '',
      accommodationType: ['hotel' as const],
      transportPreference: ['public' as const],
      pace: 'moderate' as const,
    }

    result.current.generateItinerary(mockPreferences, [])

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true)
    })
  })

  it('should handle errors correctly', async () => {
    const { parsePreferences } = await import('../services/geminiService')
    
    const testError = new Error('API Error')
    ;(parsePreferences as ReturnType<typeof vi.fn>).mockRejectedValue(testError)

    const { result } = renderHook(() => useGemini())

    const mockPreferences = {
      destination: 'Paris',
      startDate: '2024-06-01',
      endDate: '2024-06-07',
      travelers: 2,
      budgetLevel: 'mid-range' as const,
      budgetAmount: 3000,
      currency: 'USD',
      interests: ['culture' as const],
      dietaryRestrictions: ['none' as const],
      mobilityNeeds: '',
      accommodationType: ['hotel' as const],
      transportPreference: ['public' as const],
      pace: 'moderate' as const,
    }

    await result.current.generateItinerary(mockPreferences, [])

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should clear error when starting new generation', async () => {
    const { parsePreferences } = await import('../services/geminiService')
    
    ;(parsePreferences as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValueOnce({
        destination: 'Paris',
        destinationLocation: { lat: 48.8566, lng: 2.3522 },
        startDate: '2024-06-01',
        endDate: '2024-06-07',
        numberOfDays: 6,
        travelers: 2,
        budgetPerDay: 500,
        budgetLevel: 'mid-range' as const,
        currency: 'USD',
        interests: ['culture'],
        dietaryRestrictions: [],
        accommodationPreferences: ['hotel'],
        transportPreferences: ['public'],
        pace: 'moderate' as const,
        activitiesPerDay: 3,
        mealPreferences: {
          breakfast: true,
          lunch: true,
          dinner: true,
        },
      })

    const { result } = renderHook(() => useGemini())

    const mockPreferences = {
      destination: 'Paris',
      startDate: '2024-06-01',
      endDate: '2024-06-07',
      travelers: 2,
      budgetLevel: 'mid-range' as const,
      budgetAmount: 3000,
      currency: 'USD',
      interests: ['culture' as const],
      dietaryRestrictions: ['none' as const],
      mobilityNeeds: '',
      accommodationType: ['hotel' as const],
      transportPreference: ['public' as const],
      pace: 'moderate' as const,
    }

    // First call - should error
    await result.current.generateItinerary(mockPreferences, [])
    await waitFor(() => expect(result.current.error).toBeTruthy())

    // Second call - should clear error
    result.current.generateItinerary(mockPreferences, [])
    await waitFor(() => expect(result.current.error).toBeNull())
  })

  it('should update streaming text during generation', async () => {
    const { generateItinerary } = await import('../services/geminiService')
    
    async function* mockGenerator() {
      yield 'chunk1'
      yield 'chunk2'
      yield 'chunk3'
      return {
        id: 'test-id',
        destination: 'Paris',
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
        preferences: {} as any,
      }
    }

    ;(generateItinerary as ReturnType<typeof vi.fn>).mockReturnValue(mockGenerator())

    const { result } = renderHook(() => useGemini())

    const mockPreferences = {
      destination: 'Paris',
      startDate: '2024-06-01',
      endDate: '2024-06-07',
      travelers: 2,
      budgetLevel: 'mid-range' as const,
      budgetAmount: 3000,
      currency: 'USD',
      interests: ['culture' as const],
      dietaryRestrictions: ['none' as const],
      mobilityNeeds: '',
      accommodationType: ['hotel' as const],
      transportPreference: ['public' as const],
      pace: 'moderate' as const,
    }

    result.current.generateItinerary(mockPreferences, [])

    await waitFor(() => {
      expect(result.current.streamingText.length).toBeGreaterThan(0)
    }, { timeout: 2000 })
  })

  it('should allow cancellation of in-flight requests', async () => {
    const { parsePreferences } = await import('../services/geminiService')
    
    ;(parsePreferences as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 5000))
    )

    const { result } = renderHook(() => useGemini())

    const mockPreferences = {
      destination: 'Paris',
      startDate: '2024-06-01',
      endDate: '2024-06-07',
      travelers: 2,
      budgetLevel: 'mid-range' as const,
      budgetAmount: 3000,
      currency: 'USD',
      interests: ['culture' as const],
      dietaryRestrictions: ['none' as const],
      mobilityNeeds: '',
      accommodationType: ['hotel' as const],
      transportPreference: ['public' as const],
      pace: 'moderate' as const,
    }

    result.current.generateItinerary(mockPreferences, [])

    await waitFor(() => expect(result.current.isLoading).toBe(true))

    result.current.cancel()

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })
})

// Made with Bob
