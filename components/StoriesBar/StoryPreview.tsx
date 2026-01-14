"use client";

import React, { useState } from "react";
import { Story } from "@/types/story";
import { DeleteStoryButton } from "./DeleteStoryButton";

interface StoryPreviewProps {
  story: Story;
  onClick: () => void;
  onDelete: () => void;
}

export function StoryPreview({ story, onClick, onDelete }: StoryPreviewProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="
        relative
        flex-shrink-0
        w-16 h-16
        md:w-20 md:h-20
        rounded-full
        border-2 border-instagram-primary
        overflow-visible
        cursor-pointer
        transition-all duration-200
        group
        mr-3
      "
      onClick={onClick}
    >
      <div className="
        w-full h-full
        rounded-full
        overflow-hidden
        border-2 border-transparent
        transition-all duration-200
        hover:border-instagram-primary
        active:opacity-80
        group-hover:shadow-lg
      ">
        {!imageError ? (
          story.mediaType === "video" ? (
            <video
              src={story.mediaBase64}
              className="w-full h-full object-cover"
              muted
              playsInline
              onError={() => setImageError(true)}
            />
          ) : (
            <img
              src={story.mediaBase64}
              alt={`Story ${story.id}`}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          )
        ) : (
          <div className="w-full h-full bg-gray-border flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-text"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Botão de exclusão visível no hover */}
      <DeleteStoryButton onDelete={onDelete} />
    </div>
  );
}
