import { useCallback } from "react";
import { Story, MediaType, TextOverlay } from "@/types/story";
import {
  addStoryToStorage,
  removeStoryFromStorage,
  clearAllStories,
  saveStoriesToStorage,
} from "@/utils/storage";
import { getExpirationTimestamp } from "@/utils/time";
import { validateFile, isVideo } from "@/utils/validation";
import { compressImage } from "@/utils/compression";
import { fileToBase64 } from "@/utils/base64";

export function useStories() {
  const addStory = useCallback(
    async (
      file: File,
      textOverlay?: TextOverlay
    ): Promise<{ success: boolean; error?: string; story?: Story }> => {
      // Validar arquivo
      const validation = validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      try {
        const mediaType: MediaType = isVideo(file) ? "video" : "image";
        let processedFile = file;
        let mediaBase64: string;

        if (mediaType === "image") {
          // Comprimir imagem
          processedFile = await compressImage(file);
          mediaBase64 = await fileToBase64(processedFile);
        } else {
          // Para vídeos, apenas converter para base64
          mediaBase64 = await fileToBase64(file);
        }

        // Criar story
        const createdAt = Date.now();
        const story: Story = {
          id: `story_${createdAt}_${Math.random().toString(36).substr(2, 9)}`,
          mediaBase64,
          mediaType,
          textOverlay,
          createdAt,
          expiresAt: getExpirationTimestamp(createdAt),
        };

        // Salvar no storage
        try {
          addStoryToStorage(story);
          return { success: true, story };
        } catch (error) {
          if (error instanceof Error && error.message === "STORAGE_FULL") {
            return {
              success: false,
              error: "STORAGE_FULL",
            };
          }
          throw error;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erro ao processar o arquivo. Por favor, tente novamente.";
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  const deleteStory = useCallback((storyId: string) => {
    removeStoryFromStorage(storyId);
  }, []);

  const clearAll = useCallback(() => {
    clearAllStories();
  }, []);

  const cleanupExpiredStories = useCallback(() => {
    import("@/utils/storage").then(({ getStoriesFromStorage }) => {
      const stories = getStoriesFromStorage();
      saveStoriesToStorage(stories); // Isso já remove expirados internamente
    });
  }, []);

  return {
    addStory,
    deleteStory,
    clearAll,
    cleanupExpiredStories,
  };
}
