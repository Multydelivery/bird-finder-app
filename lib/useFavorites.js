"use client";

import { useState, useEffect } from "react";

function readStoredFavorites() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedFavorites = localStorage.getItem("birdFavorites");
    const parsedFavorites = storedFavorites ? JSON.parse(storedFavorites) : [];

    return Array.isArray(parsedFavorites) ? parsedFavorites : [];
  } catch (error) {
    console.error("Error loading favorites:", error);
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(readStoredFavorites);

  // Save to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem("birdFavorites", JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (birdId) => {
    setFavorites((prev) => (prev.includes(birdId) ? prev : [...prev, birdId]));
  };

  const removeFavorite = (birdId) => {
    setFavorites((prev) => prev.filter((id) => id !== birdId));
  };

  const isFavorite = (birdId) => {
    return favorites.includes(birdId);
  };

  const toggleFavorite = (birdId) => {
    if (isFavorite(birdId)) {
      removeFavorite(birdId);
    } else {
      addFavorite(birdId);
    }
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
}
