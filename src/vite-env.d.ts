/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_GOOGLE_CALENDAR_CLIENT_ID: string
  readonly VITE_GOOGLE_SHEETS_CLIENT_ID: string
  readonly VITE_GOOGLE_API_SCOPE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Made with Bob
