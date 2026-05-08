import React from 'react'
import { ItineraryDay } from '@/types/trip'
import { ActivityCard } from './ActivityCard'
import { formatDate, formatCurrency, formatDuration } from '@/utils/formatters'
import { Calendar, Clock, DollarSign, Utensils } from 'lucide-react'

interface DayCardProps {
  day: ItineraryDay
  onActivityReorder?: (dayNumber: number, activityId: string, direction: 'up' | 'down') => void
}

export function DayCard({ day, onActivityReorder }: DayCardProps) {
  const handleReorder = (activityId: string, direction: 'up' | 'down') => {
    onActivityReorder?.(day.dayNumber, activityId, direction)
  }

  return (
    <div className="space-y-6">
      {/* Day Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl p-6 border border-indigo-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {day.dayNumber}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Day {day.dayNumber}</h3>
                <p className="text-sm text-gray-600">{formatDate(day.date)}</p>
              </div>
            </div>
            {day.theme && (
              <div className="inline-flex items-center px-3 py-1 bg-white rounded-full text-sm font-medium text-indigo-700 border border-indigo-200">
                {day.theme}
              </div>
            )}
          </div>

          {/* Day Stats */}
          <div className="flex flex-col gap-2 text-right">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span className="font-semibold">{formatCurrency(day.estimatedCost, 'USD')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(day.travelTime)} travel</span>
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-indigo-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{day.activities.length}</div>
            <div className="text-xs text-gray-600">Activities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{day.meals.length}</div>
            <div className="text-xs text-gray-600">Meals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {Math.round((day.activities.reduce((sum, a) => sum + a.duration, 0) + day.travelTime) / 60)}h
            </div>
            <div className="text-xs text-gray-600">Total Time</div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {/* Morning */}
        {day.activities.some((a) => parseInt(a.startTime.split(':')[0]) < 12) && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Morning</h4>
            </div>
            <div className="space-y-3 pl-4">
              {day.activities
                .filter((a) => parseInt(a.startTime.split(':')[0]) < 12)
                .map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onReorder={onActivityReorder ? handleReorder : undefined}
                  />
                ))}
              {day.meals
                .filter((m) => m.type === 'breakfast')
                .map((meal) => (
                  <div key={meal.id} className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Utensils className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-semibold text-gray-900">{meal.restaurantName}</h5>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(meal.estimatedCost, 'USD')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{meal.cuisineType} • {meal.priceRange}</p>
                        <p className="text-xs text-gray-500 mt-1">{meal.address}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Afternoon */}
        {day.activities.some((a) => {
          const hour = parseInt(a.startTime.split(':')[0])
          return hour >= 12 && hour < 17
        }) && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Afternoon</h4>
            </div>
            <div className="space-y-3 pl-4">
              {day.activities
                .filter((a) => {
                  const hour = parseInt(a.startTime.split(':')[0])
                  return hour >= 12 && hour < 17
                })
                .map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onReorder={onActivityReorder ? handleReorder : undefined}
                  />
                ))}
              {day.meals
                .filter((m) => m.type === 'lunch')
                .map((meal) => (
                  <div key={meal.id} className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Utensils className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-semibold text-gray-900">{meal.restaurantName}</h5>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(meal.estimatedCost, 'USD')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{meal.cuisineType} • {meal.priceRange}</p>
                        <p className="text-xs text-gray-500 mt-1">{meal.address}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Evening */}
        {day.activities.some((a) => parseInt(a.startTime.split(':')[0]) >= 17) && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-indigo-400 rounded-full" />
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Evening</h4>
            </div>
            <div className="space-y-3 pl-4">
              {day.activities
                .filter((a) => parseInt(a.startTime.split(':')[0]) >= 17)
                .map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onReorder={onActivityReorder ? handleReorder : undefined}
                  />
                ))}
              {day.meals
                .filter((m) => m.type === 'dinner')
                .map((meal) => (
                  <div key={meal.id} className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Utensils className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-semibold text-gray-900">{meal.restaurantName}</h5>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(meal.estimatedCost, 'USD')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{meal.cuisineType} • {meal.priceRange}</p>
                        <p className="text-xs text-gray-500 mt-1">{meal.address}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Accommodation */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h5 className="font-semibold text-gray-900">{day.accommodation.name}</h5>
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(day.accommodation.estimatedCostPerNight, 'USD')}/night
              </span>
            </div>
            <p className="text-sm text-gray-600 capitalize">{day.accommodation.type}</p>
            <p className="text-xs text-gray-500 mt-1">{day.accommodation.address}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Made with Bob
