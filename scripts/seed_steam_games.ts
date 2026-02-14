#!/usr/bin/env -S node --no-warnings --loader ts-node/esm
/**
 * Robust SteamSpy + Steam Web API Seeding Script
 * 
 * Features:
 * - Multi-source collection: SteamSpy lists, genres, Steam Web API catalog
 * - Deduplication with Set<number>
 * - Resumable checkpoints (JSON on disk)
 * - Batched upserts with exponential backoff retry
 * - Rate limiting and polite API throttling
 * - Comprehensive logging and instrumentation
 * 
 * Usage:
 *   SEED_LIMIT=10000 npx ts-node scripts/seed_steam_games.ts
 * 
 * Environment Variables:
 *   SUPABASE_URL                 — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY    — Supabase service role key
 *   STEAMSPY_BASE                — SteamSpy API base URL (default: https://steamspy.com/api.php)
 *   STEAM_WEB_API_BASE           — Steam Web API base (default: https://api.steampowered.com)
 *   SEED_LIMIT                   — Target number of unique appids to seed (default: 10000)
 *   CONCURRENCY                  — Parallel detail fetches (default: 1; increase carefully)
 *   REQUEST_INTERVAL_MS          — Delay between requests in ms (default: 1200)
 *   CHECKPOINT_FILE              — Path to resume checkpoint (default: .seed-checkpoint.json)
 *   BATCH_SIZE                   — Upsert batch size (default: 250)
 */

import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// ============================================================================
// Config & Env Vars
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STEAMSPY_BASE = process.env.STEAMSPY_BASE || 'https://steamspy.com/api.php';
const STEAM_WEB_API_BASE = process.env.STEAM_WEB_API_BASE || 'https://api.steampowered.com';
const SEED_LIMIT = parseInt(process.env.SEED_LIMIT || '10000', 10);
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '1', 10);
const REQUEST_INTERVAL_MS = parseInt(process.env.REQUEST_INTERVAL_MS || '1200', 10);
const CHECKPOINT_FILE = process.env.CHECKPOINT_FILE || '.seed-checkpoint.json';
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '250', 10);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================================
// Logging & Formatting
// ============================================================================

function log(prefix: string, msg: string) {
  console.log(`${new Date().toISOString()} ${prefix} ${msg}`);
}

function logInfo(msg: string) { log('ℹ️', msg); }
function logSuccess(msg: string) { log('✅', msg); }
function logWarn(msg: string) { log('⚠️', msg); }
function logError(msg: string) { log('❌', msg); }
function logDebug(msg: string) { if (process.env.DEBUG) log('🔍', msg); }

// ============================================================================
// Utilities: Sleep, Backoff, Fetch with Retry
// ============================================================================

async function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchWithBackoff(
  url: string,
  maxAttempts = 3,
  initialDelay = 1000
): Promise<Record<string, any>> {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      logDebug(`Fetching (attempt ${attempt}/${maxAttempts}): ${url}`);
      const res = await fetch(url, { timeout: 30000 } as any);
      
      if (res.status === 429) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        logWarn(`Rate limited (429). Waiting ${delay}ms before retry...`);
        await sleep(delay);
        continue;
      }
      
      if (!res.ok) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        logWarn(`HTTP ${res.status}. Waiting ${delay}ms before retry...`);
        await sleep(delay);
        continue;
      }
      
      const text = await res.text();
      if (!text) return {};
      return JSON.parse(text) as Record<string, any>;
    } catch (e) {
      lastError = e as Error;
      if (attempt < maxAttempts) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        logDebug(`Fetch error (attempt ${attempt}): ${(e as Error).message}. Waiting ${delay}ms...`);
        await sleep(delay);
      }
    }
  }
  throw lastError || new Error(`Failed after ${maxAttempts} attempts`);
}

// ============================================================================
// Checkpoint: Save & Load Resume State
// ============================================================================

interface Checkpoint {
  stage: string;
  appidsCollected: number[];
  lastProcessedIndex: number;
  batchesUpserted: number;
  timestamp: string;
}

function saveCheckpoint(checkpoint: Checkpoint) {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2), 'utf-8');
  logDebug(`Checkpoint saved: ${CHECKPOINT_FILE}`);
}

function loadCheckpoint(): Checkpoint | null {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf-8')) as Checkpoint;
      logInfo(`Resuming from checkpoint: stage="${data.stage}", appids=${data.appidsCollected.length}, lastIdx=${data.lastProcessedIndex}`);
      return data;
    } catch (e) {
      logWarn(`Failed to load checkpoint: ${(e as Error).message}`);
    }
  }
  return null;
}

