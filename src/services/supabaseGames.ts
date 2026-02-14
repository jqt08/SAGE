/**
 * Supabase Games Service
 * 
 * Queries the seeded steam_games table from Supabase.
 * Falls back to mock data if Supabase is unavailable.
 */

import { createClient } from '@supabase/supabase-js';
import type { SteamSpyAppDetails } from '@/types/steam';
import { mockGetAllGames, mockGetTotalGamesCount } from './mockSteamData';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client (public/anon key is fine for SELECT queries on public tables)
const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

const USE_SUPABASE = !!supabase && import.meta.env.VITE_USE_SUPABASE !== 'false';

// Log initialization status
console.log('[Supabase] Initialization:', {
  url: SUPABASE_URL ? '✅ present' : '❌ missing',
  key: SUPABASE_KEY ? '✅ present' : '❌ missing',
  clientCreated: !!supabase ? '✅ yes' : '❌ no',
  useSupabase: USE_SUPABASE ? '✅ enabled' : '❌ disabled',
});

// Cache for games list (5 minute TTL)
let cachedGames: SteamSpyAppDetails[] | null = null;
let cachedGameCount: number | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function isCacheValid(): boolean {
  return Date.now() - cacheTimestamp < CACHE_TTL;
}

/**
 * Convert Supabase row to SteamSpyAppDetails format
 */
function rowToGameDetails(row: any): SteamSpyAppDetails {
  return {
    appid: row.appid,
    name: row.name,
    developer: row.developer,
    publisher: row.publisher,
    owners: row.owners,
    average_forever: row.average_forever,
    average_2weeks: row.average_2weeks,
    median_forever: row.median_forever,
    median_2weeks: row.median_2weeks,
    ccu: row.ccu,
    price: row.price?.toString(),
    initialprice: row.initialprice?.toString(),
    discount: row.discount?.toString(),
    languages: row.languages,
    genre: row.genre,
    tags: row.tags || {},
    positive: row.positive,
    negative: row.negative,
    score_rank: row.score_rank,
    userscore: row.userscore,
  };
}

/**
 * Get all games from Supabase or fallback to mock
 */
export async function getAllGamesFromDb(): Promise<SteamSpyAppDetails[]> {
  // Return cached data if valid
  if (USE_SUPABASE && cachedGames && isCacheValid()) {
    console.log(`[Supabase] Returning ${cachedGames.length} games from cache`);
    return cachedGames;
  }

  // Try Supabase first
  if (USE_SUPABASE && supabase) {
    try {
      console.log('[Supabase] Fetching all games from steam_games table...');
      // Note: Supabase default limit is 1000 rows, explicitly set higher to get all seeded games
      const { data, error, count } = await supabase
        .from('steam_games')
        .select('*', { count: 'exact' })
        .order('name', { ascending: true })
        .limit(50000); // Increased from 10000 to handle 1500+ seeded games

      if (error) {
        console.warn('[Supabase] Error fetching games:', error.message);
        // Fall back to mock
        cachedGames = mockGetAllGames();
      } else if (data) {
        cachedGames = data.map(rowToGameDetails);
        cachedGameCount = count || cachedGames.length;
        cacheTimestamp = Date.now();
        console.log(`[Supabase] ✅ Loaded ${cachedGames.length} games from Supabase (total in DB: ${count})`);
        return cachedGames;
      }
    } catch (e) {
      console.warn('[Supabase] Exception fetching games:', (e as Error).message);
      // Fall back to mock
      cachedGames = mockGetAllGames();
    }
  } else {
    console.log('[Supabase] Disabled; using mock data');
    cachedGames = mockGetAllGames();
  }

  cacheTimestamp = Date.now();
  return cachedGames || mockGetAllGames();
}

/**
 * Get total game count from Supabase or fallback to mock
 */
