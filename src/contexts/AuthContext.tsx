import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { useOAuthToken } from '../hooks/useSecureStorage'

interface AuthContextValue {
  isAuthenticated: boolean
  accessToken: string | null
  expiresAt: number | null
  setAuthToken: (token: string, expiresIn: number, scope: string) => void
  clearAuth: () => void
  isTokenExpired: () => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { value: tokenData, setValue: setTokenData, removeValue: removeTokenData } = useOAuthToken()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication status on mount and when token changes
  useEffect(() => {
    if (tokenData && tokenData.expiresAt > Date.now()) {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
      if (tokenData) {
        // Token expired, clear it
        removeTokenData()
      }
    }
  }, [tokenData, removeTokenData])

  const setAuthToken = useCallback(
    (token: string, expiresIn: number, scope: string) => {
      const expiresAt = Date.now() + expiresIn * 1000
      setTokenData({
        accessToken: token,
        expiresAt,
        scope,
      })
      setIsAuthenticated(true)
    },
    [setTokenData]
  )

  const clearAuth = useCallback(() => {
    removeTokenData()
    setIsAuthenticated(false)
  }, [removeTokenData])

  const isTokenExpired = useCallback((): boolean => {
    if (!tokenData) return true
    return tokenData.expiresAt <= Date.now()
  }, [tokenData])

  const value: AuthContextValue = {
    isAuthenticated,
    accessToken: tokenData?.accessToken || null,
    expiresAt: tokenData?.expiresAt || null,
    setAuthToken,
    clearAuth,
    isTokenExpired,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

// Made with Bob