function clearCheckpoint() {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    fs.unlinkSync(CHECKPOINT_FILE);
    logDebug(`Checkpoint cleared.`);
  }
}

// ============================================================================
// App ID Collection: Multi-Source
// ============================================================================

async function collectFromSteamSpyTopLists(): Promise<Set<number>> {
  const ids = new Set<number>();
  const lists = ['top100owned', 'top100in2weeks', 'top100forever'];
  
  logInfo(`Collecting from SteamSpy top 100 lists (${lists.join(', ')})`);
  
  for (const list of lists) {
    const url = `${STEAMSPY_BASE}?request=${list}`;
    try {
      logDebug(`Fetching ${list}...`);
      const data = await fetchWithBackoff(url);
      const before = ids.size;
      Object.keys(data).forEach(k => {
        const appid = parseInt(k, 10);
        if (!isNaN(appid)) ids.add(appid);
      });
      const added = ids.size - before;
      logSuccess(`  ${list}: ${Object.keys(data).length} items, ${added} new unique IDs (total: ${ids.size})`);
      await sleep(REQUEST_INTERVAL_MS);
    } catch (e) {
      logWarn(`  Failed to fetch ${list}: ${(e as Error).message}`);
    }
  }
  
  logInfo(`SteamSpy top lists: ${ids.size} appids collected`);
  return ids;
}

async function collectFromSteamSpyGenres(): Promise<Set<number>> {
  const ids = new Set<number>();
  // Common Steam genres; SteamSpy limits to ~100 per genre
  const genres = [
    'Action', 'Adventure', 'Casual', 'Indie', 'RPG', 'Simulation', 'Sports',
    'Strategy', 'Early Access'
  ];
  
  logInfo(`Collecting from SteamSpy genre requests (${genres.length} genres)`);
  
  for (const genre of genres) {
    const url = `${STEAMSPY_BASE}?request=genre&genre=${encodeURIComponent(genre)}`;
    try {
      logDebug(`Fetching genre=${genre}...`);
      const data = await fetchWithBackoff(url);
      const before = ids.size;
      Object.keys(data).forEach(k => {
        const appid = parseInt(k, 10);
        if (!isNaN(appid)) ids.add(appid);
      });
      const added = ids.size - before;
      logSuccess(`  ${genre}: ${Object.keys(data).length} items, ${added} new unique IDs (total: ${ids.size})`);
      await sleep(REQUEST_INTERVAL_MS);
    } catch (e) {
      logWarn(`  Failed to fetch genre ${genre}: ${(e as Error).message}`);
    }
  }
  
  logInfo(`SteamSpy genres: ${ids.size} appids collected total`);
  return ids;
}

async function collectFromSteamWebAPI(): Promise<Set<number>> {
  const ids = new Set<number>();
  
  logInfo(`Collecting from Steam Web API /GetAppList`);
  
  const url = `${STEAM_WEB_API_BASE}/ISteamApps/GetAppList/v2/`;
  try {
    logDebug(`Fetching full Steam app list...`);
    const data = await fetchWithBackoff(url);
    const apps = (data.applist?.apps || []) as Array<{ appid: number; name: string }>;
    logSuccess(`  Got ${apps.length} apps from Steam Web API`);
    
    // Filter out some known invalid IDs (ID 0, deprecated, etc.)
    apps.forEach(app => {
      if (app.appid > 0) {
        ids.add(app.appid);
      }
    });
    
    logSuccess(`Steam Web API: ${ids.size} appids (after filtering invalid IDs)`);
    await sleep(REQUEST_INTERVAL_MS);
  } catch (e) {
    logWarn(`Failed to fetch Steam Web API: ${(e as Error).message}`);
  }
  
  return ids;
}

async function collectFromSteamSpyAll(): Promise<Set<number>> {
  const ids = new Set<number>();
  
  logInfo(`Collecting from SteamSpy request=all (comprehensive but slow)`);
  
  const url = `${STEAMSPY_BASE}?request=all`;
  try {
    logDebug(`Fetching request=all...`);
    const data = await fetchWithBackoff(url);
    Object.keys(data).forEach(k => {
      const appid = parseInt(k, 10);
      if (!isNaN(appid)) ids.add(appid);
    });
    logSuccess(`SteamSpy request=all: ${ids.size} appids collected`);
    await sleep(REQUEST_INTERVAL_MS);
  } catch (e) {
    logWarn(`Failed to fetch request=all: ${(e as Error).message}`);
  }
  
  return ids;
}

