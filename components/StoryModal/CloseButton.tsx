"use client";

import React from "react";

interface CloseButtonProps {
  onClick: () => void;
}

export function CloseButton({ onClick }: CloseButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        absolute top-4 right-4
        z-20
        w-8 h-8
        md:w-10 md:h-10
        rounded-full
        flex items-center justify-center
        transition-all duration-200
        hover:bg-opacity-70
        active:scale-90
        focus:outline-none focus:ring-2 focus:ring-offset-2
        bg-black bg-opacity-50
      "
      aria-label="Fechar modal"
    >
      <svg
        className="w-5 h-5 md:w-6 md:h-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
}
