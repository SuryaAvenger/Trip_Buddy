import React, { useState } from 'react'
import { TripPreferences, Interest, DietaryRestriction, AccommodationType, TransportMode } from '@/types/trip'
import { validatePreferences } from '@/utils/validators'
import { ProgressBar } from './ProgressBar'
import { FormStep, FormField } from './FormStep'
import { Plane, DollarSign, Heart, Utensils, Home } from 'lucide-react'

interface PreferenceFormProps {
  onSubmit: (preferences: TripPreferences) => void
  isLoading?: boolean
}

const INTERESTS: { value: Interest; label: string; icon: string }[] = [
  { value: 'culture', label: 'Culture', icon: '🏛️' },
  { value: 'food', label: 'Food', icon: '🍽️' },
  { value: 'nature', label: 'Nature', icon: '🌲' },
  { value: 'adventure', label: 'Adventure', icon: '🏔️' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'nightlife', label: 'Nightlife', icon: '🎉' },
  { value: 'history', label: 'History', icon: '📜' },
  { value: 'art', label: 'Art', icon: '🎨' },
  { value: 'wellness', label: 'Wellness', icon: '🧘' },
]

const DIETARY_RESTRICTIONS: { value: DietaryRestriction; label: string }[] = [
  { value: 'none', label: 'No restrictions' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
  { value: 'gluten-free', label: 'Gluten-free' },
  { value: 'nut-allergy', label: 'Nut allergy' },
]

const ACCOMMODATION_TYPES: { value: AccommodationType; label: string }[] = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'airbnb', label: 'Airbnb' },
  { value: 'resort', label: 'Resort' },
  { value: 'boutique', label: 'Boutique' },
]

const TRANSPORT_MODES: { value: TransportMode; label: string }[] = [
  { value: 'walking', label: 'Walking' },
  { value: 'public', label: 'Public transit' },
  { value: 'taxi', label: 'Taxi/Rideshare' },
  { value: 'rental-car', label: 'Rental car' },
  { value: 'cycling', label: 'Cycling' },
]