async function collectAllAppIds(): Promise<number[]> {
  logInfo(`\n${'═'.repeat(70)}`);
  logInfo(`PHASE 1: Collecting App IDs (target: ${SEED_LIMIT})`);
  logInfo(`${'═'.repeat(70)}\n`);
  
  const allIds = new Set<number>();
  let checkpoint = loadCheckpoint();
  
  if (checkpoint && checkpoint.stage === 'collection') {
    logInfo(`Resuming from checkpoint with ${checkpoint.appidsCollected.length} appids`);
    checkpoint.appidsCollected.forEach(id => allIds.add(id));
  } else {
    // Stage 1: SteamSpy top lists (~300 unique games)
    const topIds = await collectFromSteamSpyTopLists();
    topIds.forEach(id => allIds.add(id));
    
    // Stage 2: SteamSpy genres (~1000-2000 additional games)
    const genreIds = await collectFromSteamSpyGenres();
    genreIds.forEach(id => allIds.add(id));
    
    // Stage 3: Steam Web API full catalog (~200k+ games, but many invalid)
    const webIds = await collectFromSteamWebAPI();
    webIds.forEach(id => allIds.add(id));
    
    // Stage 4: SteamSpy request=all (~5000-8000 games)
    const allSteamSpyIds = await collectFromSteamSpyAll();
    allSteamSpyIds.forEach(id => allIds.add(id));
  }
  
  const collectedArray = Array.from(allIds);
  logInfo(`\n📈 Collected appids before slice: ${collectedArray.length}`);
  
  // Save checkpoint before slicing
  saveCheckpoint({
    stage: 'collection',
    appidsCollected: collectedArray,
    lastProcessedIndex: 0,
    batchesUpserted: 0,
    timestamp: new Date().toISOString(),
  });
  
  // Final slice
  const sliced = collectedArray.slice(0, SEED_LIMIT);
  logInfo(`📊 IDs after slice(0, ${SEED_LIMIT}): ${sliced.length}`);
  
  if (sliced.length < SEED_LIMIT) {
    logWarn(`Requested ${SEED_LIMIT} but only ${sliced.length} unique appids available`);
  }
  
  return sliced;
}

// ============================================================================
// Detail Fetching & Upserting (Batched with Retry)
// ============================================================================

interface GameRow {
  appid: number;
  name: string;
  developer: string | null;
  publisher: string | null;
  owners: string | null;
  owners_midpoint: number | null;
  average_forever: number | null;
  average_2weeks: number | null;
  median_forever: number | null;
  median_2weeks: number | null;
  ccu: number | null;
  price: number | null;
  initialprice: number | null;
  discount: number | null;
  languages: string | null;
  genre: string | null;
  tags: Record<string, any> | null;
  positive: number | null;
  negative: number | null;
  score_rank: number | null;
  userscore: number | null;
  updated_at: string;
}

async function fetchGameDetails(appid: number): Promise<GameRow | null> {
  const url = `${STEAMSPY_BASE}?request=appdetails&appid=${appid}`;
  try {
    const details = await fetchWithBackoff(url, 3, 500);
    
    if (!details.appid) {
      logDebug(`Appid ${appid}: no details returned`);
      return null;
    }
    
    const row: GameRow = {
      appid: details.appid,
      name: details.name || `Unknown (${appid})`,
      developer: details.developer || null,
      publisher: details.publisher || null,
      owners: details.owners || null,
      owners_midpoint: null,
      average_forever: details.average_forever || null,
      average_2weeks: details.average_2weeks || null,
      median_forever: details.median_forever || null,
      median_2weeks: details.median_2weeks || null,
      ccu: details.ccu || null,
      price: details.price || null,
      initialprice: details.initialprice || null,
      discount: details.discount || null,
      languages: details.languages || null,
      genre: details.genre || null,
      tags: details.tags || null,
      positive: details.positive || null,
      negative: details.negative || null,
      score_rank: details.score_rank || null,
      userscore: details.userscore || null,
      updated_at: new Date().toISOString(),
    };
    
    return row;
  } catch (e) {
    logDebug(`Failed to fetch details for appid ${appid}: ${(e as Error).message}`);
    return null;
  }
}

