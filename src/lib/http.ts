/**
 * HTTP utility with retry logic, caching, and rate limiting
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.data;
  }

  set(key: string, data: T, ttl: number): void {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  ttl?: number; // Cache TTL in milliseconds
  skipCache?: boolean;
}

// Global cache instance
const cache = new LRUCache<unknown>(100);

/**
 * Sleep helper for retries
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate jitter for exponential backoff
 */
const jitter = (delay: number): number => {
  return delay + Math.random() * delay * 0.3;
};

/**
 * Fetch wrapper with retry, backoff, jitter, and caching
 */
export async function fetchWithRetry<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    retries = 3,
    retryDelay = 2000, // Increased to 2 seconds
    ttl = 30 * 60 * 1000, // 30 minutes default
    skipCache = false,
    signal,
    ...fetchOptions
  } = options;

  const cacheKey = `${url}-${JSON.stringify(fetchOptions)}`;

  // Check cache first
  if (!skipCache) {
    const cached = cache.get(cacheKey) as T | null;
    if (cached) {
      console.log('🎯 Cache hit:', url);
      return cached;
    }
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`📡 Fetching (attempt ${attempt + 1}/${retries + 1}):`, url);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(url, {
        ...fetchOptions,
        signal: signal || controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as T;

      // Cache successful response
      if (!skipCache) {
        cache.set(cacheKey, data, ttl);
      }

      console.log('✅ Success:', url);
      return data;
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Error (attempt ${attempt + 1}):`, error);

      // Don't retry on abort
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - the API is taking too long to respond');
      }

      // Don't retry if this was the last attempt
      if (attempt === retries) {
        break;
      }

      // Exponential backoff with jitter
      const delay = jitter(retryDelay * Math.pow(2, attempt));
      console.log(`⏳ Waiting ${Math.round(delay)}ms before retry...`);
      await sleep(delay);
    }
  }

  throw lastError || new Error('Request failed after retries');
}

/**
 * Token bucket rate limiter
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRate: number; // tokens per second

  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000; // seconds
    const tokensToAdd = elapsed * this.refillRate;
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  async acquire(): Promise<void> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    // Wait until we can get a token
    const waitTime = ((1 - this.tokens) / this.refillRate) * 1000;
    await sleep(waitTime);
    this.refill();
    this.tokens -= 1;
  }
}

/**
 * Clear cache manually if needed
 */
export function clearCache(): void {
  cache.clear();
}
