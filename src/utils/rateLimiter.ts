export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter: number
  ) {
    super(message)
    this.name = 'RateLimitError'
  }
}

export interface RateLimiterConfig {
  maxTokens: number
  refillRate: number
  refillInterval: number
}

export class RateLimiter {
  private tokens: number
  private lastRefill: number
  private config: RateLimiterConfig

  constructor(config: RateLimiterConfig) {
    this.config = config
    this.tokens = config.maxTokens
    this.lastRefill = Date.now()
  }

  private refill(): void {
    const now = Date.now()
    const timePassed = now - this.lastRefill
    const intervalsElapsed = Math.floor(timePassed / this.config.refillInterval)

    if (intervalsElapsed > 0) {
      this.tokens = Math.min(
        this.config.maxTokens,
        this.tokens + intervalsElapsed * this.config.refillRate
      )
      this.lastRefill = now
    }
  }

  async acquire(): Promise<void> {
    this.refill()

    if (this.tokens >= 1) {
      this.tokens -= 1
      return Promise.resolve()
    }

    const timeUntilRefill = this.config.refillInterval - (Date.now() - this.lastRefill)
    throw new RateLimitError(
      `Rate limit exceeded. Please wait ${Math.ceil(timeUntilRefill / 1000)} seconds.`,
      timeUntilRefill
    )
  }

  getAvailableTokens(): number {
    this.refill()
    return this.tokens
  }

  reset(): void {
    this.tokens = this.config.maxTokens
    this.lastRefill = Date.now()
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  backoffMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt === maxAttempts) {
        break
      }

      // If it's a rate limit error, wait for the specified time
      if (error instanceof RateLimitError) {
        await sleep(error.retryAfter)
      } else {
        // Exponential backoff for other errors
        const delay = backoffMs * Math.pow(2, attempt - 1)
        await sleep(delay)
      }
    }
  }

  throw lastError || new Error('Max retry attempts exceeded')
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class RequestQueue {
  private queue: Array<() => Promise<void>> = []
  private processing = false
  private rateLimiter: RateLimiter

  constructor(rateLimiter: RateLimiter) {
    this.rateLimiter = rateLimiter
  }

  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          await this.rateLimiter.acquire()
          const result = await fn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })

      if (!this.processing) {
        this.processQueue()
      }
    })
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return
    }

    this.processing = true

    while (this.queue.length > 0) {
      const task = this.queue.shift()
      if (task) {
        try {
          await task()
        } catch (error) {
          console.error('Queue task failed:', error)
        }
      }
    }

    this.processing = false
  }

  getQueueLength(): number {
    return this.queue.length
  }

  clear(): void {
    this.queue = []
  }
}

// Default rate limiters for different services
export const geminiRateLimiter = new RateLimiter({
  maxTokens: 10,
  refillRate: 1,
  refillInterval: 1000, // 1 second
})

export const mapsRateLimiter = new RateLimiter({
  maxTokens: 50,
  refillRate: 5,
  refillInterval: 1000, // 1 second
})

export const placesRateLimiter = new RateLimiter({
  maxTokens: 30,
  refillRate: 3,
  refillInterval: 1000, // 1 second
})

export const directionsRateLimiter = new RateLimiter({
  maxTokens: 20,
  refillRate: 2,
  refillInterval: 1000, // 1 second
})

// Made with Bob