async function upsertBatch(rows: GameRow[], batchNumber: number): Promise<{ success: number; failed: number }> {
  if (rows.length === 0) return { success: 0, failed: 0 };
  
  try {
    logDebug(`Upserting batch ${batchNumber} (${rows.length} rows)...`);
    const { error } = await supabase
      .from('steam_games')
      .upsert(rows, { onConflict: 'appid' });
    
    if (error) {
      logError(`Batch ${batchNumber} upsert error: ${error.message}`);
      return { success: 0, failed: rows.length };
    }
    
    logSuccess(`Batch ${batchNumber}: Upserted ${rows.length} rows`);
    return { success: rows.length, failed: 0 };
  } catch (e) {
    logError(`Batch ${batchNumber} exception: ${(e as Error).message}`);
    return { success: 0, failed: rows.length };
  }
}

async function fetchAndUpsertDetails(appids: number[]): Promise<void> {
  logInfo(`\n${'═'.repeat(70)}`);
  logInfo(`PHASE 2: Fetching Game Details & Upserting (${appids.length} games)`);
  logInfo(`${'═'.repeat(70)}\n`);
  
  let checkpoint = loadCheckpoint();
  const startIdx = checkpoint?.lastProcessedIndex || 0;
  
  if (startIdx > 0) {
    logInfo(`Resuming from appid index ${startIdx}`);
  }
  
  let totalSuccess = 0;
  let totalFailed = 0;
  let batchNumber = checkpoint?.batchesUpserted || 0;
  const batch: GameRow[] = [];
  
  const startTime = Date.now();
  const estimatedMs = appids.length * REQUEST_INTERVAL_MS;
  logInfo(`Estimated time: ~${Math.ceil(estimatedMs / 1000 / 60)} minutes (with ${REQUEST_INTERVAL_MS}ms delays)\n`);
  
  for (let i = startIdx; i < appids.length; i++) {
    const appid = appids[i];
    
    // Fetch details with backoff retry
    const row = await fetchGameDetails(appid);
    if (row) {
      batch.push(row);
    }
    
    // When batch is full, upsert
    if (batch.length >= BATCH_SIZE || i === appids.length - 1) {
      batchNumber++;
      const { success, failed } = await upsertBatch(batch, batchNumber);
      totalSuccess += success;
      totalFailed += failed;
      
      logInfo(`Progress: [${i + 1}/${appids.length}] (${totalSuccess} seeded, ${totalFailed} failed)`);
      
      // Save checkpoint
      saveCheckpoint({
        stage: 'upserting',
        appidsCollected: appids,
        lastProcessedIndex: i + 1,
        batchesUpserted: batchNumber,
        timestamp: new Date().toISOString(),
      });
      
      batch.length = 0; // clear batch
    }
    
    // Rate limiting
    await sleep(REQUEST_INTERVAL_MS);
    
    // Show elapsed every 100 items
    if ((i + 1) % 100 === 0) {
      const elapsed = Date.now() - startTime;
      const rate = (i + 1) / (elapsed / 1000);
      logDebug(`Throughput: ${rate.toFixed(1)} items/sec`);
    }
  }
  
  const elapsed = Date.now() - startTime;
  logInfo(`\n✅ Upsert phase complete: ${totalSuccess} seeded, ${totalFailed} failed (${(elapsed / 1000).toFixed(1)}s)`);
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  try {
    logInfo(`\n${'═'.repeat(70)}`);
    logInfo(`🌱 SteamSpy + Steam Web API Seeder`);
    logInfo(`${'═'.repeat(70)}`);
    logInfo(`Configuration:`);
    logInfo(`  SEED_LIMIT: ${SEED_LIMIT}`);
    logInfo(`  BATCH_SIZE: ${BATCH_SIZE}`);
    logInfo(`  REQUEST_INTERVAL_MS: ${REQUEST_INTERVAL_MS}`);
    logInfo(`  CHECKPOINT_FILE: ${CHECKPOINT_FILE}`);
    logInfo(`  SUPABASE_URL: ${SUPABASE_URL}`);
    logInfo(`${'═'.repeat(70)}\n`);
    
    // Phase 1: Collect all appids
    const appids = await collectAllAppIds();
    
    // Phase 2: Fetch details and upsert
    await fetchAndUpsertDetails(appids);
    
    // Success: clear checkpoint
    clearCheckpoint();
    
    logInfo(`\n${'═'.repeat(70)}`);
    logSuccess(`SEEDING COMPLETE! ${appids.length} games processed.`);
    logInfo(`${'═'.repeat(70)}\n`);
    
  } catch (e) {
    logError(`Fatal error: ${(e as Error).message}`);
    logError(`(Checkpoint saved; run again to resume from last position)`);
    process.exit(1);
  }
}

main();
