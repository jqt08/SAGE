/**
 * SteamSpy API Service
 * Rate limit: ~1 request per second
 * No API key required - public API
 */

import {
  SteamSpyAppDetails,
  SteamSpyAppDetailsSchema,
  SteamSpyListResponse,
  SteamSpyListResponseSchema,
} from '@/types/steam';
import { fetchWithRetry, RateLimiter } from '@/lib/http';

const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true';
const CORS_PROXY = import.meta.env.VITE_CORS_PROXY || '';
const STEAMSPY_BASE_RAW = import.meta.env.VITE_STEAMSPY_BASE || 'https://steamspy.com/api.php';

// Add CORS proxy if using real API
const STEAMSPY_BASE = USE_REAL_API ? `${CORS_PROXY}${STEAMSPY_BASE_RAW}` : STEAMSPY_BASE_RAW;

// Rate limiter: 1 request per second
const rateLimiter = new RateLimiter(1, 1);

/**
 * Get detailed app information
 */
export async function getAppDetails(
  appid: number,
  signal?: AbortSignal
): Promise<SteamSpyAppDetails> {
  await rateLimiter.acquire();

  const url = `${STEAMSPY_BASE}?request=appdetails&appid=${appid}`;

  const data = await fetchWithRetry<unknown>(url, { signal });

  // Validate with Zod
  const validated = SteamSpyAppDetailsSchema.parse(data);
  return validated;
}

/**
 * Get games by tag (e.g., "Early Access")
 */
export async function getByTag(
  tag: string,
  signal?: AbortSignal
): Promise<SteamSpyListResponse> {
  await rateLimiter.acquire();

  const encodedTag = encodeURIComponent(tag);
  const url = `${STEAMSPY_BASE}?request=tag&tag=${encodedTag}`;

  const data = await fetchWithRetry<unknown>(url, { signal });

  // Validate with Zod
  const validated = SteamSpyListResponseSchema.parse(data);
  return validated;
}

/**
 * Get games by genre
 */
export async function getByGenre(
  genre: string,
  signal?: AbortSignal
): Promise<SteamSpyListResponse> {
  await rateLimiter.acquire();

  const encodedGenre = encodeURIComponent(genre);
  const url = `${STEAMSPY_BASE}?request=genre&genre=${encodedGenre}`;

  const data = await fetchWithRetry<unknown>(url, { signal });

  // Validate with Zod
  const validated = SteamSpyListResponseSchema.parse(data);
  return validated;
}

/**
 * Get top games lists
 */
export async function getTop(
  kind: 'in2weeks' | 'forever' | 'owned',
  signal?: AbortSignal
): Promise<SteamSpyListResponse> {
  await rateLimiter.acquire();

  const requestMap = {
    in2weeks: 'top100in2weeks',
    forever: 'top100forever',
    owned: 'top100owned',
  };

  const request = requestMap[kind];
  const url = `${STEAMSPY_BASE}?request=${request}`;

  const data = await fetchWithRetry<unknown>(url, { signal });

  // Validate with Zod
  const validated = SteamSpyListResponseSchema.parse(data);
  return validated;
}

/**
 * Search games by name (using all games list - note: heavy call)
 * Prefer server-side proxy if configured (avoids CORS and heavy client calls)
 */
export async function searchByName(
  query: string,
  signal?: AbortSignal
): Promise<SteamSpyListResponse> {
  await rateLimiter.acquire();

  const PROXY = import.meta.env.VITE_STEAM_PROXY_URL || '';
  if (PROXY && PROXY.length > 0) {
    const url = `${PROXY.replace(/\/$/, '')}/steam-proxy/search?q=${encodeURIComponent(query)}`;
    const data = await fetchWithRetry<unknown>(url, { signal, ttl: 60 * 1000 });
    const validated = SteamSpyListResponseSchema.parse(data);
    return validated;
  }

  // Fallback to direct SteamSpy call
  // Note: request=all is rate limited to 1 per minute
  const url = `${STEAMSPY_BASE}?request=all`;

  const data = await fetchWithRetry<unknown>(url, {
    signal,
    ttl: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const validated = SteamSpyListResponseSchema.parse(data);

  // Filter by query
  const lowerQuery = query.toLowerCase();
  const filtered: SteamSpyListResponse = {};

  for (const [appid, game] of Object.entries(validated)) {
    if (game.name.toLowerCase().includes(lowerQuery)) {
      filtered[appid] = game;
    }
  }

  return filtered;
}

/**
 * Parse owners range to get midpoint
 * Format: "20,000 .. 50,000" or "0 .. 20,000"
 */
export function parseOwnersMidpoint(ownersString: string): number {
  try {
    // Remove commas and split by ".."
    const cleaned = ownersString.replace(/,/g, '');
    const parts = cleaned.split('..').map((s) => s.trim());

    if (parts.length !== 2) return 0;

    const min = parseInt(parts[0], 10);
    const max = parseInt(parts[1], 10);

    if (isNaN(min) || isNaN(max)) return 0;

    return Math.floor((min + max) / 2);
  } catch {
    return 0;
  }
}

/**
 * Extract top N tags from tags object
 */
export function getTopTags(tags: Record<string, number> | undefined, n = 5): string[] {
  if (!tags) return [];

  const sorted = Object.entries(tags)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([tag]) => tag);

  return sorted;
}