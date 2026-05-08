import { Itinerary, TripPreferences, Activity, LatLng } from './trip'
import { PlaceResult } from './google'

export interface StructuredTripPlan {
  destination: string
  destinationLocation: LatLng
  startDate: string
  endDate: string
  numberOfDays: number
  travelers: number
  budgetPerDay: number
  budgetLevel: 'budget' | 'mid-range' | 'luxury'
  currency: string
  interests: string[]
  dietaryRestrictions: string[]
  accommodationPreferences: string[]
  transportPreferences: string[]
  pace: 'relaxed' | 'moderate' | 'packed'
  activitiesPerDay: number
  mealPreferences: {
    breakfast: boolean
    lunch: boolean
    dinner: boolean
  }
}

export interface GeminiStreamChunk {
  text: string
  done: boolean
}

export interface GeminiGenerateRequest {
  preferences: TripPreferences
  places: PlaceResult[]
}

export interface GeminiRefineRequest {
  message: string
  currentItinerary: Itinerary
  conversationHistory: Array<{
    role: 'user' | 'model'
    parts: string
  }>
}

export interface GeminiRefineResponse {
  response: string
  mutations?: Partial<Itinerary>
  updatedActivities?: Activity[]
}

export interface GeminiPromptConfig {
  temperature: number
  topK: number
  topP: number
  maxOutputTokens: number
}

export const DEFAULT_GEMINI_CONFIG: GeminiPromptConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 32768, // Increased to allow complete itinerary generation
}

export class GeminiError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryAfter?: number
  ) {
    super(message)
    this.name = 'GeminiError'
  }
}

export class ParseError extends Error {
  constructor(
    message: string,
    public originalText: string
  ) {
    super(message)
    this.name = 'ParseError'
  }
}

export interface GeminiServiceConfig {
  apiKey: string
  model: string
  config: GeminiPromptConfig
}