export function PreferenceForm({ onSubmit, isLoading = false }: PreferenceFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<TripPreferences>>({
    interests: [],
    dietaryRestrictions: ['none'],
    accommodationType: [],
    transportPreference: [],
    pace: 'moderate',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = <K extends keyof TripPreferences>(field: K, value: TripPreferences[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const toggleArrayValue = <T,>(field: keyof TripPreferences, value: T) => {
    const currentArray = (formData[field] as T[]) || []
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value]
    updateField(field, newArray as TripPreferences[typeof field])
  }

  const validateStep = (step: number): boolean => {
    const validation = validatePreferences(formData)
    
    if (step === 1) {
      const stepErrors: Record<string, string> = {}
      if (validation.errors.destination) stepErrors.destination = validation.errors.destination
      if (validation.errors.startDate) stepErrors.startDate = validation.errors.startDate
      if (validation.errors.endDate) stepErrors.endDate = validation.errors.endDate
      if (validation.errors.travelers) stepErrors.travelers = validation.errors.travelers
      
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors)
        return false
      }
    } else if (step === 2) {
      const stepErrors: Record<string, string> = {}
      if (validation.errors.budgetLevel) stepErrors.budgetLevel = validation.errors.budgetLevel
      if (validation.errors.budgetAmount) stepErrors.budgetAmount = validation.errors.budgetAmount
      if (validation.errors.currency) stepErrors.currency = validation.errors.currency
      
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors)
        return false
      }
    } else if (step === 3) {
      if (validation.errors.interests) {
        setErrors({ interests: validation.errors.interests })
        return false
      }
    } else if (step === 4) {
      const stepErrors: Record<string, string> = {}
      if (validation.errors.accommodationType) stepErrors.accommodationType = validation.errors.accommodationType
      if (validation.errors.transportPreference) stepErrors.transportPreference = validation.errors.transportPreference
      
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors)
        return false
      }
    }

    setErrors({})
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    setErrors({})
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const validation = validatePreferences(formData)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    onSubmit(formData as TripPreferences)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <Plane className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Plan Your Perfect Trip</h1>
          <p className="text-lg text-gray-600">Let's create a personalized itinerary just for you</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <ProgressBar currentStep={currentStep} totalSteps={5} />

          <form onSubmit={handleSubmit}>
            {/* Step 1: Destination & Dates */}
            {currentStep === 1 && (
              <FormStep
                title="Where and when?"
                description="Tell us about your destination and travel dates"
              >
                <FormField label="Destination" htmlFor="destination" required error={errors.destination}>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="e.g., Paris, France"
                    value={formData.destination || ''}
                    onChange={(e) => updateField('destination', e.target.value)}
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Start Date" htmlFor="startDate" required error={errors.startDate}>
                    <input
                      type="date"
                      min={today}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={formData.startDate || ''}
                      onChange={(e) => updateField('startDate', e.target.value)}
                    />
                  </FormField>

                  <FormField label="End Date" htmlFor="endDate" required error={errors.endDate}>
                    <input
                      type="date"
                      min={formData.startDate || today}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={formData.endDate || ''}
                      onChange={(e) => updateField('endDate', e.target.value)}
                    />
                  </FormField>
                </div>

                <FormField label="Number of Travelers" htmlFor="travelers" required error={errors.travelers}>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => updateField('travelers', Math.max(1, (formData.travelers || 1) - 1))}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      aria-label="Decrease travelers"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      className="w-20 text-center px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={formData.travelers || 1}
                      onChange={(e) => updateField('travelers', parseInt(e.target.value) || 1)}
                    />
                    <button
                      type="button"
                      onClick={() => updateField('travelers', Math.min(20, (formData.travelers || 1) + 1))}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      aria-label="Increase travelers"
                    >
                      +
                    </button>
                  </div>
                </FormField>
              </FormStep>
            )}

            {/* Step 2: Budget */}
            {currentStep === 2 && (
              <FormStep
                title="What's your budget?"
                description="Help us plan activities within your budget"
              >
                <FormField label="Budget Level" htmlFor="budgetLevel" required error={errors.budgetLevel}>
                  <div className="grid grid-cols-3 gap-4">
                    {(['budget', 'mid-range', 'luxury'] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => updateField('budgetLevel', level)}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          formData.budgetLevel === level
                            ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <DollarSign className={`w-6 h-6 mx-auto mb-2 ${
                          formData.budgetLevel === level ? 'text-indigo-600' : 'text-gray-400'
                        }`} />
                        <div className="text-sm font-medium capitalize">{level}</div>
                      </button>
                    ))}
                  </div>
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Total Budget" htmlFor="budgetAmount" required error={errors.budgetAmount}>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="3000"
                      value={formData.budgetAmount || ''}
                      onChange={(e) => updateField('budgetAmount', parseFloat(e.target.value) || 0)}
                    />
                  </FormField>

                  <FormField label="Currency" htmlFor="currency" required error={errors.currency}>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={formData.currency || 'USD'}
                      onChange={(e) => updateField('currency', e.target.value)}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="AUD">AUD (A$)</option>
                      <option value="CAD">CAD (C$)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </FormField>
                </div>

                {formData.budgetAmount && formData.startDate && formData.endDate && (
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <p className="text-sm text-indigo-900">
                      <span className="font-semibold">Per day budget:</span>{' '}
                      {formData.currency} {Math.round(formData.budgetAmount / 
                        Math.max(1, Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24)))
                      )}
                    </p>
                  </div>
                )}
              </FormStep>
            )}

            {/* Step 3: Interests */}
            {currentStep === 3 && (
              <FormStep
                title="What interests you?"
                description="Select all that apply - we'll tailor your itinerary"
                error={errors.interests}
              >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest.value}
                      type="button"
                      onClick={() => toggleArrayValue('interests', interest.value)}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        formData.interests?.includes(interest.value)
                          ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{interest.icon}</div>
                      <div className="text-sm font-medium">{interest.label}</div>
                    </button>
                  ))}
                </div>
              </FormStep>
            )}

            {/* Step 4: Preferences */}
            {currentStep === 4 && (
              <FormStep
                title="Your preferences"
                description="Help us personalize your experience"
              >
                <FormField label="Dietary Restrictions" htmlFor="dietary" error={errors.dietaryRestrictions}>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_RESTRICTIONS.map((restriction) => (
                      <button
                        key={restriction.value}
                        type="button"
                        onClick={() => toggleArrayValue('dietaryRestrictions', restriction.value)}
                        className={`px-4 py-2 border-2 rounded-full text-sm font-medium transition-all ${
                          formData.dietaryRestrictions?.includes(restriction.value)
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {restriction.label}
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="Accommodation Type" htmlFor="accommodation" required error={errors.accommodationType}>
                  <div className="flex flex-wrap gap-2">
                    {ACCOMMODATION_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => toggleArrayValue('accommodationType', type.value)}
                        className={`px-4 py-2 border-2 rounded-full text-sm font-medium transition-all ${
                          formData.accommodationType?.includes(type.value)
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="Transport Preference" htmlFor="transport" required error={errors.transportPreference}>
                  <div className="flex flex-wrap gap-2">
                    {TRANSPORT_MODES.map((mode) => (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => toggleArrayValue('transportPreference', mode.value)}
                        className={`px-4 py-2 border-2 rounded-full text-sm font-medium transition-all ${
                          formData.transportPreference?.includes(mode.value)
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="Trip Pace" htmlFor="pace" required>
                  <div className="grid grid-cols-3 gap-4">
                    {(['relaxed', 'moderate', 'packed'] as const).map((pace) => (
                      <button
                        key={pace}
                        type="button"
                        onClick={() => updateField('pace', pace)}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          formData.pace === pace
                            ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-medium capitalize">{pace}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {pace === 'relaxed' && '2-3 activities/day'}
                          {pace === 'moderate' && '4-5 activities/day'}
                          {pace === 'packed' && '6+ activities/day'}
                        </div>
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="Mobility Needs (Optional)" htmlFor="mobility">
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    rows={3}
                    placeholder="Any accessibility requirements or mobility considerations..."
                    value={formData.mobilityNeeds || ''}
                    onChange={(e) => updateField('mobilityNeeds', e.target.value)}
                  />
                </FormField>
              </FormStep>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <FormStep
                title="Review your preferences"
                description="Everything look good? Let's create your itinerary!"
              >
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Trip Details</h3>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Destination:</dt>
                        <dd className="font-medium">{formData.destination}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Dates:</dt>
                        <dd className="font-medium">{formData.startDate} to {formData.endDate}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Travelers:</dt>
                        <dd className="font-medium">{formData.travelers}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Budget</h3>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Level:</dt>
                        <dd className="font-medium capitalize">{formData.budgetLevel}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Total:</dt>
                        <dd className="font-medium">{formData.currency} {formData.budgetAmount}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.interests?.map((interest) => (
                        <span key={interest} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                          {INTERESTS.find((i) => i.value === interest)?.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Preferences</h3>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Pace:</dt>
                        <dd className="font-medium capitalize">{formData.pace}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Accommodation:</dt>
                        <dd className="font-medium">{formData.accommodationType?.join(', ')}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Transport:</dt>
                        <dd className="font-medium">{formData.transportPreference?.join(', ')}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </FormStep>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
              )}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className="ml-auto px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="ml-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-violet-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Plane className="w-5 h-5" />
                      Generate My Itinerary
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Made with Bob
