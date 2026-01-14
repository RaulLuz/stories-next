"use client";

import React from "react";

interface ProgressBarProps {
  progress: number; // 0-100
  isActive: boolean;
  onClick?: () => void;
}

export function ProgressBar({
  progress,
  isActive,
  onClick,
}: ProgressBarProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1
        h-1 md:h-1.5
        rounded-full
        overflow-hidden
        transition-all duration-200
        ${onClick ? "cursor-pointer hover:opacity-80" : ""}
      `}
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.3)",
      }}
      aria-label={onClick ? "Navegar para este story" : undefined}
    >
      <div
        className={`
          h-full
          transition-all duration-75
          ${
            isActive
              ? "bg-gradient-to-r from-instagram-gradient-from via-instagram-gradient-via to-instagram-gradient-to"
              : progress === 100
              ? "bg-white"
              : "bg-transparent"
          }
        `}
        style={{
          width: `${progress}%`,
        }}
      />
    </button>
  );
}
