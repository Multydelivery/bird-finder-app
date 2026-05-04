# API Reference - Bird Finder

## eBird API Integration

### Base URL
```
https://api.ebird.org/v2
```

### Endpoint: Get Recent Nearby Observations
```
GET /data/obs/geo/recent
```

**Headers:**
```
X-eBirdApiToken: YOUR_API_KEY
```

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| lat | float | Yes | - | Latitude (-90 to 90) |
| lng | float | Yes | - | Longitude (-180 to 180) |
| dist | integer | No | 25 | Search radius in km (0-50) |
| maxResults | integer | No | 50 | Max results (1-10000) |
| back | integer | No | 14 | Days back to search (1-30) |

**Example Request:**
```bash
curl -X GET "https://api.ebird.org/v2/data/obs/geo/recent?lat=39.75&lng=-86.16&dist=25&maxResults=50" \
  -H "X-eBirdApiToken: YOUR_KEY"
```

**Example Response:**
```json
[
  {
    "speciesCode": "norcar",
    "comName": "Northern Cardinal",
    "sciName": "Cardinalis cardinalis",
    "locName": "Central Park",
    "obsDt": "2026-05-04 10:30",
    "howMany": 3,
    "lat": 40.7829,
    "lng": -73.9654,
    "obsReviewed": true,
    "locationPrivate": false
  }
]
```

---

## Macaulay Library API Integration

### Base URL
```
https://search.macaulaylibrary.org
```

### Endpoint: Search Media
```
GET /catalog.json
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taxonCode | string | Yes | eBird species code |
| mediaType | string | Yes | 'photo' or 'audio' |
| sort | string | No | 'rating_rank_desc' (best first) |
| count | integer | No | Results per page (default: 10) |

**Example Request - Photos:**
```bash
curl -X GET "https://search.macaulaylibrary.org/catalog.json?taxonCode=norcar&mediaType=photo&sort=rating_rank_desc&count=1"
```

**Example Request - Audio:**
```bash
curl -X GET "https://search.macaulaylibrary.org/catalog.json?taxonCode=norcar&mediaType=audio&sort=rating_rank_desc&count=1"
```

**Example Response:**
```json
{
  "results": {
    "content": [
      {
        "assetId": "123456789",
        "mediaUrl": "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/123456789/2400",
        "previewUrl": "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/123456789/1200",
        "scientificName": "Cardinalis cardinalis",
        "commonName": "Northern Cardinal",
        "location": "United States",
        "rating": 4.5
      }
    ]
  }
}
```

---

## Internal API Routes

### 1. Get Nearby Birds with Media

**Endpoint:**
```
GET /api/birds/nearby
```

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| lat | float | Yes | - | User latitude |
| lng | float | Yes | - | User longitude |
| dist | integer | No | 25 | Search radius (km) |
| maxResults | integer | No | 50 | Max birds to return |

**Example Request:**
```javascript
const response = await fetch(
  `/api/birds/nearby?lat=39.75&lng=-86.16&dist=50&maxResults=100`
);
const data = await response.json();
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 42,
  "birds": [
    {
      "id": "norcar",
      "name": "Northern Cardinal",
      "scientificName": "Cardinalis cardinalis",
      "location": "Central Park, New York",
      "dateObserved": "2026-05-04T10:30:00",
      "howMany": 3,
      "latitude": 40.7829,
      "longitude": -73.9654,
      "obsReviewed": true,
      "locationPrivate": false,
      "image": "https://cdn.download.ams.birds.cornell.edu/...",
      "audio": "https://cdn.download.ams.birds.cornell.edu/...",
      "speciesCode": "norcar"
    }
  ]
}
```

**Error Response (400):**
```json
{
  "error": "Latitude and longitude are required"
}
```

**Error Response (500):**
```json
{
  "error": "eBird API key not configured"
}
```

---

## Rate Limiting Best Practices

### eBird API
- **No official rate limit** for reasonable use
- Recommended: **< 100 requests/minute**
- Cache results when possible

### Macaulay Library
- **No authentication required**
- **No published rate limits**
- Recommended: **Parallel requests OK, but use responsibly**

### Implementation Strategy
```javascript
// Fetch media in parallel for all birds
await Promise.all(
  birds.map(bird => fetchMacaulayMedia(bird.speciesCode))
);
```

---

## Error Handling

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check query parameters |
| 401 | Unauthorized | Verify eBird API key |
| 404 | Not Found | Check endpoint URL |
| 429 | Too Many Requests | Implement rate limiting |
| 500 | Server Error | Check API status, retry |

### Graceful Degradation
```javascript
try {
  const { image, audio } = await fetchMacaulayMedia(speciesCode);
  // Use media if available
} catch (error) {
  // Fallback to default image
  const image = getFallbackImage(speciesCode);
}
```

---

## Data Models

### Bird Object
```typescript
interface Bird {
  id: string;                    // Species code
  name: string;                  // Common name
  scientificName: string;        // Scientific name
  location: string;              // Observation location
  dateObserved?: string;         // ISO 8601 date
  howMany?: number;              // Count observed
  latitude?: number;             // Observation lat
  longitude?: number;            // Observation lng
  obsReviewed?: boolean;         // Verified observation
  locationPrivate?: boolean;     // Hidden exact location
  image: string;                 // Image URL
  audio?: string;                // Audio URL (optional)
  speciesCode?: string;          // eBird species code
}
```

### API Response
```typescript
interface BirdsResponse {
  success: boolean;
  count: number;
  birds: Bird[];
}
```

---

## Testing Endpoints

### Using Browser
```
http://localhost:3000/api/birds/nearby?lat=39.75&lng=-86.16
```

### Using curl
```bash
curl "http://localhost:3000/api/birds/nearby?lat=39.75&lng=-86.16&dist=50&maxResults=10"
```

### Using Postman/Thunder Client
```
GET http://localhost:3000/api/birds/nearby
Params:
  lat: 39.75
  lng: -86.16
  dist: 50
  maxResults: 10
