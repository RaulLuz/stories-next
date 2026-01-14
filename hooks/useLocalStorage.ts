import { useState, useEffect, useCallback } from "react";
import { getStoriesFromStorage } from "@/utils/storage";
import { Story } from "@/types/story";

export function useLocalStorage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadedStories = getStoriesFromStorage();
    // Ordenar: mais novo primeiro (mais novo à esquerda)
    const sorted = loadedStories.sort((a, b) => b.createdAt - a.createdAt);
    setStories(sorted);
    setIsLoading(false);
  }, []);

  const refreshStories = useCallback(() => {
    const loadedStories = getStoriesFromStorage();
    const sorted = loadedStories.sort((a, b) => b.createdAt - a.createdAt);
    setStories(sorted);
  }, []);

  return {
    stories,
    isLoading,
    refreshStories,
  };
}
