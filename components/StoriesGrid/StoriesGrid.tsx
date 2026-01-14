"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useLocalStorageApi as useLocalStorage } from "@/hooks/useLocalStorageApi";
import { Story } from "@/types/story";
import { formatTimeRemaining, getTimeUntilExpiration } from "@/utils/time";

interface StoriesGridProps {
  onStoryClick: (index: number) => void;
  refreshTrigger?: number;
}

type FilterType = "all" | "image" | "video" | "withText";
type SortType = "newest" | "oldest" | "type";

export function StoriesGrid({ onStoryClick, refreshTrigger }: StoriesGridProps) {
  const { stories, refreshStories } = useLocalStorage();
  
  // Atualizar quando refreshTrigger mudar (novo story adicionado)
  useEffect(() => {
    refreshStories();
  }, [refreshTrigger, refreshStories]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("newest");

  const filteredAndSortedStories = useMemo(() => {
    let filtered = [...stories];

    // Aplicar filtro
    if (filter === "image") {
      filtered = filtered.filter((s) => s.mediaType === "image");
    } else if (filter === "video") {
      filtered = filtered.filter((s) => s.mediaType === "video");
    } else if (filter === "withText") {
      filtered = filtered.filter((s) => s.textOverlay);
    }

    // Aplicar ordenação
    if (sort === "newest") {
      filtered.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sort === "oldest") {
      filtered.sort((a, b) => a.createdAt - b.createdAt);
    } else if (sort === "type") {
      filtered.sort((a, b) => {
        if (a.mediaType !== b.mediaType) {
          return a.mediaType.localeCompare(b.mediaType);
        }
        return b.createdAt - a.createdAt;
      });
    }

    return filtered;
  }, [stories, filter, sort]);

  const getStoryIndex = (storyId: string) => {
    return stories.findIndex((s) => s.id === storyId);
  };

  return (
    <div className="w-full p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Filtros e Ordenação */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-instagram-primary text-white"
                : "bg-gray-light text-gray-dark hover:bg-gray-border"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter("image")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "image"
                ? "bg-instagram-primary text-white"
                : "bg-gray-light text-gray-dark hover:bg-gray-border"
            }`}
          >
            Imagens
          </button>
          <button
            onClick={() => setFilter("video")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "video"
                ? "bg-instagram-primary text-white"
                : "bg-gray-light text-gray-dark hover:bg-gray-border"
            }`}
          >
            Vídeos
          </button>
          <button
            onClick={() => setFilter("withText")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "withText"
                ? "bg-instagram-primary text-white"
                : "bg-gray-light text-gray-dark hover:bg-gray-border"
            }`}
          >
            Com Texto
          </button>
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortType)}
          className="px-4 py-2 rounded-lg bg-gray-light text-gray-dark border border-gray-border focus:outline-none focus:ring-2 focus:ring-instagram-primary focus:border-transparent"
        >
          <option value="newest">Mais Recente</option>
          <option value="oldest">Mais Antigo</option>
          <option value="type">Por Tipo</option>
        </select>
      </div>

      {/* Grid */}
      {filteredAndSortedStories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-text text-lg">
            Nenhum story encontrado
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
          {filteredAndSortedStories.map((story) => {
            const timeRemaining = getTimeUntilExpiration(story.expiresAt);
            const storyIndex = getStoryIndex(story.id);

            return (
              <div
                key={story.id}
                onClick={() => onStoryClick(storyIndex)}
                className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-gray-light transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {story.mediaType === "video" ? (
                  <video
                    src={story.mediaBase64}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={story.mediaBase64}
                    alt={`Story ${story.id}`}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Overlay com informações */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="absolute bottom-0 left-0 right-0 p-2 text-white text-xs">
                    <p className="font-medium truncate">
                      {formatTimeRemaining(timeRemaining)} restante
                    </p>
                    {story.textOverlay && (
                      <p className="text-xs opacity-75 mt-0.5">Com texto</p>
                    )}
                  </div>
                </div>

                {/* Badge de tipo */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs">
                    {story.mediaType === "video" ? "🎥" : "📷"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
