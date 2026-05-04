"use client";

import { useState } from "react";
import { birds } from "@/lib/birdsData";
import BirdCard from "@/components/BirdCard";
import SearchBar from "@/components/SearchBar";

export default function BirdsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBirds = birds.filter((bird) => {
    const search = searchTerm.toLowerCase();
    return (
      bird.name.toLowerCase().includes(search) ||
      bird.scientificName.toLowerCase().includes(search) ||
      bird.description.toLowerCase().includes(search)
    );
  });

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <h1 className="mb-8 text-4xl font-bold text-green-900">
        Bird Library
      </h1>

      <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {filteredBirds.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">
          No birds found matching &quot;{searchTerm}&quot;
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBirds.map((bird) => (
            <BirdCard key={bird.id} bird={bird} />
          ))}
        </div>
      )}
    </main>
  );
}
