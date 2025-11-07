'use client'

import { useState, useCallback } from 'react'

export interface ErrorState {
  message: string
  code?: string
  timestamp: Date
}

export function useErrorHandler() {
  const [error, setError] = useState<ErrorState | null>(null)

  const handleError = useCallback((err: unknown, context?: string) => {
    const timestamp = new Date()

    let message = 'Something went wrong. Please try again.'
    let code: string | undefined

    if (err instanceof Error) {
      message = err.message
      code = context
    } else if (typeof err === 'string') {
      message = err
    }

    const errorState: ErrorState = {
      message,
      code,
      timestamp,
    }

    setError(errorState)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context || 'Error'}]`, err)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    handleError,
    clearError,
    hasError: error !== null,
  }
}
