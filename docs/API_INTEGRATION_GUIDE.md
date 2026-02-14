# API Integration Guide

## 🎯 Current Status: Using Mock Data

Your application is currently using **mock data** with **30+ sample games** across all genres. This is perfect for development and demonstrations!

---

## 🔑 IMPORTANT: No API Keys Needed!

### SteamSpy API
- ✅ **Completely FREE**
- ✅ **No registration required**
- ✅ **No API key needed**
- ✅ **Public data access**

### Steam Store API  
- ✅ **Completely FREE**
- ✅ **No registration required**
- ✅ **No API key needed**
- ✅ **Public data access**

**The only issue is CORS** (browser security), not authentication!

---

## 📚 Mock Data Overview

### Current Database: 30+ Games

#### **By Category:**
- **Indie Games** (5 games)
  - Stardew Valley, Hollow Knight, Slay the Spire, Dead Cells, Undertale

- **Strategy Games** (5 games)
  - Factorio, Dwarf Fortress, Warframe, Cyberpunk 2077, RimWorld

- **Survival/Sandbox** (5 games)
  - Terraria, Valheim, PUBG, Rust, The Forest

- **Action/Multiplayer** (5 games)
  - Among Us, Dota 2, Counter-Strike 2, Apex Legends, Forza Horizon 5

- **RPG Games** (5 games)
  - ELDEN RING, The Witcher 3, Hogwarts Legacy, Red Dead Redemption 2, NARAKA: BLADEPOINT

- **Early Access** (5 games)
  - Baldur's Gate 3, Starfield, Palworld, Manor Lords, Hades II

- **Coming Soon** (5 games)
  - Hollow Knight: Silksong, GTA 6, Black Myth: Wukong, S.T.A.L.K.E.R. 2, Fable

### Testing the App

Try searching for:
- "**stardew**" → Farming simulation
- "**hollow**" → Metroidvania
- "**counter**" → FPS
- "**witcher**" → RPG
- "**among**" → Multiplayer party game

Or browse **Early Access** games directly!

---

## 🚀 Switching to Real API Data

### Step 1: Choose Your Integration Method

You have 3 options:

#### **Option A: CORS Proxy (Quickest)**
Simple proxy URL prefix - works immediately!

#### **Option B: Custom Backend** 
Your own Node.js/Express server - full control!

#### **Option C: Serverless Functions**
Deploy on Vercel/Netlify - scalable and free!

---

## Option A: CORS Proxy (5 minutes)

### 1. Choose a Proxy Service

```bash
# Free options:
- https://corsproxy.io/?
- https://api.allorigins.win/get?url=
```

### 2. Update Environment Variables

```env
# .env
VITE_USE_REAL_API=true
VITE_CORS_PROXY=https://corsproxy.io/?
VITE_STEAMSPY_BASE=https://steamspy.com/api.php
VITE_STEAMSTORE_BASE=https://store.steampowered.com/api
```

### 3. Update `/src/services/steamspy.ts`

```typescript
const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true';
const CORS_PROXY = import.meta.env.VITE_CORS_PROXY || '';
const STEAMSPY_BASE = import.meta.env.VITE_STEAMSPY_BASE || 'https://steamspy.com/api.php';

// Add proxy if using real API
const BASE_URL = USE_REAL_API 
  ? `${CORS_PROXY}${STEAMSPY_BASE}`
  : STEAMSPY_BASE;

export async function getAppDetails(appid: number, signal?: AbortSignal): Promise<SteamSpyAppDetails> {
  await rateLimiter.acquire();
  
  const url = `${BASE_URL}?request=appdetails&appid=${appid}`;
  const data = await fetchWithRetry<unknown>(url, { signal });
  
  return SteamSpyAppDetailsSchema.parse(data);
}
```

### 4. Update `/src/app/components/predict/SearchPanel.tsx`

Change imports from:
```typescript
import { mockSearchGames, mockGetAppDetails, mockGetEarlyAccess } from '@/services/mockSteamData';
```

To:
```typescript
import { searchByName, getAppDetails, getByTag } from '@/services/steamspy';
import { isComingSoon } from '@/services/steamStore';
```

Then update query functions:
```typescript
// Before:
queryFn: async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockGetEarlyAccess();
}

// After:
queryFn: () => getByTag('Early Access')
```

⚠️ **Note:** Free CORS proxies have rate limits (usually 100-200 requests/day).

---

## Option B: Custom Backend (Best for Production)

### 1. Create Backend Server

```bash
mkdir steam-proxy-server
cd steam-proxy-server
npm init -y
npm install express cors axios dotenv
```

### 2. Create `server.js`

```javascript
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for your frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 1 // 1 request per second (SteamSpy limit)
});

// SteamSpy endpoints
app.get('/api/steamspy/appdetails/:appid', limiter, async (req, res) => {
  try {
    const { appid } = req.params;
    const url = `https://steamspy.com/api.php?request=appdetails&appid=${appid}`;
    
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('SteamSpy error:', error.message);
    res.status(500).json({ error: 'Failed to fetch from SteamSpy' });
  }
});

app.get('/api/steamspy/tag/:tag', limiter, async (req, res) => {
  try {
    const { tag } = req.params;
    const url = `https://steamspy.com/api.php?request=tag&tag=${encodeURIComponent(tag)}`;
    
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('SteamSpy error:', error.message);
    res.status(500).json({ error: 'Failed to fetch from SteamSpy' });
  }
});