export async function getGameCountFromDb(): Promise<number> {
  // Return cached count if valid
  if (USE_SUPABASE && cachedGameCount !== null && isCacheValid()) {
    console.log(`[Supabase] Returning game count ${cachedGameCount} from cache`);
    return cachedGameCount;
  }

  // Try Supabase first
  if (USE_SUPABASE && supabase) {
    try {
      console.log('[Supabase] Fetching game count...');
      
      // Method 1: Use exact count with head=true (no data, just count)
      const { count: exactCount, error } = await supabase
        .from('steam_games')
        .select('appid', { count: 'exact', head: true });

      if (error) {
        console.warn('[Supabase] Count query error:', error.message);
        // Fall through to mock
      } else if (exactCount !== null && exactCount !== undefined) {
        cachedGameCount = exactCount;
        cacheTimestamp = Date.now();
        console.log(`[Supabase] ✅ Game count from DB: ${cachedGameCount}`);
        return cachedGameCount;
      } else {
        // If count is null/undefined, fall back to fetching and measuring
        console.warn('[Supabase] Count was null, fetching all IDs to count...');
        const { data, error: fetchError } = await supabase
          .from('steam_games')
          .select('appid')
          .limit(100000);
        
        if (!fetchError && data) {
          cachedGameCount = data.length;
          cacheTimestamp = Date.now();
          console.log(`[Supabase] ✅ Game count (from fetch): ${cachedGameCount}`);
          return cachedGameCount;
        } else {
          console.warn('[Supabase] Fallback fetch also failed:', fetchError?.message);
        }
      }
    } catch (e) {
      console.warn('[Supabase] Exception fetching count:', (e as Error).message);
    }
    
    // If we get here, Supabase failed; fall back to mock
    console.warn('[Supabase] Falling back to mock count');
    cachedGameCount = mockGetTotalGamesCount();
  } else {
    console.log('[Supabase] Disabled or not configured; using mock count');
    cachedGameCount = mockGetTotalGamesCount();
  }

  cacheTimestamp = Date.now();
  return cachedGameCount || mockGetTotalGamesCount();
}

/**
 * Search games by name in Supabase
 */
export async function searchGamesInDb(query: string): Promise<SteamSpyAppDetails[]> {
  if (!query || query.length < 2) return [];

  if (USE_SUPABASE && supabase) {
    try {
      console.log(`[Supabase] Searching for "${query}"...`);
      const { data, error } = await supabase
        .from('steam_games')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(1000); // Increased search results

      if (error) {
        console.warn('[Supabase] Search error:', error.message);
        return [];
      }

      const results = (data || []).map(rowToGameDetails);
      console.log(`[Supabase] Found ${results.length} games matching "${query}"`);
      return results;
    } catch (e) {
      console.warn('[Supabase] Search exception:', (e as Error).message);
      return [];
    }
  }

  return [];
}

/**
 * Clear cache (e.g., after seeding)
 */
export function clearGameCache(): void {
  cachedGames = null;
  cachedGameCount = null;
  cacheTimestamp = 0;
  console.log('[Supabase] Cache cleared');
}

/**
 * Check if Supabase is configured and available
 */
export function isSupabaseConfigured(): boolean {
  return USE_SUPABASE && !!supabase;
}

/**
 * Get full game details by appid (for analysis)
 */
export async function getGameDetailsFromDb(appid: number): Promise<any | null> {
  if (!USE_SUPABASE || !supabase) {
    console.warn('[Supabase] Not configured; cannot fetch game details');
    return null;
  }

  try {
    console.log(`[Supabase] Fetching game details for appid ${appid}...`);
    const { data, error } = await supabase
      .from('steam_games')
      .select('*')
      .eq('appid', appid)
      .single();

    if (error) {
      console.warn(`[Supabase] Error fetching game ${appid}:`, error.message);
      return null;
    }

    if (data) {
      // Convert to SteamSpyAppDetails format with proper defaults for missing fields
      const details = {
        appid: data.appid || 0,
        name: data.name || 'Unknown Game',
        developer: data.developer || 'Unknown Developer',
        publisher: data.publisher || 'Unknown Publisher',
        price: String(data.price || 0), // Convert to string (cents)
        initialprice: String(data.initialprice || data.price || 0),
        discount: String(data.discount || 0), // String percentage
        genre: data.genre || 'Indie',
        tags: data.tags || {}, // JSONB field, should be object
        owners: data.owners || '0 .. 0', // Range string
        ccu: data.ccu || 0,
        average_forever: data.average_forever || 0,
        average_2weeks: data.average_2weeks || 0,
        median_forever: data.median_forever || 0,
        median_2weeks: data.median_2weeks || 0,
        positive: data.positive || 0,
        negative: data.negative || 0,
        score_rank: String(data.score_rank || 'N/A'),
        languages: data.languages || '',
        userscore: data.userscore || 0,
        metacritic_score: data.metacritic_score || null,
      };
      console.log(`[Supabase] ✅ Loaded details for ${data.name}`);
      return details;
    }

    return null;
  } catch (e) {
    console.error(`[Supabase] Exception fetching game ${appid}:`, (e as Error).message);
    return null;
  }
}

/**
 * Force clear cache (useful for testing or after seeding)
 */
export function forceRefreshGameData(): void {
  clearGameCache();
  console.log('[Supabase] Force refresh: cache cleared, next queries will hit database');
}
