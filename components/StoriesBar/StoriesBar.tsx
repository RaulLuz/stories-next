"use client";

import React, { useEffect } from "react";
import { useLocalStorageApi as useLocalStorage } from "@/hooks/useLocalStorageApi";
import { useStoriesApi as useStories } from "@/hooks/useStoriesApi";
import { AddStoryButton } from "./AddStoryButton";
import { StoryPreview } from "./StoryPreview";
import { EXPIRED_CHECK_INTERVAL } from "@/utils/constants";

interface StoriesBarProps {
  onStoryClick: (index: number) => void;
  onStoryAdded?: (storyId: string) => void;
}

export function StoriesBar({ onStoryClick, onStoryAdded }: StoriesBarProps) {
  const { stories, isLoading, refreshStories } = useLocalStorage();
  const { cleanupExpiredStories, deleteStory } = useStories();

  // Limpar stories expirados periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      cleanupExpiredStories();
      refreshStories();
    }, EXPIRED_CHECK_INTERVAL);

    // Limpar ao montar
    cleanupExpiredStories();
    refreshStories();

    return () => clearInterval(interval);
  }, [cleanupExpiredStories, refreshStories]);

  const handleDeleteStory = (storyId: string) => {
    deleteStory(storyId);
    refreshStories();
  };

  if (isLoading) {
    return (
      <div className="w-full h-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-instagram-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full bg-white border-b border-gray-border sticky top-0 z-30">
      <div className="px-3 md:px-4 py-3 md:py-4">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          {/* Botão de adicionar sempre primeiro */}
          <AddStoryButton
            onUploadSuccess={(storyId) => {
              // Forçar atualização e abrir story
              setTimeout(async () => {
                await refreshStories();
                setTimeout(() => {
                  const sorted = [...stories].sort((a, b) => b.createdAt - a.createdAt);
                  const newIndex = sorted.findIndex((s) => s.id === storyId);
                  if (newIndex !== -1) {
                    onStoryAdded?.(storyId);
                    onStoryClick(newIndex);
                  }
                }, 200);
              }, 200);
            }}
            onStorageFull={() => {
              cleanupExpiredStories();
              refreshStories();
            }}
          />

          {/* Stories ordenados: mais novo à esquerda */}
          {stories.map((story, index) => (
            <StoryPreview
              key={story.id}
              story={story}
              onClick={() => onStoryClick(index)}
              onDelete={() => handleDeleteStory(story.id)}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
