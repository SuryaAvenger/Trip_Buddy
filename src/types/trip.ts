export interface TripPreferences {
  destination: string
  startDate: string
  endDate: string
  travelers: number
  budgetLevel: 'budget' | 'mid-range' | 'luxury'
  budgetAmount: number
  currency: string
  interests: Interest[]
  dietaryRestrictions: DietaryRestriction[]
  mobilityNeeds: string
  accommodationType: AccommodationType[]
  transportPreference: TransportMode[]
  pace: 'relaxed' | 'moderate' | 'packed'
}

export type Interest =
  | 'culture'
  | 'food'
  | 'nature'
  | 'adventure'
  | 'shopping'
  | 'nightlife'
  | 'history'
  | 'art'
  | 'wellness'

export type DietaryRestriction =
  | 'vegetarian'
  | 'vegan'
  | 'halal'
  | 'kosher'
  | 'gluten-free'
  | 'nut-allergy'
  | 'none'

export type AccommodationType = 'hotel' | 'hostel' | 'airbnb' | 'resort' | 'boutique'
export type TransportMode = 'walking' | 'public' | 'taxi' | 'rental-car' | 'cycling'

export interface Itinerary {
  id: string
  destination: string
  days: ItineraryDay[]
  totalBudgetEstimate: BudgetBreakdown
  generatedAt: string
  preferences: TripPreferences
}

export interface ItineraryDay {
  dayNumber: number
  date: string
  theme: string
  activities: Activity[]
  meals: Meal[]
  accommodation: Accommodation
  estimatedCost: number
  travelTime: number
}

export interface Activity {
  id: string
  name: string
  description: string
  location: LatLng
  address: string
  placeId: string
  duration: number
  cost: number
  category: Interest
  startTime: string
  endTime: string
  bookingUrl?: string
  rating?: number
  photoUrl?: string
}

export interface Meal {
  id: string
  name: string
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  restaurantName: string
  address: string
  placeId: string
  location: LatLng
  cuisineType: string
  priceRange: '$' | '$$' | '$$$' | '$$$$'
  estimatedCost: number
  rating?: number
}

export interface Accommodation {
  name: string
  address: string
  placeId: string
  location: LatLng
  type: AccommodationType
  estimatedCostPerNight: number
  rating?: number
}

export interface BudgetBreakdown {
  accommodation: number
  food: number
  activities: number
  transport: number
  miscellaneous: number
  total: number
  currency: string
}

export interface LatLng {
  lat: number
  lng: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  itineraryMutation?: Partial<Itinerary>
}

export interface ValidationResult {
  valid: boolean
  errors: Partial<Record<keyof TripPreferences, string>>
}

// Made with Bob
