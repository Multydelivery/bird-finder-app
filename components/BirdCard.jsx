"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useFavorites } from "@/lib/useFavorites";

export default function BirdCard({ bird }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(bird.id);
  const [imgError, setImgError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Fallback image if main image fails
  const fallbackImage = "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800&h=600&fit=crop&auto=format&q=80";
  const imageUrl = bird.image || fallbackImage;
  
  // Check if image is from Macaulay Library
  const isMacaulayImage = imageUrl && imageUrl.includes('cornell.edu');

  // Handle audio playback
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

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-lg transition-shadow duration-300">
      {/* Image Section */}
      <div className="h-56 w-full bg-gray-200 relative">
        <img
          src={imgError ? fallbackImage : imageUrl}
          alt={bird.name}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
        
        {/* Macaulay Library Badge */}
        {!imgError && isMacaulayImage && (
          <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            📸 Macaulay Library
          </div>
        )}
        
        {/* Observation Badge */}
        {bird.howMany && bird.howMany > 1 && (
          <div className="absolute top-3 right-3 bg-indigo-700 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {bird.howMany} spotted
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-indigo-950">{bird.name}</h2>
            <p className="italic text-gray-500 text-sm">{bird.scientificName}</p>
            <p className="mt-2 text-gray-700 text-sm">📍 {bird.location}</p>
            {bird.dateObserved && (
              <p className="mt-1 text-gray-500 text-xs">
                Last seen: {new Date(bird.dateObserved).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={() => toggleFavorite(bird.id)}
            className="ml-2 text-2xl transition-transform hover:scale-110"
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            {favorite ? "❤️" : "🤍"}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <Link
            href={`/birds/${bird.id}`}
            className="flex-1 text-center rounded-full bg-indigo-700 px-4 py-2 text-white text-sm font-semibold hover:bg-indigo-800 transition-colors"
          >
            View Details →
          </Link>

          {/* Audio Play Button */}
          {bird.audio && (
            <button
              onClick={handlePlayAudio}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                isPlaying 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
              aria-label={isPlaying ? "Stop bird call" : "Play bird call"}
            >
              {isPlaying ? "⏸️ Stop" : "🔊 Play"}
            </button>
          )}
        </div>

        {/* Hidden Audio Element */}
        {bird.audio && (
          <audio
            ref={audioRef}
            src={bird.audio}
            preload="metadata"
            onEnded={() => setIsPlaying(false)}
            onError={(e) => {
              console.error('Audio loading error for', bird.name, e);
              setIsPlaying(false);
            }}
            onPause={() => setIsPlaying(false)}
          />
        )}
      </div>
    </div>
  );
}
