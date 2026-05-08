import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'
import {
  GeminiError,
  StructuredTripPlan,
  GeminiRefineResponse,
  DEFAULT_GEMINI_CONFIG,
  SYSTEM_PROMPTS,
} from '../types/gemini'
import { Itinerary, TripPreferences, ChatMessage } from '../types/trip'
import { PlaceResult } from '../types/google'
import { parseGeminiJSON, sanitizeGeminiOutput, stripMarkdown } from '../utils/sanitizer'
import { withRetry, geminiRateLimiter } from '../utils/rateLimiter'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

if (!API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY is not set in environment variables')
}

const genAI = new GoogleGenerativeAI(API_KEY)

// Zod schemas for validation
const LatLngSchema = z.object({
  lat: z.number(),
  lng: z.number(),
})

const StructuredTripPlanSchema = z.object({
  destination: z.string(),
  destinationLocation: LatLngSchema,
  startDate: z.string(),
  endDate: z.string(),
  numberOfDays: z.number(),
  travelers: z.number(),
  budgetPerDay: z.number(),
  budgetLevel: z.enum(['budget', 'mid-range', 'luxury']),
  currency: z.string(),
  interests: z.array(z.string()),
  dietaryRestrictions: z.array(z.string()),
  accommodationPreferences: z.array(z.string()),
  transportPreferences: z.array(z.string()),
  pace: z.enum(['relaxed', 'moderate', 'packed']),
  activitiesPerDay: z.number(),
  mealPreferences: z.object({
    breakfast: z.boolean(),
    lunch: z.boolean(),
    dinner: z.boolean(),
  }),
})

const ItinerarySchema = z.object({
  id: z.string(),
  destination: z.string(),
  days: z.array(z.any()), // Simplified for now
  totalBudgetEstimate: z.object({
    accommodation: z.number(),
    food: z.number(),
    activities: z.number(),
    transport: z.number(),
    miscellaneous: z.number(),
    total: z.number(),
    currency: z.string(),
  }),
  generatedAt: z.string(),
  preferences: z.any(),
})

/**
 * @deprecated This function is deprecated. Use generateItinerary() directly with TripPreferences.
 * The new approach combines preference parsing and itinerary generation into a single API call,
 * reducing RPM usage by 50%.
 */
export async function parsePreferences(
  preferences: TripPreferences
): Promise<StructuredTripPlan> {
  await geminiRateLimiter.acquire()

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: DEFAULT_GEMINI_CONFIG,
  })

  const prompt = `${SYSTEM_PROMPTS.parsePreferences}

User Preferences:
${JSON.stringify(preferences, null, 2)}

Generate the structured trip plan:`

  try {
    const result = await withRetry(async () => {
      const response = await model.generateContent(prompt)
      const text = response.response.text()
      return sanitizeGeminiOutput(text)
    })

    return parseGeminiJSON(result, StructuredTripPlanSchema)
  } catch (error) {
    if (error instanceof Error) {
      throw new GeminiError(
        `Failed to parse preferences: ${error.message}`,
        'PARSE_ERROR'
      )
    }
    throw new GeminiError('Failed to parse preferences', 'UNKNOWN_ERROR')
  }
}

export async function* generateItinerary(
  preferences: TripPreferences,
  places: PlaceResult[]
): AsyncGenerator<string, Itinerary, undefined> {
  await geminiRateLimiter.acquire()

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: DEFAULT_GEMINI_CONFIG,
  })

  const prompt = `${SYSTEM_PROMPTS.generateItineraryDirect}

User Preferences:
${JSON.stringify(preferences, null, 2)}

Available Places:
${JSON.stringify(places.slice(0, 50), null, 2)}

Generate the complete itinerary:`

  try {
    const result = await model.generateContentStream(prompt)
    let accumulatedText = ''

    for await (const chunk of result.stream) {
      const chunkText = chunk.text()
      accumulatedText += chunkText
      yield chunkText
    }

    // Parse final accumulated text
    const sanitized = sanitizeGeminiOutput(accumulatedText)
    const itinerary = parseGeminiJSON(sanitized, ItinerarySchema)
    return itinerary as Itinerary
  } catch (error) {
    if (error instanceof Error) {
      throw new GeminiError(
        `Failed to generate itinerary: ${error.message}`,
        'GENERATION_ERROR'
      )
    }
    throw new GeminiError('Failed to generate itinerary', 'UNKNOWN_ERROR')
  }
}

export async function* refineWithChat(
  message: string,
  currentItinerary: Itinerary,
  history: ChatMessage[]
): AsyncGenerator<string, GeminiRefineResponse, undefined> {
  await geminiRateLimiter.acquire()

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: DEFAULT_GEMINI_CONFIG,
  })

  // Build conversation history
  const conversationHistory = history
    .slice(-10) // Last 10 messages for context
    .map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.content,
    }))

  const prompt = `${SYSTEM_PROMPTS.refineWithChat}

Current Itinerary:
${JSON.stringify(currentItinerary, null, 2)}

User Request: ${message}

Generate the response and mutations:`

  try {
    const chat = model.startChat({
      history: conversationHistory.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.parts }],
      })),
    })

    const result = await chat.sendMessageStream(prompt)
    let accumulatedText = ''

    for await (const chunk of result.stream) {
      const chunkText = chunk.text()
      accumulatedText += chunkText
      yield chunkText
    }

    // Parse final response
    const sanitized = sanitizeGeminiOutput(accumulatedText)
    const RefineResponseSchema = z.object({
      response: z.string(),
      mutations: z.any().optional(),
    })

    const parsed = parseGeminiJSON(sanitized, RefineResponseSchema)
    return parsed as GeminiRefineResponse
  } catch (error) {
    if (error instanceof Error) {
      throw new GeminiError(
        `Failed to refine itinerary: ${error.message}`,
        'REFINE_ERROR'
      )
    }
    throw new GeminiError('Failed to refine itinerary', 'UNKNOWN_ERROR')
  }
}

export async function generateQuickSuggestion(
  destination: string,
  interests: string[]
): Promise<string> {
  await geminiRateLimiter.acquire()

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      ...DEFAULT_GEMINI_CONFIG,
      maxOutputTokens: 500,
    },
  })

  const prompt = `Generate a brief (2-3 sentences) travel suggestion for ${destination} focusing on ${interests.join(', ')}. Be enthusiastic and specific.`

  try {
    const result = await withRetry(async () => {
      const response = await model.generateContent(prompt)
      return response.response.text()
    })

    return stripMarkdown(sanitizeGeminiOutput(result))
  } catch (error) {
    return `${destination} offers amazing experiences for travelers interested in ${interests.join(', ')}!`
  }
}

export function cancelGeneration(): void {
  // Note: Gemini SDK doesn't have built-in cancellation
  // This would need to be handled at the hook level
  console.log('Generation cancellation requested')
}

// Made with Bob
