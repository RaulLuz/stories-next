"use client";

import React, { useState } from "react";
import { Story } from "@/types/story";

interface StoryImageProps {
  story: Story;
  isActive: boolean;
  className?: string;
}

export function StoryImage({ story, isActive, className = "" }: StoryImageProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div
        className={`
          w-full h-full
          flex items-center justify-center
          bg-gray-dark
          ${className}
        `}
        style={{ maxWidth: "400px", height: "calc(100vh - 120px)" }}
      >
        <div className="text-white text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-50"
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
          <p className="text-sm opacity-75">Erro ao carregar imagem</p>
        </div>
      </div>
    );
  }

  if (story.mediaType === "video") {
    return (
      <video
        src={story.mediaBase64}
        className={`
          max-w-full
          max-h-full
          object-contain
          ${className}
        `}
        style={{ maxWidth: "400px", maxHeight: "calc(100vh - 120px)" }}
        controls={false}
        autoPlay
        loop
        muted
        playsInline
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      className="relative rounded-3xl overflow-hidden shadow-2xl bg-white p-2"
      style={{ 
        maxWidth: "400px", 
        height: "calc(100vh - 120px)",
        width: "100%",
        maxHeight: "calc(100vh - 120px)"
      }}
    >
      <img
        src={story.mediaBase64}
        alt={`Story ${story.id}`}
        className="w-full h-full object-contain rounded-3xl"
        onError={() => setImageError(true)}
      />
      {story.textOverlay && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${story.textOverlay.position.x}%`,
            top: `${story.textOverlay.position.y}%`,
            transform: `translate(-50%, -50%) rotate(${story.textOverlay.rotation}deg)`,
            color: story.textOverlay.color,
            fontSize: `${story.textOverlay.fontSize}px`,
            fontFamily: story.textOverlay.fontFamily,
            whiteSpace: "nowrap",
            textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
          }}
        >
          {story.textOverlay.text}
        </div>
      )}
    </div>
  );
}
