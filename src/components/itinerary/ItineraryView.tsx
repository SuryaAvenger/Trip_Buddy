import React, { useState } from 'react'
import { Itinerary } from '@/types/trip'
import { DayCard } from './DayCard'
import { BudgetSummary } from './BudgetSummary'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ItineraryViewProps {
  itinerary: Itinerary
  onActivityReorder?: (dayNumber: number, activityId: string, direction: 'up' | 'down') => void
}

export function ItineraryView({ itinerary, onActivityReorder }: ItineraryViewProps) {
  const [selectedDay, setSelectedDay] = useState(1)

  const currentDay = itinerary.days.find((d) => d.dayNumber === selectedDay)

  const handlePrevDay = () => {
    if (selectedDay > 1) {
      setSelectedDay(selectedDay - 1)
    }
  }

  const handleNextDay = () => {
    if (selectedDay < itinerary.days.length) {
      setSelectedDay(selectedDay + 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrevDay()
    } else if (e.key === 'ArrowRight') {
      handleNextDay()
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Day Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{itinerary.destination}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {itinerary.days.length} day{itinerary.days.length !== 1 ? 's' : ''} •{' '}
              {new Date(itinerary.days[0]?.date || '').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}{' '}
              -{' '}
              {new Date(
                itinerary.days[itinerary.days.length - 1]?.date || ''
              ).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Day Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevDay}
              disabled={selectedDay === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[80px] text-center">
              Day {selectedDay} of {itinerary.days.length}
            </span>
            <button
              onClick={handleNextDay}
              disabled={selectedDay === itinerary.days.length}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Next day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Day Tabs */}
        <div
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          role="tablist"
          aria-label="Trip days"
          onKeyDown={handleKeyDown}
        >
          {itinerary.days.map((day) => (
            <button
              key={day.dayNumber}
              onClick={() => setSelectedDay(day.dayNumber)}
              role="tab"
              aria-selected={selectedDay === day.dayNumber}
              aria-controls={`day-${day.dayNumber}-panel`}
              id={`day-${day.dayNumber}-tab`}
              tabIndex={selectedDay === day.dayNumber ? 0 : -1}
              className={`
                flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                ${
                  selectedDay === day.dayNumber
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              Day {day.dayNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Day Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {currentDay ? (
            <div
              role="tabpanel"
              id={`day-${currentDay.dayNumber}-panel`}
              aria-labelledby={`day-${currentDay.dayNumber}-tab`}
            >
              <DayCard day={currentDay} onActivityReorder={onActivityReorder} />
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Day not found</p>
            </div>
          )}
        </div>
      </div>

      {/* Budget Summary Footer */}
      <div className="bg-white border-t border-gray-200 p-6">
        <BudgetSummary breakdown={itinerary.totalBudgetEstimate} />
      </div>
    </div>
  )
}

// Made with Bob
