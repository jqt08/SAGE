/**
 * Steam Store API Service
 * ONLY used for detecting Coming Soon / unreleased games
 * Rate limit: ~200 requests per 5 minutes
 */

import { SteamStoreAppDetails, SteamStoreAppDetailsSchema } from '@/types/steam';
import { fetchWithRetry, RateLimiter } from '@/lib/http';

const STEAMSTORE_BASE =
  import.meta.env.VITE_STEAMSTORE_BASE || 'https://store.steampowered.com/api';

// Rate limiter: ~200 requests per 5 minutes = 0.66 rps
const rateLimiter = new RateLimiter(200, 0.66);

interface StoreAppDetailsOptions {
  cc?: string; // Country code
  l?: string; // Language
}

/**
 * Get app details from Steam Store
 * ONLY use this to check if a game is Coming Soon
 * DO NOT use for other data - use SteamSpy instead
 */
export async function getAppDetails(
  appid: number,
  options: StoreAppDetailsOptions = {},
  signal?: AbortSignal
): Promise<SteamStoreAppDetails> {
  await rateLimiter.acquire();

  const { cc = 'us', l = 'english' } = options;
  const url = `${STEAMSTORE_BASE}/appdetails?appids=${appid}&cc=${cc}&l=${l}`;

  try {
    const response = await fetchWithRetry<Record<string, unknown>>(url, {
      signal,
      ttl: 60 * 60 * 1000, // Cache for 1 hour (release status doesn't change often)
    });

    // Steam Store API returns: { "appid": { success: true, data: {...} } }
    const appData = response[appid.toString()];

    // Validate with Zod
    const validated = SteamStoreAppDetailsSchema.parse(appData);
    return validated;
  } catch (error) {
    // If the app doesn't exist or API fails, return a default response
    console.warn(`Failed to fetch Steam Store data for appid ${appid}:`, error);
    return {
      success: false,
      data: undefined,
    };
  }
}

/**
 * Check if a game is Coming Soon (unreleased)
 */
export async function isComingSoon(
  appid: number,
  signal?: AbortSignal
): Promise<boolean> {
  try {
    const details = await getAppDetails(appid, {}, signal);
    return details.data?.release_date?.coming_soon ?? false;
  } catch {
    return false;
  }
}

/**
 * Get release date info
 */
export async function getReleaseDate(
  appid: number,
  signal?: AbortSignal
): Promise<{ comingSoon: boolean; date: string } | null> {
  try {
    const details = await getAppDetails(appid, {}, signal);
    if (!details.data?.release_date) return null;

    return {
      comingSoon: details.data.release_date.coming_soon,
      date: details.data.release_date.date,
    };
  } catch {
    return null;
  }
}
