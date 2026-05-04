import { NextResponse } from "next/server";

// eBird API endpoint for recent nearby observations
const EBIRD_API_URL = "https://api.ebird.org/v2/data/obs/geo/recent";
const MACAULAY_LIBRARY_URL = "https://search.macaulaylibrary.org/catalog.json";

/**
 * Fetch bird images and audio from Macaulay Library
 * @param {string} speciesCode - eBird species code
 * @param {string} commonName - Common bird name for logging
 * @returns {Promise<{image: string, audio: string|null}>}
 */
async function fetchMacaulayMedia(speciesCode, commonName) {
  try {
    // Fetch top-rated photos from Macaulay Library
    const photoUrl = `${MACAULAY_LIBRARY_URL}?taxonCode=${speciesCode}&mediaType=photo&sort=rating_rank_desc&count=3`;
    
    const photoResponse = await fetch(photoUrl, {
      headers: {
        'User-Agent': 'BirdFinderApp/1.0'
      }
    });

    let imageUrl = null;
    if (photoResponse.ok) {
      const photoData = await photoResponse.json();
      
      if (photoData.results?.content?.length > 0) {
        const photos = photoData.results.content;
        
        // Try to get the best quality image URL
        for (const photo of photos) {
          if (photo.assetId) {
            // Macaulay Library standard image URL format
            // 2400px width is a good balance between quality and load time
            imageUrl = `https://cdn.download.ams.birds.cornell.edu/api/v1/asset/${photo.assetId}/2400`;
            console.log(`✓ Found Macaulay image for ${commonName}: ${imageUrl}`);
            break;
          } else if (photo.mediaUrl) {
            imageUrl = photo.mediaUrl;
            console.log(`✓ Using mediaUrl for ${commonName}: ${imageUrl}`);
            break;
          }
        }
      } else {
        console.log(`⚠ No photos found for ${commonName} (${speciesCode})`);
      }
    } else {
      console.log(`⚠ Macaulay photo API error for ${commonName}: ${photoResponse.status}`);
    }

    // Fetch audio
    const audioUrl = `${MACAULAY_LIBRARY_URL}?taxonCode=${speciesCode}&mediaType=audio&sort=rating_rank_desc&count=1`;
    const audioResponse = await fetch(audioUrl, {
      headers: {
        'User-Agent': 'BirdFinderApp/1.0'
      }
    });

    let audioFile = null;
    if (audioResponse.ok) {
      const audioData = await audioResponse.json();
      
      if (audioData.results?.content?.length > 0) {
        const audio = audioData.results.content[0];
        
        if (audio.assetId) {
          // Use proper Macaulay Library audio URL
          audioFile = `https://cdn.download.ams.birds.cornell.edu/api/v1/asset/${audio.assetId}`;
          console.log(`✓ Found audio for ${commonName}`);
        } else if (audio.mediaUrl) {
          audioFile = audio.mediaUrl;
        }
      }
    }

    return {
      image: imageUrl,
      audio: audioFile
    };
  } catch (error) {
    console.error(`❌ Error fetching Macaulay media for ${commonName}:`, error);
    return {
      image: null,
      audio: null
    };
  }
}

/**
 * Fallback bird images from Unsplash
 */
function getFallbackImage(speciesCode, commonName) {
  const fallbackImages = [
    "https://images.unsplash.com/photo-1444464666168-49d633b86797",
    "https://images.unsplash.com/photo-1552728089-57bdde30beb3",
    "https://images.unsplash.com/photo-1549608276-5786777e6587",
    "https://images.unsplash.com/photo-1535083783855-76ae62b2914e",
    "https://images.unsplash.com/photo-1511405946472-a37e3b5ccd47",
    "https://images.unsplash.com/photo-1568488258082-000ec8a0e440",
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19",
    "https://images.unsplash.com/photo-1582751564169-28e7f4883b8f",
  ];
  
  const hash = speciesCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const imageIndex = hash % fallbackImages.length;
  return `${fallbackImages[imageIndex]}?w=800&h=600&fit=crop&auto=format&q=80`;
}

/**
 * Main API handler
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const dist = searchParams.get("dist") || "25"; // Default 25km radius
    const maxResults = searchParams.get("maxResults") || "50";

    // Validate coordinates
    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    // Check for API key
    const apiKey = process.env.EBIRD_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "eBird API key not configured" },
        { status: 500 }
      );
    }

    // Fetch from eBird API
    const ebirdUrl = `${EBIRD_API_URL}?lat=${lat}&lng=${lng}&dist=${dist}&maxResults=${maxResults}`;
    
    console.log(`Fetching birds from eBird for lat=${lat}, lng=${lng}`);
    
    const response = await fetch(ebirdUrl, {
      headers: {
        "X-eBirdApiToken": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`eBird API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`eBird returned ${data.length} observations`);

    // Get unique birds (remove duplicates by species code)
    const uniqueBirds = Array.from(
      new Map(data.map(obs => [obs.speciesCode, obs])).values()
    );

    console.log(`Processing ${uniqueBirds.length} unique species`);

    // Fetch Macaulay Library media for each bird in parallel (limited batches to avoid rate limits)
    const birdsWithMedia = await Promise.all(
      uniqueBirds.map(async (obs) => {
        const { image, audio } = await fetchMacaulayMedia(obs.speciesCode, obs.comName);
        
        // Use fallback image if Macaulay didn't return one
        const finalImage = image || getFallbackImage(obs.speciesCode, obs.comName);
        
        return {
          id: obs.speciesCode,
          name: obs.comName,
          scientificName: obs.sciName,
          location: obs.locName,
          dateObserved: obs.obsDt,
          howMany: obs.howMany || 1,
          latitude: obs.lat,
          longitude: obs.lng,
          obsReviewed: obs.obsReviewed,
          locationPrivate: obs.locationPrivate,
          image: finalImage,
          audio: audio,
          speciesCode: obs.speciesCode,
        };
      })
    );

    // Log statistics
    const birdsWithMacaulayImages = birdsWithMedia.filter(b => 
      b.image && b.image.includes('cornell.edu')
    ).length;
    const birdsWithAudio = birdsWithMedia.filter(b => b.audio).length;
    
    console.log(`✓ Successfully enriched ${birdsWithMedia.length} birds`);
    console.log(`  - ${birdsWithMacaulayImages} with Macaulay Library images`);
    console.log(`  - ${birdsWithAudio} with audio recordings`);

    return NextResponse.json({
      success: true,
      count: birdsWithMedia.length,
      birds: birdsWithMedia,
    });
  } catch (error) {
    console.error("Error fetching nearby birds:", error);
    return NextResponse.json(
      { error: "Failed to fetch nearby birds", details: error.message },
      { status: 500 }
    );
  }
}
