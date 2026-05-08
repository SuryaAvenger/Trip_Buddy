import React, { ReactNode } from 'react'

interface FormStepProps {
  title: string
  description?: string
  children: ReactNode
  error?: string
}

export function FormStep({ title, description, children, error }: FormStepProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-2">{title}</h2>
        {description && <p className="text-gray-600 leading-relaxed">{description}</p>}
      </div>

      {error && (
        <div
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
          role="alert"
          aria-live="polite"
        >
          <svg
            className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-6">{children}</div>
    </div>
  )
}

interface FormFieldProps {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  helpText?: string
  children: ReactNode
}

export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  helpText,
  children,
}: FormFieldProps) {
  const errorId = error ? `${htmlFor}-error` : undefined
  const helpId = helpText ? `${htmlFor}-help` : undefined

  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>

      <div className="relative">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              id: htmlFor,
              'aria-invalid': error ? 'true' : 'false',
              'aria-describedby': [errorId, helpId].filter(Boolean).join(' ') || undefined,
            } as Record<string, unknown>)
          }
          return child
        })}
      </div>

      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {helpText && !error && (
        <p id={helpId} className="text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  )
}

// Made with Bob
