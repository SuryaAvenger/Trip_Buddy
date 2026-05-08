import { TripPreferences, ValidationResult } from '../types/trip'

export function validatePreferences(prefs: Partial<TripPreferences>): ValidationResult {
  const errors: Partial<Record<keyof TripPreferences, string>> = {}

  // Validate destination
  if (!prefs.destination || prefs.destination.trim().length === 0) {
    errors.destination = 'Destination is required'
  } else if (prefs.destination.length > 200) {
    errors.destination = 'Destination name is too long'
  }

  // Validate dates
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (!prefs.startDate) {
    errors.startDate = 'Start date is required'
  } else {
    const startDate = new Date(prefs.startDate)
    startDate.setHours(0, 0, 0, 0)

    if (isNaN(startDate.getTime())) {
      errors.startDate = 'Invalid start date'
    } else if (startDate < today) {
      errors.startDate = 'Start date cannot be in the past'
    }
  }

  if (!prefs.endDate) {
    errors.endDate = 'End date is required'
  } else {
    const endDate = new Date(prefs.endDate)
    endDate.setHours(0, 0, 0, 0)

    if (isNaN(endDate.getTime())) {
      errors.endDate = 'Invalid end date'
    } else if (prefs.startDate) {
      const startDate = new Date(prefs.startDate)
      startDate.setHours(0, 0, 0, 0)

      if (endDate <= startDate) {
        errors.endDate = 'End date must be after start date'
      }

      // Calculate trip duration
      const durationMs = endDate.getTime() - startDate.getTime()
      const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24))

      if (durationDays > 30) {
        errors.endDate = 'Trip duration cannot exceed 30 days'
      }

      if (durationDays < 1) {
        errors.endDate = 'Trip must be at least 1 day'
      }
    }
  }

  // Validate travelers
  if (prefs.travelers === undefined || prefs.travelers === null) {
    errors.travelers = 'Number of travelers is required'
  } else if (prefs.travelers < 1) {
    errors.travelers = 'At least 1 traveler is required'
  } else if (prefs.travelers > 20) {
    errors.travelers = 'Maximum 20 travelers allowed'
  } else if (!Number.isInteger(prefs.travelers)) {
    errors.travelers = 'Number of travelers must be a whole number'
  }

  // Validate budget level
  if (!prefs.budgetLevel) {
    errors.budgetLevel = 'Budget level is required'
  } else if (!['budget', 'mid-range', 'luxury'].includes(prefs.budgetLevel)) {
    errors.budgetLevel = 'Invalid budget level'
  }

  // Validate budget amount
  if (prefs.budgetAmount === undefined || prefs.budgetAmount === null) {
    errors.budgetAmount = 'Budget amount is required'
  } else if (prefs.budgetAmount <= 0) {
    errors.budgetAmount = 'Budget must be greater than 0'
  } else if (prefs.budgetAmount > 1000000) {
    errors.budgetAmount = 'Budget amount is too large'
  }

  // Validate currency
  if (!prefs.currency) {
    errors.currency = 'Currency is required'
  } else if (prefs.currency.length !== 3) {
    errors.currency = 'Currency must be a 3-letter code (e.g., USD, EUR)'
  }

  // Validate interests
  if (!prefs.interests || prefs.interests.length === 0) {
    errors.interests = 'At least one interest is required'
  } else if (prefs.interests.length > 9) {
    errors.interests = 'Maximum 9 interests allowed'
  }

  // Validate dietary restrictions (optional, but validate if provided)
  if (prefs.dietaryRestrictions && prefs.dietaryRestrictions.length > 5) {
    errors.dietaryRestrictions = 'Maximum 5 dietary restrictions allowed'
  }

  // Validate accommodation type
  if (!prefs.accommodationType || prefs.accommodationType.length === 0) {
    errors.accommodationType = 'At least one accommodation type is required'
  }

  // Validate transport preference
  if (!prefs.transportPreference || prefs.transportPreference.length === 0) {
    errors.transportPreference = 'At least one transport preference is required'
  }

  // Validate pace
  if (!prefs.pace) {
    errors.pace = 'Trip pace is required'
  } else if (!['relaxed', 'moderate', 'packed'].includes(prefs.pace)) {
    errors.pace = 'Invalid trip pace'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateURL(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

export function validateDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false
  }

  return end > start
}

export function validatePhoneNumber(phone: string): boolean {
  // Basic phone validation - at least 10 digits
  const digitsOnly = phone.replace(/\D/g, '')
  return digitsOnly.length >= 10 && digitsOnly.length <= 15
}

export function validateCurrency(currency: string): boolean {
  const validCurrencies = [
    'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY',
    'INR', 'MXN', 'BRL', 'ZAR', 'NZD', 'SGD', 'HKD', 'SEK',
    'NOK', 'DKK', 'PLN', 'THB', 'IDR', 'MYR', 'PHP', 'AED',
  ]
  return validCurrencies.includes(currency.toUpperCase())
}

export function validateBudgetAmount(amount: number, currency: string): boolean {
  if (amount <= 0) return false

  // Set reasonable limits based on currency
  const limits: Record<string, number> = {
    USD: 100000,
    EUR: 100000,
    GBP: 100000,
    JPY: 10000000,
    INR: 10000000,
    // Add more as needed
  }

  const limit = limits[currency] || 100000
  return amount <= limit
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

export function isValidLatLng(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

export function validateTripDuration(startDate: string, endDate: string): {
  valid: boolean
  days: number
  error?: string
} {
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, days: 0, error: 'Invalid date format' }
  }

  if (end <= start) {
    return { valid: false, days: 0, error: 'End date must be after start date' }
  }

  const durationMs = end.getTime() - start.getTime()
  const days = Math.ceil(durationMs / (1000 * 60 * 60 * 24))

  if (days > 30) {
    return { valid: false, days, error: 'Trip duration cannot exceed 30 days' }
  }

  if (days < 1) {
    return { valid: false, days, error: 'Trip must be at least 1 day' }
  }

  return { valid: true, days }
}

// Made with Bob
