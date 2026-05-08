import React, { useState } from 'react'
import { Itinerary } from '@/types/trip'
import { useCalendar } from '@/hooks/useCalendar'
import { Calendar, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react'

interface CalendarExportProps {
  itinerary: Itinerary
}

export function CalendarExport({ itinerary }: CalendarExportProps) {
  const { exportToCalendar, isExporting, error } = useCalendar()
  const [exportedUrl, setExportedUrl] = useState<string | null>(null)

  const handleExport = async () => {
    try {
      const calendarUrl = await exportToCalendar(itinerary)
      setExportedUrl(calendarUrl)
    } catch (err) {
      // Error handled by hook
      console.error('Calendar export failed:', err)
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-all duration-200">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Calendar className="w-6 h-6 text-blue-600" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-gray-900 mb-1">Google Calendar</h4>
          <p className="text-sm text-gray-600 mb-3">
            Add all activities and meals to your Google Calendar with reminders
          </p>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {exportedUrl && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-green-700 mb-2">Successfully exported to calendar!</p>
                <a
                  href={exportedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800 underline"
                >
                  View in Google Calendar
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          <button
            onClick={handleExport}
            disabled={isExporting || !!exportedUrl}
            className={`
              w-full px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${
                exportedUrl
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : isExporting
                  ? 'bg-blue-100 text-blue-700 cursor-wait'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
              }
            `}
            aria-busy={isExporting}
          >
            {isExporting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </span>
            ) : exportedUrl ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Exported
              </span>
            ) : (
              'Export to Calendar'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Made with Bob
