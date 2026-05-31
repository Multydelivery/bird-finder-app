"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FindNearbyButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleFindNearby = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Navigate to nearby birds page with coordinates
        router.push(`/nearby?lat=${lat}&lng=${lng}`);
        setLoading(false);
      },
      (err) => {
        setError("Unable to retrieve your location. Please enable location services.");
        setLoading(false);
        console.error("Geolocation error:", err);
      }
    );
  };

  return (
    <div className="text-center">
      <button
        onClick={handleFindNearby}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-indigo-700 px-6 py-3 text-white font-semibold hover:bg-indigo-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <>
            <span className="animate-spin">🔄</span>
            Getting your location...
          </>
        ) : (
          <>
            📍 Find Birds Near Me
          </>
        )}
      </button>
      
      {error && (
        <p className="mt-3 text-red-600 text-sm">{error}</p>
      )}
    </div>
  );
}
