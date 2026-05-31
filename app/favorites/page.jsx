"use client";

import { useMemo, useState } from "react";
import BirdCard from "@/components/BirdCard";
import { useFavorites } from "@/lib/useFavorites";
import Link from "next/link";

// Force dynamic rendering since this page uses localStorage
export const dynamic = 'force-dynamic';

function readCachedBirds() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const cachedBirds = localStorage.getItem("cachedBirdData");
    const parsedBirds = cachedBirds ? JSON.parse(cachedBirds) : [];

    return Array.isArray(parsedBirds) ? parsedBirds : [];
  } catch (error) {
    console.error("Error loading cached birds:", error);
    return [];
  }
}

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const [cachedBirds] = useState(readCachedBirds);
  const favoriteBirds = useMemo(
    () => cachedBirds.filter((bird) => favorites.includes(bird.id)),
    [cachedBirds, favorites]
  );

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link href="/" className="text-indigo-700 font-semibold hover:underline">
            ← Back to Home
          </Link>
          <h1 className="mt-4 text-4xl font-bold text-indigo-950">
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
              className="inline-block rounded-full bg-indigo-700 px-6 py-3 text-white hover:bg-indigo-800 transition-colors"
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
