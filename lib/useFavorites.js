"use client";

import { useState, useEffect } from "react";

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const storedFavorites = localStorage.getItem("birdFavorites");
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  // Save to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem("birdFavorites", JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (birdId) => {
    setFavorites((prev) => [...prev, birdId]);
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
