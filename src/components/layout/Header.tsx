import React from 'react'
import { useTripContext } from '@/contexts/TripContext'
import { Plane, Calendar, Users, DollarSign } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/formatters'

export function Header() {
  const { itinerary } = useTripContext()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">TripBuddy</h1>
            <p className="text-xs text-gray-500">AI-Powered Travel Planner</p>
          </div>
        </div>

        {/* Trip Info (shown when itinerary exists) */}
        {itinerary && (
          <div className="flex items-center gap-6">
            {/* Destination */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Plane className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Destination</p>
                <p className="text-sm font-semibold text-gray-900">{itinerary.destination}</p>
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Dates</p>
                <p className="text-sm font-semibold text-gray-900">
                  {itinerary.days.length > 0 && (
                    <>
                      {formatDate(itinerary.days[0]?.date || '')} -{' '}
                      {formatDate(itinerary.days[itinerary.days.length - 1]?.date || '')}
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Travelers */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Travelers</p>
                <p className="text-sm font-semibold text-gray-900">
                  {itinerary.preferences.travelers}
                </p>
              </div>
            </div>

            {/* Budget */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Budget</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(
                    itinerary.totalBudgetEstimate.total,
                    itinerary.totalBudgetEstimate.currency
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

// Made with Bob
