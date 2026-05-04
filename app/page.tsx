"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import FindNearbyButton from "@/components/FindNearbyButton";
import SearchBar from "@/components/SearchBar";
import BirdCard from "@/components/BirdCard";

// Force dynamic rendering since this page uses navigator.geolocation and localStorage
export const dynamic = 'force-dynamic';

interface Bird {
  id: string;
  name: string;
  scientificName: string;
  location: string;
  image: string;
  audio?: string;
  dateObserved?: string;
  howMany?: number;
  latitude?: number;
  longitude?: number;
  speciesCode?: string;
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [birds, setBirds] = useState<Bird[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch nearby birds when component mounts
  useEffect(() => {
    async function fetchNearbyBirds() {
      setLoading(true);
      setLocationError(null);
      
      try {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
          setLocationError("Geolocation not supported by your browser");
          setLoading(false);
          setInitialLoad(false);
          return;
        }

        // Get user's location
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
              // Fetch birds from API
              const response = await fetch(
                `/api/birds/nearby?lat=${latitude}&lng=${longitude}&dist=50&maxResults=100`
              );

              if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
              }

              const data = await response.json();
              
              if (data.success) {
                setBirds(data.birds || []);
                // Cache bird data for favorites page
                if (data.birds && data.birds.length > 0) {
                  localStorage.setItem("cachedBirdData", JSON.stringify(data.birds));
                }
                console.log(`Loaded ${data.birds?.length || 0} birds`);
              } else {
                throw new Error(data.error || "Failed to fetch birds");
              }
            } catch (apiError) {
              console.error("API fetch error:", apiError);
              setLocationError("Failed to fetch bird data. Please try again.");
            } finally {
              setLoading(false);
              setInitialLoad(false);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            let errorMsg = "Could not get your location";
            
            switch(error.code) {
              case error.PERMISSION_DENIED:
                errorMsg = "Location access denied. Please enable location permissions.";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMsg = "Location information unavailable.";
                break;
              case error.TIMEOUT:
                errorMsg = "Location request timed out.";
                break;
            }
            
            setLocationError(errorMsg);
            setLoading(false);
            setInitialLoad(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // Cache location for 5 minutes
          }
        );
      } catch (error) {
        console.error("Error fetching birds:", error);
        setLocationError("An unexpected error occurred");
        setLoading(false);
        setInitialLoad(false);
      }
    }

    fetchNearbyBirds();
  }, []);

  // Filter birds based on search term
  const filteredBirds = birds.filter((bird) => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      bird.name.toLowerCase().includes(search) ||
      bird.scientificName.toLowerCase().includes(search) ||
      bird.location?.toLowerCase().includes(search)
    );
  });

  return (
    <main className="min-h-screen bg-green-50 px-6 py-10">
      <section className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-green-900">
            🦜 Discover Birds Near You
          </h1>

          <p className="mt-4 text-lg text-gray-700">
            Explore bird species, listen to their calls, and track sightings in real-time
          </p>

          <div className="mt-8 flex flex-col items-center gap-4">
            <FindNearbyButton />
            
            <Link
              href="/birds"
              className="inline-block rounded-full bg-green-700 px-6 py-3 text-white hover:bg-green-800 transition-colors"
            >
              Browse All Birds
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-700"></div>
            <p className="mt-4 text-xl text-gray-600">
              Finding birds in your area...
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Fetching observations from eBird and enriching with Macaulay Library media
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && locationError && (
          <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-200">
            <p className="text-xl text-red-600 mb-4">⚠️ {locationError}</p>
            <p className="text-gray-600 mb-6">
              Enable location access or use the &quot;Find Nearby&quot; button above
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-full bg-green-700 px-6 py-3 text-white hover:bg-green-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {!loading && !locationError && (
          <>
            {/* Stats Bar */}
            {birds.length > 0 && (
              <div className="mb-6 text-center">
                <p className="text-gray-700">
                  <span className="font-bold text-green-700 text-lg">{filteredBirds.length}</span>
                  {searchTerm && filteredBirds.length !== birds.length && (
                    <span> of {birds.length}</span>
                  )}
                  {" "}bird species {searchTerm ? `matching "${searchTerm}"` : "found nearby"}
                </p>
              </div>
            )}

            {/* No Search Results */}
            {searchTerm && filteredBirds.length === 0 && birds.length > 0 && (
              <div className="text-center py-16">
                <p className="text-xl text-gray-500">
                  No birds found matching &quot;{searchTerm}&quot;
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-green-700 hover:underline font-semibold"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Bird Grid */}
            {filteredBirds.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredBirds.map((bird) => (
                  <BirdCard key={bird.id} bird={bird} />
                ))}
              </div>
            )}

            {/* No Birds Found Initially */}
            {!initialLoad && birds.length === 0 && !searchTerm && (
              <div className="text-center py-16">
                <p className="text-xl text-gray-500">
                  No recent bird sightings found in your area
                </p>
                <p className="mt-2 text-gray-400 text-sm">
                  Try expanding your search radius or check back later
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