// Steam Store endpoints
app.get('/api/steam/appdetails/:appid', async (req, res) => {
  try {
    const { appid } = req.params;
    const url = `https://store.steampowered.com/api/appdetails?appids=${appid}`;
    
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Steam Store error:', error.message);
    res.status(500).json({ error: 'Failed to fetch from Steam Store' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Steam Proxy Server running on http://localhost:${PORT}`);
  console.log(`📊 SteamSpy: http://localhost:${PORT}/api/steamspy/appdetails/413150`);
  console.log(`🎮 Steam Store: http://localhost:${PORT}/api/steam/appdetails/413150`);
});
```

### 3. Create `.env` for Backend

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 4. Update Frontend `.env`

```env
VITE_USE_REAL_API=true
VITE_STEAMSPY_BASE=http://localhost:3001/api/steamspy
VITE_STEAMSTORE_BASE=http://localhost:3001/api/steam
```

### 5. Run Both Servers

```bash
# Terminal 1 - Backend
cd steam-proxy-server
node server.js

# Terminal 2 - Frontend
npm run dev
```

---

## Option C: Serverless Functions (Vercel)

### 1. Create API Routes

Create `api/steamspy.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

const RATE_LIMIT_MS = 1000; // 1 second
let lastRequest = 0;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Simple rate limiting
  const now = Date.now();
  if (now - lastRequest < RATE_LIMIT_MS) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  lastRequest = now;

  const { request: requestType, appid, tag, genre } = req.query;

  try {
    let url = `https://steamspy.com/api.php?request=${requestType}`;
    
    if (appid) url += `&appid=${appid}`;
    if (tag) url += `&tag=${encodeURIComponent(tag as string)}`;
    if (genre) url += `&genre=${encodeURIComponent(genre as string)}`;

    const response = await fetch(url);
    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=300'); // Cache for 5 minutes
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
```

Create `api/steam.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { appids } = req.query;

  try {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appids}`;
    const response = await fetch(url);
    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=3600'); // Cache for 1 hour
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
```

### 2. Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

### 3. Update Frontend `.env`

```env
VITE_USE_REAL_API=true
VITE_STEAMSPY_BASE=https://your-app.vercel.app/api/steamspy
VITE_STEAMSTORE_BASE=https://your-app.vercel.app/api/steam
```

---

## 🧪 Testing Your Integration

### Test SteamSpy Endpoint

```bash
# Get Stardew Valley details
curl "http://localhost:3001/api/steamspy/appdetails/413150"

# Get Early Access games
curl "http://localhost:3001/api/steamspy/tag/Early%20Access"
```

### Test Steam Store Endpoint

```bash
# Check if game is Coming Soon
curl "http://localhost:3001/api/steam/appdetails/413150"
```

### Expected Response Format

**SteamSpy:**
```json
{
  "appid": 413150,
  "name": "Stardew Valley",
  "developer": "ConcernedApe",
  "positive": 580000,
  "negative": 8500,
  "owners": "10,000,000 .. 20,000,000",
  "average_forever": 52000,
  ...
}
```

**Steam Store:**
```json
{
  "413150": {
    "success": true,
    "data": {
      "type": "game",
      "name": "Stardew Valley",
      "steam_appid": 413150,
      "release_date": {
        "coming_soon": false,
        "date": "Feb 26, 2016"
      },
      ...
    }
  }
}
```

---

## 🔄 Toggling Between Mock and Real Data

### Easy Toggle System

Add this to your `.env`:

```env
# Set to 'true' for real API, 'false' for mock data
VITE_USE_REAL_API=false
```

### Update Services to Support Toggle

In `/src/services/steamspy.ts`:

```typescript
const USE_MOCK = import.meta.env.VITE_USE_REAL_API !== 'true';

export async function getAppDetails(appid: number, signal?: AbortSignal) {
  if (USE_MOCK) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockGetAppDetails(appid);
  }
  
  // Real API call
  await rateLimiter.acquire();
  const url = `${STEAMSPY_BASE}?request=appdetails&appid=${appid}`;
  const data = await fetchWithRetry<unknown>(url, { signal });
  return SteamSpyAppDetailsSchema.parse(data);
}
```

---

## 📊 API Rate Limits & Best Practices

### SteamSpy
- **Limit:** ~1 request per second
- **Cache:** Data updates every ~12 hours
- **Strategy:** Cache responses for 5+ minutes

### Steam Store
- **Limit:** ~200 requests per 5 minutes
- **Cache:** Game details don't change often
- **Strategy:** Cache responses for 1+ hour

### Built-in Protections

Your app already includes:
- ✅ **Rate limiting** (`/src/lib/http.ts`)
- ✅ **Request caching** (LRU cache)
- ✅ **Retry with exponential backoff**
- ✅ **Error handling**

---

## 🐛 Troubleshooting

### CORS Errors
- ✅ Solution: Use a backend proxy (Options B or C)
- ❌ Don't: Try to disable browser security

### Rate Limit Errors
- ✅ Solution: Increase cache TTL, reduce request frequency
- ✅ Check: Rate limiter configuration in `/src/lib/http.ts`

### Invalid Data
- ✅ Solution: Check Zod schemas in `/src/types/steam.ts`
- ✅ Debug: Log raw API responses

---

## 📝 Summary

1. **Current:** Using mock data (30+ games, all features work)
2. **No API Keys:** SteamSpy and Steam Store are completely free!
3. **Only Issue:** CORS (browser security)
4. **Solutions:** Choose Option A (quick), B (production), or C (scalable)
5. **Toggle:** Easy switch between mock and real data

**Need help?** See `/docs/TROUBLESHOOTING.md`

---

## 🎮 Next Steps

1. **Now:** Use the app with mock data
2. **Later:** Set up Option B (backend) for production
3. **Deploy:** Use Option C (Vercel) for scalability
4. **Monitor:** Track API usage and cache hit rates

Your ML model integration is ready - just replace the placeholder in `/src/analytics/successModel.ts`!
