import { useState, useCallback } from "react";
import { useStories } from "./useStories";
import { useLocalStorage } from "./useLocalStorage";

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addStory } = useStories();
  const { refreshStories } = useLocalStorage();

  const handleFileSelect = useCallback(
    async (file: File | null) => {
      if (!file) return;

      setIsUploading(true);
      setError(null);

      try {
        const result = await addStory(file);

        if (result.success && result.story) {
          refreshStories();
          return { success: true };
        } else {
          setError(result.error || "Erro ao adicionar story");
          return { success: false, error: result.error };
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsUploading(false);
      }
    },
    [addStory, refreshStories]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    handleFileSelect,
    isUploading,
    error,
    clearError,
  };
}
