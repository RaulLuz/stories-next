"use client";

import React, { useState, useEffect } from "react";
import { StoriesBar } from "@/components/StoriesBar/StoriesBar";
import { StoryModal } from "@/components/StoryModal/StoryModal";
import { Toast } from "@/components/Toast/Toast";
import { StoriesGrid } from "@/components/StoriesGrid/StoriesGrid";
import { useLocalStorageApi as useLocalStorage } from "@/hooks/useLocalStorageApi";
import { useImageUpload } from "@/hooks/useImageUpload";
export default function Home() {
  const { stories, refreshStories } = useLocalStorage();
  const { error, clearError } = useImageUpload();
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(
    null
  );
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (error) {
      setToastMessage(error);
      setShowToast(true);
    }
  }, [error]);

  const handleStoryClick = (index: number) => {
    setSelectedStoryIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedStoryIndex(null);
  };

  const handleToastClose = () => {
    setShowToast(false);
    clearError();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <StoriesBar
        onStoryClick={handleStoryClick}
        onStoryAdded={(storyId) => {
          // Atualizar stories na página principal também
          refreshStories();
        }}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        <StoriesGrid onStoryClick={handleStoryClick} refreshTrigger={stories.length} />
      </div>

      {selectedStoryIndex !== null && (
        <StoryModal
          stories={stories}
          initialIndex={selectedStoryIndex}
          isOpen={true}
          onClose={handleCloseModal}
        />
      )}

      <Toast
        message={toastMessage}
        type="error"
        isVisible={showToast}
        onClose={handleToastClose}
      />
    </div>
  );
}