export const SYSTEM_PROMPTS = {
  parsePreferences: `You are a travel planning expert. Parse user preferences into a structured trip plan.
Return ONLY valid JSON matching this exact schema:
{
  "destination": string,
  "destinationLocation": {"lat": number, "lng": number},
  "startDate": string (ISO format),
  "endDate": string (ISO format),
  "numberOfDays": number,
  "travelers": number,
  "budgetPerDay": number,
  "budgetLevel": "budget" | "mid-range" | "luxury",
  "currency": string,
  "interests": string[],
  "dietaryRestrictions": string[],
  "accommodationPreferences": string[],
  "transportPreferences": string[],
  "pace": "relaxed" | "moderate" | "packed",
  "activitiesPerDay": number (2-3 for relaxed, 4-5 for moderate, 6-8 for packed),
  "mealPreferences": {"breakfast": boolean, "lunch": boolean, "dinner": boolean}
}

Calculate budgetPerDay by dividing total budget by number of days.
Determine activitiesPerDay based on pace preference.
Include all meal types in mealPreferences.
Do not include any explanatory text, only the JSON object.`,

  generateItineraryDirect: `You are a travel planning expert. Generate a detailed multi-day itinerary directly from user preferences.

STEP 1: ANALYZE USER PREFERENCES
- Parse the destination, dates, budget, interests, and constraints
- Calculate budgetPerDay by dividing total budget by number of days
- Determine activitiesPerDay based on pace: relaxed (2-3), moderate (4-5), packed (6-8)
- Identify dietary restrictions and accommodation preferences

STEP 2: APPLY OPTIMIZATION RULES
1. Minimize travel time between consecutive activities (cluster by geography)
2. Respect meal times: breakfast 7-9am, lunch 12-2pm, dinner 6-9pm
3. Match budget level strictly - budget: $, mid-range: $$, luxury: $$$-$$$$
4. Include realistic time estimates (activities: 1-3 hours, meals: 1-1.5 hours)
5. Leave buffer time between activities (15-30 minutes for travel)
6. Balance activity intensity throughout the day
7. Consider opening hours and typical visit durations
8. Use provided places data to populate activities with real locations

STEP 3: GENERATE COMPLETE ITINERARY
Return ONLY valid JSON matching the Itinerary schema with this structure:
{
  "id": string (generate UUID),
  "destination": string,
  "days": [
    {
      "dayNumber": number,
      "date": string (ISO format),
      "theme": string (e.g., "Cultural Exploration", "Nature & Adventure"),
      "activities": [
        {
          "id": string (UUID),
          "name": string,
          "description": string (2-3 sentences),
          "location": {"lat": number, "lng": number},
          "address": string,
          "placeId": string (from provided places),
          "duration": number (minutes),
          "cost": number,
          "category": string (from interests),
          "startTime": string (HH:mm format),
          "endTime": string (HH:mm format),
          "bookingUrl": string (optional),
          "rating": number (optional),
          "photoUrl": string (optional)
        }
      ],
      "meals": [
        {
          "id": string (UUID),
          "name": string (meal name),
          "type": "breakfast" | "lunch" | "dinner" | "snack",
          "restaurantName": string,
          "address": string,
          "placeId": string,
          "location": {"lat": number, "lng": number},
          "cuisineType": string,
          "priceRange": "$" | "$$" | "$$$" | "$$$$",
          "estimatedCost": number,
          "rating": number (optional)
        }
      ],
      "accommodation": {
        "name": string,
        "address": string,
        "placeId": string,
        "location": {"lat": number, "lng": number},
        "type": string,
        "estimatedCostPerNight": number,
        "rating": number (optional)
      },
      "estimatedCost": number (sum of all costs for the day),
      "travelTime": number (total minutes of travel between activities)
    }
  ],
  "totalBudgetEstimate": {
    "accommodation": number,
    "food": number,
    "activities": number,
    "transport": number,
    "miscellaneous": number,
    "total": number,
    "currency": string
  },
  "generatedAt": string (ISO timestamp),
  "preferences": object (original preferences)
}

Do not include any explanatory text, only the JSON object.`,

  generateItinerary: `You are a travel planning expert. Generate a detailed multi-day itinerary.

OPTIMIZATION RULES:
1. Minimize travel time between consecutive activities (cluster by geography)
2. Respect meal times: breakfast 7-9am, lunch 12-2pm, dinner 6-9pm
3. Match budget level strictly - budget: $, mid-range: $$, luxury: $$$-$$$$
4. Include realistic time estimates (activities: 1-3 hours, meals: 1-1.5 hours)
5. Leave buffer time between activities (15-30 minutes for travel)
6. Balance activity intensity throughout the day
7. Consider opening hours and typical visit durations

Return ONLY valid JSON matching the Itinerary schema with this structure:
{
  "id": string (generate UUID),
  "destination": string,
  "days": [
    {
      "dayNumber": number,
      "date": string (ISO format),
      "theme": string (e.g., "Cultural Exploration", "Nature & Adventure"),
      "activities": [
        {
          "id": string (UUID),
          "name": string,
          "description": string (2-3 sentences),
          "location": {"lat": number, "lng": number},
          "address": string,
          "placeId": string (from provided places),
          "duration": number (minutes),
          "cost": number,
          "category": string (from interests),
          "startTime": string (HH:mm format),
          "endTime": string (HH:mm format),
          "bookingUrl": string (optional),
          "rating": number (optional),
          "photoUrl": string (optional)
        }
      ],
      "meals": [
        {
          "id": string (UUID),
          "name": string (meal name),
          "type": "breakfast" | "lunch" | "dinner" | "snack",
          "restaurantName": string,
          "address": string,
          "placeId": string,
          "location": {"lat": number, "lng": number},
          "cuisineType": string,
          "priceRange": "$" | "$$" | "$$$" | "$$$$",
          "estimatedCost": number,
          "rating": number (optional)
        }
      ],
      "accommodation": {
        "name": string,
        "address": string,
        "placeId": string,
        "location": {"lat": number, "lng": number},
        "type": string,
        "estimatedCostPerNight": number,
        "rating": number (optional)
      },
      "estimatedCost": number (sum of all costs for the day),
      "travelTime": number (total minutes of travel between activities)
    }
  ],
  "totalBudgetEstimate": {
    "accommodation": number,
    "food": number,
    "activities": number,
    "transport": number,
    "miscellaneous": number,
    "total": number,
    "currency": string
  },
  "generatedAt": string (ISO timestamp),
  "preferences": object (original preferences)
}

Do not include any explanatory text, only the JSON object.`,

  refineWithChat: `You are a helpful travel assistant. The user wants to modify their itinerary.

INSTRUCTIONS:
1. Understand the user's request (add/remove/modify activities, change times, adjust budget, etc.)
2. Make minimal necessary changes to the itinerary
3. Maintain logical flow and timing
4. Keep total budget within constraints
5. Preserve geographic clustering when possible

Return ONLY valid JSON with this structure:
{
  "response": string (friendly explanation of changes made),
  "mutations": {
    // Include only the fields that changed
    // Use same structure as Itinerary type
    // Can include partial updates to specific days or activities
  }
}

Examples of mutations:
- To update a specific day: {"days": [{"dayNumber": 2, "activities": [...updated activities]}]}
- To change budget: {"totalBudgetEstimate": {...updated breakdown}}
- To add an activity: Include the full updated day with new activity inserted

Do not include any explanatory text outside the JSON object.`,
}

// Made with Bob
