import { describe, it, expect } from 'vitest'
import { validatePreferences, validateTripDuration, validateCurrency } from '../utils/validators'
import { TripPreferences } from '../types/trip'

describe('validatePreferences', () => {
  const validPreferences: Partial<TripPreferences> = {
    destination: 'Paris, France',
    startDate: '2024-06-01',
    endDate: '2024-06-07',
    travelers: 2,
    budgetLevel: 'mid-range',
    budgetAmount: 3000,
    currency: 'USD',
    interests: ['culture', 'food'],
    dietaryRestrictions: ['none'],
    accommodationType: ['hotel'],
    transportPreference: ['public'],
    pace: 'moderate',
  }

  it('should validate correct preferences', () => {
    const result = validatePreferences(validPreferences)
    expect(result.valid).toBe(true)
    expect(Object.keys(result.errors)).toHaveLength(0)
  })

  it('should reject empty destination', () => {
    const prefs = { ...validPreferences, destination: '' }
    const result = validatePreferences(prefs)
    expect(result.valid).toBe(false)
    expect(result.errors.destination).toBeDefined()
  })

  it('should reject past start date', () => {
    const prefs = { ...validPreferences, startDate: '2020-01-01' }
    const result = validatePreferences(prefs)
    expect(result.valid).toBe(false)
    expect(result.errors.startDate).toBeDefined()
  })

  it('should reject end date before start date', () => {
    const prefs = {
      ...validPreferences,
      startDate: '2024-06-10',
      endDate: '2024-06-05',
    }
    const result = validatePreferences(prefs)
    expect(result.valid).toBe(false)
    expect(result.errors.endDate).toBeDefined()
  })

  it('should reject trips longer than 30 days', () => {
    const prefs = {
      ...validPreferences,
      startDate: '2024-06-01',
      endDate: '2024-08-01',
    }
    const result = validatePreferences(prefs)
    expect(result.valid).toBe(false)
    expect(result.errors.endDate).toBeDefined()
  })

  it('should reject invalid number of travelers', () => {
    const prefs = { ...validPreferences, travelers: 0 }
    const result = validatePreferences(prefs)
    expect(result.valid).toBe(false)
    expect(result.errors.travelers).toBeDefined()
  })

  it('should reject too many travelers', () => {
    const prefs = { ...validPreferences, travelers: 25 }
    const result = validatePreferences(prefs)
    expect(result.valid).toBe(false)
    expect(result.errors.travelers).toBeDefined()
  })

  it('should reject negative budget', () => {
    const prefs = { ...validPreferences, budgetAmount: -100 }
    const result = validatePreferences(prefs)
    expect(result.valid).toBe(false)
    expect(result.errors.budgetAmount).toBeDefined()
  })

  it('should reject invalid currency code', () => {
    const prefs = { ...validPreferences, currency: 'INVALID' }
    const result = validatePreferences(prefs)
    expect(result.valid).toBe(false)
    expect(result.errors.currency).toBeDefined()
  })

  it('should reject empty interests', () => {
    const prefs = { ...validPreferences, interests: [] }
    const result = validatePreferences(prefs)
    expect(result.valid).toBe(false)
    expect(result.errors.interests).toBeDefined()
  })

  it('should reject empty accommodation types', () => {
    const prefs = { ...validPreferences, accommodationType: [] }
    const result = validatePreferences(prefs)
    expect(result.valid).toBe(false)
    expect(result.errors.accommodationType).toBeDefined()
  })
})

describe('validateTripDuration', () => {
  it('should validate correct date range', () => {
    const result = validateTripDuration('2024-06-01', '2024-06-07')
    expect(result.valid).toBe(true)
    expect(result.days).toBe(6)
  })

  it('should reject end date before start date', () => {
    const result = validateTripDuration('2024-06-10', '2024-06-05')
    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('should reject trips longer than 30 days', () => {
    const result = validateTripDuration('2024-06-01', '2024-08-01')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('30 days')
  })

  it('should reject same-day trips', () => {
    const result = validateTripDuration('2024-06-01', '2024-06-01')
    expect(result.valid).toBe(false)
  })
})

describe('validateCurrency', () => {
  it('should validate common currencies', () => {
    expect(validateCurrency('USD')).toBe(true)
    expect(validateCurrency('EUR')).toBe(true)
    expect(validateCurrency('GBP')).toBe(true)
    expect(validateCurrency('JPY')).toBe(true)
  })

  it('should reject invalid currencies', () => {
    expect(validateCurrency('INVALID')).toBe(false)
    expect(validateCurrency('ABC')).toBe(false)
  })

  it('should be case insensitive', () => {
    expect(validateCurrency('usd')).toBe(true)
    expect(validateCurrency('Eur')).toBe(true)
  })
})

// Made with Bob
