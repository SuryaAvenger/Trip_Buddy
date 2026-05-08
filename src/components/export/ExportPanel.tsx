import React from 'react'
import { Itinerary } from '@/types/trip'
import { CalendarExport } from './CalendarExport'
import { SheetsExport } from './SheetsExport'
import { Download } from 'lucide-react'

interface ExportPanelProps {
  itinerary: Itinerary
}

export function ExportPanel({ itinerary }: ExportPanelProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Download className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Export Your Trip</h3>
          <p className="text-sm text-gray-600">Save your itinerary to Google services</p>
        </div>
      </div>

      <div className="space-y-4">
        <CalendarExport itinerary={itinerary} />
        <SheetsExport itinerary={itinerary} />
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          By exporting, you authorize TripBuddy to access your Google Calendar and Google Sheets.
          Your data is never stored on our servers.
        </p>
      </div>
    </div>
  )
}

// Made with Bob
