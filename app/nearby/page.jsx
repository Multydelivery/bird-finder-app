"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// Force dynamic rendering since this page uses URL search params
export const dynamic = 'force-dynamic';

export default function NearbyPage() {
  const searchParams = useSearchParams();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  const [birds, setBirds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lat || !lng) {
      setError("Location coordinates not provided");
      setLoading(false);
      return;
    }

    async function fetchNearbyBirds() {
      try {
        const response = await fetch(
          `/api/birds/nearby?lat=${lat}&lng=${lng}&dist=25&maxResults=50`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch nearby birds");
        }

        const data = await response.json();
        setBirds(data.birds || []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching nearby birds:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchNearbyBirds();
  }, [lat, lng]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-8 text-4xl font-bold text-green-900">
            Birds Near You
          </h1>
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">Loading nearby birds...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-8 text-4xl font-bold text-green-900">
            Birds Near You
          </h1>
          <div className="text-center py-16">
            <p className="text-xl text-red-600 mb-4">Error: {error}</p>
            <Link
              href="/"
              className="inline-block rounded-full bg-green-700 px-6 py-3 text-white hover:bg-green-800"
            >
              Go Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Link href="/" className="text-green-700 font-semibold hover:underline">
            ← Back to Home
          </Link>
          <h1 className="mt-4 text-4xl font-bold text-green-900">
            Birds Near You
          </h1>
          <p className="mt-2 text-gray-600">
            Found {birds.length} recent bird sightings within 25km
          </p>
        </div>

        {birds.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">
              No recent bird sightings found in your area.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {birds.map((bird, index) => (
              <div
                key={`${bird.id}-${index}`}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={bird.image}
                  alt={bird.name}
                  className="h-56 w-full object-cover"
                />
                <div className="p-5">
                  <h2 className="text-2xl font-bold text-green-900">{bird.name}</h2>
                  <p className="italic text-gray-500">{bird.scientificName}</p>
                  
                  <div className="mt-3 space-y-1 text-sm text-gray-700">
                    <p>
                      <span className="font-semibold">📍 Location:</span> {bird.location}
                      {bird.locationPrivate && (
                        <span className="ml-1 text-xs text-gray-500">(Private)</span>
                      )}
                    </p>
                    <p>
                      <span className="font-semibold">📅 Date:</span>{" "}
                      {new Date(bird.dateObserved).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-semibold">🔢 Count:</span> {bird.howMany}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
