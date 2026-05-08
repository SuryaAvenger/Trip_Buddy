import React from 'react'
import { useTripContext } from '@/contexts/TripContext'
import { MapPin, MessageSquare, Download, Settings, Sparkles } from 'lucide-react'

export function Sidebar() {
  const { itinerary } = useTripContext()

  const menuItems = [
    {
      icon: Sparkles,
      label: 'AI Assistant',
      description: 'Chat with your travel planner',
      active: true,
    },
    {
      icon: MapPin,
      label: 'Itinerary',
      description: 'View your trip details',
      active: false,
    },
    {
      icon: Download,
      label: 'Export',
      description: 'Save to Calendar or Sheets',
      active: false,
    },
  ]

  return (
    <div className="p-4 space-y-6">
      {/* Trip Summary */}
      {itinerary && (
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-4 border border-indigo-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {itinerary.destination}
              </h3>
              <p className="text-xs text-gray-600">{itinerary.days.length} days</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Activities</span>
              <span className="font-semibold text-gray-900">
                {itinerary.days.reduce((sum, day) => sum + day.activities.length, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Budget</span>
              <span className="font-semibold text-gray-900">
                ${itinerary.totalBudgetEstimate.total.toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="space-y-2" aria-label="Main navigation">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              className={`
                w-full flex items-start gap-3 p-3 rounded-lg transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                ${
                  item.active
                    ? 'bg-indigo-50 border-2 border-indigo-200'
                    : 'hover:bg-gray-50 border-2 border-transparent'
                }
              `}
              aria-current={item.active ? 'page' : undefined}
            >
              <div
                className={`
                  flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                  ${item.active ? 'bg-indigo-600' : 'bg-gray-100'}
                `}
              >
                <Icon className={`w-5 h-5 ${item.active ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1 text-left">
                <div
                  className={`text-sm font-semibold ${
                    item.active ? 'text-indigo-900' : 'text-gray-900'
                  }`}
                >
                  {item.label}
                </div>
                <div className="text-xs text-gray-600 mt-0.5">{item.description}</div>
              </div>
            </button>
          )
        })}
      </nav>

      {/* Help Section */}
      <div className="pt-6 border-t border-gray-200">
        <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold text-gray-900">Help & Support</div>
            <div className="text-xs text-gray-600 mt-0.5">Get assistance</div>
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Powered by Google Gemini AI
        </p>
      </div>
    </div>
  )
}

// Made with Bob
