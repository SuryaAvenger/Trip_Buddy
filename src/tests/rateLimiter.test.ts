import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RateLimiter, withRetry, RateLimitError } from '../utils/rateLimiter'

describe('RateLimiter', () => {
  let limiter: RateLimiter

  beforeEach(() => {
    limiter = new RateLimiter({
      maxTokens: 5,
      refillRate: 2,
      refillInterval: 100,
    })
  })

  it('should allow requests when tokens are available', async () => {
    await expect(limiter.acquire()).resolves.toBeUndefined()
    await expect(limiter.acquire()).resolves.toBeUndefined()
    await expect(limiter.acquire()).resolves.toBeUndefined()
  })

  it('should throw RateLimitError when tokens exhausted', async () => {
    // Exhaust all tokens
    await limiter.acquire()
    await limiter.acquire()
    await limiter.acquire()
    await limiter.acquire()
    await limiter.acquire()

    // Next request should fail
    await expect(limiter.acquire()).rejects.toThrow(RateLimitError)
  })

  it('should refill tokens after interval', async () => {
    // Exhaust all tokens
    for (let i = 0; i < 5; i++) {
      await limiter.acquire()
    }

    // Wait for refill
    await new Promise((resolve) => setTimeout(resolve, 150))

    // Should have 2 tokens refilled
    await expect(limiter.acquire()).resolves.toBeUndefined()
    await expect(limiter.acquire()).resolves.toBeUndefined()
  })

  it('should include retryAfter in RateLimitError', async () => {
    // Exhaust all tokens
    for (let i = 0; i < 5; i++) {
      await limiter.acquire()
    }

    try {
      await limiter.acquire()
      expect.fail('Should have thrown RateLimitError')
    } catch (error) {
      expect(error).toBeInstanceOf(RateLimitError)
      if (error instanceof RateLimitError) {
        expect(error.retryAfter).toBeGreaterThan(Date.now())
      }
    }
  })

  it('should not exceed maxTokens when refilling', async () => {
    // Use 2 tokens
    await limiter.acquire()
    await limiter.acquire()

    // Wait for multiple refill intervals
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Should still only have maxTokens (5) available
    for (let i = 0; i < 5; i++) {
      await limiter.acquire()
    }

    await expect(limiter.acquire()).rejects.toThrow(RateLimitError)
  })
})

describe('withRetry', () => {
  it('should succeed on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success')
    const result = await withRetry(fn, 3, 10)
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should retry on RateLimitError', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(
        new RateLimitError('Rate limit exceeded', Date.now() + 50)
      )
      .mockResolvedValueOnce('success')

    const result = await withRetry(fn, 3, 10)
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should retry up to maxAttempts', async () => {
    const fn = vi.fn().mockRejectedValue(
      new RateLimitError('Rate limit exceeded', Date.now() + 10)
    )

    await expect(withRetry(fn, 3, 10)).rejects.toThrow(RateLimitError)
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('should not retry on non-RateLimitError', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Other error'))

    await expect(withRetry(fn, 3, 10)).rejects.toThrow('Other error')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should use exponential backoff', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(
        new RateLimitError('Rate limit exceeded', Date.now() + 10)
      )
      .mockRejectedValueOnce(
        new RateLimitError('Rate limit exceeded', Date.now() + 10)
      )
      .mockResolvedValueOnce('success')

    const startTime = Date.now()
    await withRetry(fn, 3, 50)
    const duration = Date.now() - startTime

    // Should have waited at least 50ms + 100ms (exponential backoff)
    expect(duration).toBeGreaterThanOrEqual(100)
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('should respect retryAfter from RateLimitError', async () => {
    const retryAfter = Date.now() + 100
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new RateLimitError('Rate limit exceeded', retryAfter))
      .mockResolvedValueOnce('success')

    const startTime = Date.now()
    await withRetry(fn, 3, 10)
    const duration = Date.now() - startTime

    // Should have waited at least until retryAfter
    expect(duration).toBeGreaterThanOrEqual(90)
  })
})

// Made with Bob
