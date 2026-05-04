# Bird Finder App - Setup Instructions

## eBird API Setup

To use the nearby birds feature, you need an eBird API key:

1. **Get your free eBird API key:**
   - Visit: https://ebird.org/api/keygen
   - Fill out the form with your name and email
   - You'll receive your API key via email

2. **Add the API key to your environment:**
   - Open the `.env.local` file in the root directory
   - Replace the empty value with your API key:
     ```
     EBIRD_API_KEY=your_actual_api_key_here
     ```

3. **Restart your development server:**
   ```bash
   npm run dev
   ```

## Features Implemented

### ✅ Phase 1: Real Bird Data Integration
- **API Route**: `/api/birds/nearby` - Fetches real bird sightings from eBird API
- **Find Birds Near Me**: Button on home page uses geolocation to find your coordinates
- **Nearby Birds Page**: Displays recent bird sightings in a 25km radius
  - Shows bird name, scientific name, location, date seen, and count
  - Clean table layout with responsive design

## Next Steps

The following features are planned for future development:

### Phase 2: Map Visualization
- Install react-leaflet and leaflet
- Create BirdMap component
- Show bird sightings on an interactive map

### Phase 3: Database Integration
- Set up MongoDB for persistent data
- Save favorite birds to database instead of localStorage
- User profiles with saved bird collections

### Phase 4: Authentication
- Add Clerk for user authentication
- Personalized experience with login
- Secure user-specific data

### Phase 5: Deployment
- Deploy to Vercel
- Configure environment variables in production
- Set up custom domain (optional)

## Testing the App

1. Click "Find Birds Near Me" on the home page
2. Allow location access when prompted
3. View real bird sightings near your location
4. Browse the bird library with search functionality
5. Add birds to your favorites