```

---

## API Keys Setup

### Get eBird API Key
1. Visit: https://ebird.org/api/keygen
2. Sign in with eBird account (or create one)
3. Request API key
4. Add to `.env.local`:
   ```
   EBIRD_API_KEY=your_key_here
   ```

### No Key Required
- Macaulay Library API is **public** (no key needed)
- Unsplash Source API is **open** (no key needed)

---

## Common Issues & Solutions

### Issue: "eBird API key not configured"
**Solution:** Add `EBIRD_API_KEY` to `.env.local` and restart server

### Issue: "No birds found"
**Solutions:**
- Increase search radius (`dist` parameter)
- Check if location has recent observations on eBird.org
- Verify coordinates are valid

### Issue: Images not loading
**Solutions:**
- Check browser console for CORS errors
- Verify Macaulay Library API is accessible
- Fallback images should load from Unsplash

### Issue: Audio not playing
**Solutions:**
- Check browser audio permissions
- Verify audio URL is valid
- Ensure browser supports HTML5 audio

---

## Caching Strategy

### Client-Side Cache
```javascript
// Cache bird data in localStorage
localStorage.setItem("cachedBirdData", JSON.stringify(birds));

// Cache duration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

### Location Cache
```javascript
navigator.geolocation.getCurrentPosition(
  successCallback,
  errorCallback,
  {
    maximumAge: 300000 // Use cached location for 5 minutes
  }
);
```

---

## Performance Metrics

### Typical Response Times
- **eBird API**: 200-500ms
- **Macaulay Library**: 100-300ms per species
- **Total**: ~1-3 seconds for 50 birds

### Optimization Tips
1. Limit `maxResults` for faster responses
2. Cache results when possible
3. Use parallel requests for media
4. Implement pagination for large datasets

---

**Last Updated:** May 4, 2026
