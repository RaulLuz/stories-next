import { useState, useEffect, useCallback } from "react";
import { Story } from "@/types/story";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export function useLocalStorageApi() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStories = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/stories`);
      if (!response.ok) {
        throw new Error("Erro ao buscar stories");
      }
      const data = await response.json();
      // Ordenar: mais novo primeiro (mais novo à esquerda)
      const sorted = data.stories.sort((a: Story, b: Story) => b.createdAt - a.createdAt);
      setStories(sorted);
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao buscar stories:", error);
      setStories([]);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
    
    // Atualizar periodicamente (a cada 30 segundos)
    const interval = setInterval(fetchStories, 30000);
    
    return () => clearInterval(interval);
  }, [fetchStories]);

  const refreshStories = useCallback(() => {
    fetchStories();
  }, [fetchStories]);

  return {
    stories,
    isLoading,
    refreshStories,
  };
}
