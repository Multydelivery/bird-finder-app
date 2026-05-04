"use client";

import { useState, useEffect } from "react";
import BirdCard from "@/components/BirdCard";
import { useFavorites } from "@/lib/useFavorites";
import Link from "next/link";

// Force dynamic rendering since this page uses localStorage
export const dynamic = 'force-dynamic';

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const [favoriteBirds, setFavoriteBirds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load favorite birds from localStorage cache
    const cachedBirds = localStorage.getItem("cachedBirdData");
    
    if (cachedBirds && favorites.length > 0) {
      try {
        const allBirds = JSON.parse(cachedBirds);
        const filteredFavorites = allBirds.filter((bird) => favorites.includes(bird.id));
        setFavoriteBirds(filteredFavorites);
      } catch (error) {
        console.error("Error loading cached birds:", error);
      }
    }
    
    setLoading(false);
  }, [favorites]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-6 py-10">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-700"></div>
          <p className="mt-4 text-gray-600">Loading favorites...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link href="/" className="text-green-700 font-semibold hover:underline">
            ← Back to Home
          </Link>
          <h1 className="mt-4 text-4xl font-bold text-green-900">
            ❤️ My Favorite Birds
          </h1>
          <p className="mt-2 text-gray-600">
            {favoriteBirds.length} bird{favoriteBirds.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {favoriteBirds.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <p className="text-xl text-gray-500 mb-4">
              You haven&apos;t added any favorite birds yet.
            </p>
            <p className="text-gray-400 mb-6">
              Explore nearby birds and click the ❤️ icon to save your favorites
            </p>
            <Link
              href="/"
              className="inline-block rounded-full bg-green-700 px-6 py-3 text-white hover:bg-green-800 transition-colors"
            >
              Discover Birds
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favoriteBirds.map((bird) => (
              <BirdCard key={bird.id} bird={bird} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
