"use client";

import React, { useState } from "react";

interface DeleteStoryButtonProps {
  onDelete: () => void;
  className?: string;
}

export function DeleteStoryButton({
  onDelete,
  className = "",
}: DeleteStoryButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(false);
    onDelete();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(false);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`
          absolute top-0 right-0
          w-5 h-5
          bg-black bg-opacity-50
          rounded-full
          flex items-center justify-center
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          hover:bg-opacity-70
          active:scale-90
          ${className}
        `}
        aria-label="Excluir story"
      >
        <svg
          className="w-3 h-3 text-white"
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

      {showConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in"
          onClick={handleCancel}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-sm mx-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-dark">
              Excluir Story
            </h3>
            <p className="text-base text-gray-dark mb-6">
              Deseja excluir este story?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className="
                  flex-1
                  bg-red-500
                  text-white
                  px-4 py-2
                  rounded-lg
                  font-medium
                  transition-colors
                  hover:bg-red-600
                  active:bg-red-700
                "
              >
                Excluir
              </button>
              <button
                onClick={handleCancel}
                className="
                  flex-1
                  bg-gray-border
                  text-gray-dark
                  px-4 py-2
                  rounded-lg
                  font-medium
                  transition-colors
                  hover:bg-opacity-80
                  active:bg-opacity-70
                "
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
