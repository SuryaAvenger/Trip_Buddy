import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Extend Vitest matchers
expect.extend({})

// Mock environment variables for tests
process.env.VITE_GEMINI_API_KEY = 'test-gemini-key'
process.env.VITE_GOOGLE_MAPS_API_KEY = 'test-maps-key'
process.env.VITE_GOOGLE_CALENDAR_CLIENT_ID = 'test-calendar-client-id'
process.env.VITE_GOOGLE_SHEETS_CLIENT_ID = 'test-sheets-client-id'
process.env.VITE_GOOGLE_API_SCOPE = 'test-scope'

// Made with Bob
