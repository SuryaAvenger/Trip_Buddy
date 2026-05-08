import { useState, useCallback, useEffect } from 'react'

interface UseSecureStorageReturn<T> {
  value: T | null
  setValue: (value: T) => void
  removeValue: () => void
  error: string | null
}

/**
 * Hook for secure storage using sessionStorage (not localStorage for security)
 * Data is cleared when the browser tab is closed
 */
export function useSecureStorage<T>(key: string, initialValue?: T): UseSecureStorageReturn<T> {
  const [value, setValueState] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load initial value from sessionStorage
  useEffect(() => {
    try {
      const item = sessionStorage.getItem(key)
      if (item) {
        const parsed = JSON.parse(item) as T
        setValueState(parsed)
      } else if (initialValue !== undefined) {
        setValueState(initialValue)
      }
    } catch (err) {
      setError(`Failed to load ${key} from storage`)
      if (initialValue !== undefined) {
        setValueState(initialValue)
      }
    }
  }, [key, initialValue])

  const setValue = useCallback(
    (newValue: T) => {
      try {
        setValueState(newValue)
        sessionStorage.setItem(key, JSON.stringify(newValue))
        setError(null)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : `Failed to save ${key} to storage`
        setError(errorMessage)
      }
    },
    [key]
  )

  const removeValue = useCallback(() => {
    try {
      setValueState(null)
      sessionStorage.removeItem(key)
      setError(null)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to remove ${key} from storage`
      setError(errorMessage)
    }
  }, [key])

  return {
    value,
    setValue,
    removeValue,
    error,
  }
}

/**
 * Hook for storing OAuth tokens securely
 */
export function useOAuthToken() {
  return useSecureStorage<{
    accessToken: string
    expiresAt: number
    scope: string
  }>('oauth_token')
}

/**
 * Hook for storing user preferences
 */
export function useUserPreferences() {
  return useSecureStorage<{
    theme: 'light' | 'dark'
    language: string
    notifications: boolean
  }>('user_preferences', {
    theme: 'light',
    language: 'en',
    notifications: true,
  })
}

// Made with Bob
