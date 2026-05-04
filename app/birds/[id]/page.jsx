"use client";

import { use, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useFavorites } from "@/lib/useFavorites";

// Force dynamic rendering since this page uses localStorage and dynamic params
export const dynamic = 'force-dynamic';

export default function BirdDetailPage({ params }) {
  // Unwrap the async params
  const resolvedParams = use(params);
  const [bird, setBird] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    // Ensure params.id exists
    if (!resolvedParams?.id) {
      setLoading(false);
      return;
    }

    // Load bird data from localStorage cache
    const cachedBirds = localStorage.getItem("cachedBirdData");
    
    if (cachedBirds) {
      try {
        const allBirds = JSON.parse(cachedBirds);
        const foundBird = allBirds.find((b) => b.id === resolvedParams.id);
        setBird(foundBird || null);
      } catch (error) {
        console.error("Error loading bird data:", error);
      }
    }
    
    setLoading(false);
  }, [resolvedParams?.id]);

  const handlePlayAudio = () => {
    if (!audioRef.current) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch((error) => {
          console.error('Audio playback failed:', error);
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error handling audio:', error);
      setIsPlaying(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-700"></div>
            <p className="mt-4 text-gray-600">Loading bird details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!bird) {
    return (
      <main className="min-h-screen bg-white px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Bird not found</h1>
            <p className="text-gray-600 mb-6">
              This bird may not be in the recent sightings cache.
            </p>
            <Link 
              href="/" 
              className="inline-block rounded-full bg-green-700 px-6 py-3 text-white hover:bg-green-800 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const favorite = isFavorite(bird.id);

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Navigation */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-green-700 font-semibold hover:underline"
          >
            ← Back to Birds
          </Link>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-3xl border-2 border-gray-200 bg-white shadow-2xl">
          {/* Hero Image */}
          <div className="relative h-96 md:h-[500px] bg-gray-200">
            <img
              src={bird.image}
              alt={bird.name}
              className="h-full w-full object-cover"
            />
            
            {/* Favorite Badge */}
            <button
              onClick={() => toggleFavorite(bird.id)}
              className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg hover:scale-110 transition-transform"
              aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <span className="text-3xl">{favorite ? "❤️" : "🤍"}</span>
            </button>

            {/* Count Badge */}
            {bird.howMany && bird.howMany > 1 && (
              <div className="absolute top-6 left-6 bg-green-700 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
                {bird.howMany} birds spotted
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-8 md:p-12">
            {/* Header */}
            <div className="border-b border-gray-200 pb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-green-900 mb-3">
                {bird.name}
              </h1>
              <p className="text-xl md:text-2xl italic text-gray-500 mb-4">
                {bird.scientificName}
              </p>
              
              {/* Location and Date */}
              <div className="flex flex-wrap gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📍</span>
                  <span className="font-medium">{bird.location}</span>
                </div>
                
                {bird.dateObserved && (
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📅</span>
                    <span>Last seen: {new Date(bird.dateObserved).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Audio Player Section */}
            {bird.audio && (
              <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-blue-900 mb-1">
                      🔊 Bird Call Recording
                    </h2>
                    <p className="text-sm text-blue-700">
                      Listen to the actual sound of this bird
                    </p>
                  </div>
                  
                  <button
                    onClick={handlePlayAudio}
                    className={`rounded-full px-8 py-4 text-lg font-bold transition-all transform hover:scale-105 ${
                      isPlaying 
                        ? "bg-red-500 hover:bg-red-600 text-white shadow-lg" 
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                    }`}
                  >
                    {isPlaying ? "⏸️ Stop" : "▶️ Play"}
                  </button>
                </div>
                
                <audio
                  ref={audioRef}
                  src={bird.audio}
                  preload="metadata"
                  onEnded={() => setIsPlaying(false)}
                  onError={(e) => {
                    console.error('Audio loading error:', e);
                    setIsPlaying(false);
                  }}
                  onPause={() => setIsPlaying(false)}
                />
              </div>
            )}

            {/* Information Grid */}
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {/* Observation Details */}
              <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                <h2 className="text-2xl font-bold text-green-900 mb-4 flex items-center gap-2">
                  🔍 Observation Details
                </h2>
                <div className="space-y-3 text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Species Code:</span>
                    <span className="font-mono bg-white px-3 py-1 rounded-lg">
                      {bird.speciesCode || bird.id}
                    </span>
                  </div>
                  
                  {bird.howMany && (
                    <div className="flex justify-between">
                      <span className="font-medium">Count:</span>
                      <span className="font-semibold">{bird.howMany} individual(s)</span>
                    </div>
                  )}
                  
                  {bird.obsReviewed !== undefined && (
                    <div className="flex justify-between">
                      <span className="font-medium">Verified:</span>
                      <span className={bird.obsReviewed ? "text-green-600" : "text-yellow-600"}>
                        {bird.obsReviewed ? "✓ Yes" : "⏳ Pending"}
                      </span>
                    </div>
                  )}
                  
                  {bird.locationPrivate !== undefined && (
                    <div className="flex justify-between">
                      <span className="font-medium">Location Privacy:</span>
                      <span className={bird.locationPrivate ? "text-orange-600" : "text-green-600"}>
                        {bird.locationPrivate ? "🔒 Private" : "🌍 Public"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Coordinates */}
              {bird.latitude && bird.longitude && (
                <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                  <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                    🗺️ Location Coordinates
                  </h2>
                  <div className="space-y-3 text-gray-700">
                    <div className="flex justify-between">
                      <span className="font-medium">Latitude:</span>
                      <span className="font-mono bg-white px-3 py-1 rounded-lg">
                        {bird.latitude.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Longitude:</span>
                      <span className="font-mono bg-white px-3 py-1 rounded-lg">
                        {bird.longitude.toFixed(6)}
                      </span>
                    </div>
                    <a
                      href={`https://www.google.com/maps?q=${bird.latitude},${bird.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-4 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      📍 View on Google Maps
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="mt-8 bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ℹ️ About This Sighting
              </h2>
              <p className="text-gray-700 leading-relaxed">
                This {bird.name} (<em>{bird.scientificName}</em>) was observed at {bird.location}
                {bird.dateObserved && ` on ${new Date(bird.dateObserved).toLocaleDateString()}`}.
                {bird.howMany && bird.howMany > 1 && ` A total of ${bird.howMany} individuals were spotted.`}
                {bird.obsReviewed && " This observation has been reviewed and verified by the eBird community."}
              </p>
              
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={`https://ebird.org/species/${bird.speciesCode || bird.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-700 text-white px-6 py-3 rounded-full hover:bg-green-800 transition-colors font-semibold"
                >
                  🦜 View on eBird
                </a>
                
                <a
                  href={`https://search.macaulaylibrary.org/catalog?taxonCode=${bird.speciesCode || bird.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors font-semibold"
                >
                  📸 More Photos & Audio
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
