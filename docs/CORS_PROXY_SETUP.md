# CORS Proxy Setup for Production

## Current Status: Demo Mode

**The application is currently using mock data** because Steam APIs (SteamSpy and Steam Store) do not allow direct browser requests due to CORS (Cross-Origin Resource Sharing) restrictions.

## Why Mock Data?

Steam APIs don't include CORS headers, which means:
- ❌ Direct browser requests to `steamspy.com` → **BLOCKED**
- ❌ Direct browser requests to `store.steampowered.com` → **BLOCKED**
- ✅ Backend proxy requests → **WORKS**

## Solution for Production

### Option 1: Simple CORS Proxy (Recommended for Prototyping)

Use a CORS proxy service:

```typescript
// In /src/services/steamspy.ts
const PROXY = 'https://corsproxy.io/?';
const STEAMSPY_BASE = `${PROXY}https://steamspy.com/api.php`;
```

**Popular CORS Proxies:**
- `https://corsproxy.io/?` (Free, rate-limited)
- `https://api.allorigins.win/get?url=` (Free, rate-limited)
- `https://cors-anywhere.herokuapp.com/` (Requires requesting access)

⚠️ **Warning:** Public CORS proxies are rate-limited and not suitable for production.

### Option 2: Custom Backend Proxy (Recommended for Production)

Create a simple Node.js/Express backend:

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

// SteamSpy proxy endpoint
app.get('/api/steamspy/*', async (req, res) => {
  try {
    const steamSpyUrl = `https://steamspy.com/api.php${req.url.replace('/api/steamspy', '')}`;
    const response = await axios.get(steamSpyUrl);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from SteamSpy' });
  }
});

// Steam Store proxy endpoint
app.get('/api/steam/*', async (req, res) => {
  try {
    const steamUrl = `https://store.steampowered.com/api${req.url.replace('/api/steam', '')}`;
    const response = await axios.get(steamUrl);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from Steam' });
  }
});

app.listen(3001, () => {
  console.log('CORS proxy running on http://localhost:3001');
});
```

Then update your frontend:

```typescript
// In /src/services/steamspy.ts
const STEAMSPY_BASE = import.meta.env.VITE_STEAMSPY_BASE || 'http://localhost:3001/api/steamspy';
```

### Option 3: Serverless Functions

Deploy proxy functions on:
- **Vercel Functions**
- **Netlify Functions**
- **AWS Lambda**
- **Cloudflare Workers**

Example Vercel function:

```typescript
// api/steamspy.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { appid, request: requestType } = req.query;
  
  try {
    const url = `https://steamspy.com/api.php?request=${requestType}&appid=${appid}`;
    const response = await fetch(url);
    const data = await response.json();
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
```

## Switching from Mock to Real Data

Once you have a proxy set up:

1. **Update environment variables:**
```env
# .env
VITE_STEAMSPY_BASE=https://your-proxy.com/api/steamspy
VITE_STEAMSTORE_BASE=https://your-proxy.com/api/steam
```

2. **Update SearchPanel.tsx:**
```typescript
// Change this:
import { mockSearchGames, mockGetAppDetails, mockGetEarlyAccess } from '@/services/mockSteamData';

// To this:
import { searchByName, getAppDetails, getByTag } from '@/services/steamspy';
import { isComingSoon } from '@/services/steamStore';
```

3. **Update query functions:**
```typescript
// Change this:
queryFn: async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockGetEarlyAccess();
}

// To this:
queryFn: () => getByTag('Early Access')
```

## Rate Limiting

Remember to respect API rate limits:
- **SteamSpy:** ~1 request per second
- **Steam Store:** ~200 requests per 5 minutes

The `/src/lib/http.ts` utility already includes:
- ✅ Rate limiting
- ✅ Request caching
- ✅ Retry with exponential backoff

## Testing Your Proxy

```bash
# Test SteamSpy proxy
curl "https://your-proxy.com/api/steamspy?request=appdetails&appid=413150"

# Test Steam Store proxy
curl "https://your-proxy.com/api/steam/appdetails?appids=413150"
```

## Current Mock Data

The app includes 5 sample games:
- **Stardew Valley** (413150)
- **Hollow Knight** (367520)
- **Factorio** (427520)
- **Terraria** (105600)
- **Among Us** (945360)

You can search for these games or enter their App IDs to test the functionality.

## Questions?

See `/docs/TROUBLESHOOTING.md` for common issues and solutions.
