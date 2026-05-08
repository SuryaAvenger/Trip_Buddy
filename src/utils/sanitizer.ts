import { z } from 'zod'
import { ParseError } from '../types/gemini'

const htmlEntities: Record<string, string> = {
  '&': '&' + 'amp;',
  '<': '&' + 'lt;',
  '>': '&' + 'gt;',
  '"': '&' + 'quot;',
  "'": '&' + '#39;',
}

export function sanitizeGeminiOutput(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  let sanitized = text

  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '')

  // Remove on* event handlers
  sanitized = sanitized.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')

  // Remove data: URLs (except images)
  sanitized = sanitized.replace(/data:(?!image\/)[^,]*,/gi, '')

  // Escape HTML entities in user-facing strings
  sanitized = sanitized.replace(/[&<>"']/g, (char) => htmlEntities[char] || char)

  return sanitized.trim()
}

export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  // Create a temporary div to parse HTML
  const temp = document.createElement('div')
  temp.textContent = html

  return temp.innerHTML
}

export function extractJSON(text: string): string {
  if (!text) {
    throw new ParseError('Empty text provided', text)
  }

  // Try to find JSON object in the text
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new ParseError('No JSON object found in text', text)
  }

  return jsonMatch[0]
}

export function parseGeminiJSON<T>(text: string, schema: z.ZodSchema<T>): T {
  try {
    // Extract JSON from potential markdown or extra text
    const jsonText = extractJSON(text)

    // Parse JSON
    const parsed = JSON.parse(jsonText)

    // Validate with Zod schema
    const validated = schema.parse(parsed)

    return validated
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      throw new ParseError(`Schema validation failed: ${errorMessages}`, text)
    }

    if (error instanceof SyntaxError) {
      throw new ParseError(`Invalid JSON: ${error.message}`, text)
    }

    if (error instanceof ParseError) {
      throw error
    }

    throw new ParseError(`Failed to parse Gemini output: ${String(error)}`, text)
  }
}

export function sanitizeUserInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Trim whitespace
  let sanitized = input.trim()

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')

  // Limit length
  const MAX_LENGTH = 10000
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH)
  }

  return sanitized
}

export function sanitizeURL(url: string): string {
  if (!url || typeof url !== 'string') {
    return ''
  }

  try {
    const parsed = new URL(url)

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return ''
    }

    return parsed.toString()
  } catch {
    return ''
  }
}

export function isValidJSON(text: string): boolean {
  try {
    JSON.parse(text)
    return true
  } catch {
    return false
  }
}

export function stripMarkdown(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  let stripped = text

  // Remove code blocks
  stripped = stripped.replace(/```[\s\S]*?```/g, '')
  stripped = stripped.replace(/`[^`]*`/g, '')

  // Remove headers
  stripped = stripped.replace(/^#{1,6}\s+/gm, '')

  // Remove bold and italic
  stripped = stripped.replace(/\*\*([^*]+)\*\*/g, '$1')
  stripped = stripped.replace(/\*([^*]+)\*/g, '$1')
  stripped = stripped.replace(/__([^_]+)__/g, '$1')
  stripped = stripped.replace(/_([^_]+)_/g, '$1')

  // Remove links
  stripped = stripped.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

  return stripped.trim()
}

// Made with Bob
