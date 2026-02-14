import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();

app.use('*', logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    maxAge: 600,
  }),
);

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

function supabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

const STEAMSPY_BASE = Deno.env.get("VITE_STEAMSPY_BASE") || 'https://steamspy.com/api.php';

async function fetchSteamSpy(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`SteamSpy error ${res.status}`);
  return res.json();
}

// Search (uses SteamSpy request=all and filters server-side)
app.get('/steam-proxy/search', async (c) => {
  const q = String(c.req.query('q') || c.req.query('query') || '');
  if (!q || q.length < 2) return c.json({});

  // WARNING: request=all is heavy; caching recommended on server
  const url = `${STEAMSPY_BASE}?request=all`;
  const data = await fetchSteamSpy(url);

  const lower = q.toLowerCase();
  const filtered: Record<string, any> = {};
  for (const [appid, game] of Object.entries(data)) {
    if ((game as any).name && (game as any).name.toLowerCase().includes(lower)) {
      filtered[appid] = game;
    }
  }

  return c.json(filtered);
});

// Get app details and upsert into Supabase `steam_games` table
app.get('/steam-proxy/app/:appid', async (c) => {
  const appid = c.req.param('appid');
  if (!appid) return c.text('appid required', 400);

  const url = `${STEAMSPY_BASE}?request=appdetails&appid=${appid}`;
  const data = await fetchSteamSpy(url);

  // Validate & transform minimal fields we need
  const details = data as any;
  if (!details || !details.appid) return c.text('not found', 404);

  // Upsert into Supabase
  const supabase = supabaseClient();
  const row = {
    appid: details.appid,
    name: details.name,
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

  const { error } = await supabase.from('steam_games').upsert(row);
  if (error) {
    console.error('Upsert error', error);
    return c.text('upsert failed', 500);
  }

  return c.json({ ok: true, row });
});

// Health
app.get('/steam-proxy/health', (c) => c.json({ status: 'ok' }));

Deno.serve(app.fetch);
