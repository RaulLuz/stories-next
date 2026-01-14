import { useCallback } from "react";
import { Story, TextOverlay } from "@/types/story";
import { getExpirationTimestamp } from "@/utils/time";
import { validateFile, isVideo } from "@/utils/validation";
import { compressImage } from "@/utils/compression";
import { fileToBase64 } from "@/utils/base64";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export function useStoriesApi() {
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
        const mediaType = isVideo(file) ? "video" : "image";
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
          comments: [],
        };

        // Salvar via API
        const response = await fetch(`${API_URL}/stories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(story),
        });

        if (!response.ok) {
          const data = await response.json();
          if (data.error === "STORAGE_FULL") {
            return {
              success: false,
              error: "STORAGE_FULL",
            };
          }
          throw new Error(data.error || "Erro ao adicionar story");
        }

        const result = await response.json();
        return { success: true, story: result.story };
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

  const deleteStory = useCallback(async (storyId: string) => {
    try {
      await fetch(`${API_URL}/stories?id=${storyId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Erro ao deletar story:", error);
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/stories`);
      const data = await response.json();
      
      // Deletar todos os stories
      await Promise.all(
        data.stories.map((story: Story) =>
          fetch(`${API_URL}/stories?id=${story.id}`, {
            method: "DELETE",
          })
        )
      );
    } catch (error) {
      console.error("Erro ao limpar stories:", error);
    }
  }, []);

  const cleanupExpiredStories = useCallback(async () => {
    // O backend já filtra stories expirados, mas podemos limpar explicitamente
    // Por enquanto, a limpeza é feita automaticamente no GET
  }, []);

  return {
    addStory,
    deleteStory,
    clearAll,
    cleanupExpiredStories,
  };
}
