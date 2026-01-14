"use client";

import React, { useRef, useState } from "react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useStoriesApi as useStories } from "@/hooks/useStoriesApi";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { StoryEditor } from "@/components/StoryEditor/StoryEditor";
import { isVideo } from "@/utils/validation";
import { fileToBase64 } from "@/utils/base64";
import { compressImage } from "@/utils/compression";

interface AddStoryButtonProps {
  onUploadStart?: () => void;
  onUploadSuccess?: (storyId: string) => void;
  onStorageFull?: () => void;
}

export function AddStoryButton({
  onUploadStart,
  onUploadSuccess,
  onStorageFull,
}: AddStoryButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { handleFileSelect, isUploading } = useImageUpload();
  const { clearAll, addStory } = useStories();
  const { refreshStories } = useLocalStorage();
  const [showStorageFullDialog, setShowStorageFullDialog] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [previewData, setPreviewData] = useState<{
    mediaBase64: string;
    mediaType: "image" | "video";
    file: File;
  } | null>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onUploadStart?.();

    try {
      // Processar arquivo
      const mediaType: "image" | "video" = isVideo(file) ? "video" : "image";
      let processedFile = file;
      let mediaBase64: string;

      if (mediaType === "image") {
        processedFile = await compressImage(file);
      }
      mediaBase64 = await fileToBase64(processedFile);

      // Mostrar editor de pré-visualização
      setPreviewData({ mediaBase64, mediaType, file: processedFile });
      setShowEditor(true);
    } catch (error) {
      const result = await handleFileSelect(file);
      if (result?.error === "STORAGE_FULL") {
        setShowStorageFullDialog(true);
        onStorageFull?.();
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEditorSave = async (textOverlay?: any) => {
    if (!previewData) return;

    setShowEditor(false);
    const result = await addStory(previewData.file, textOverlay);

    if (result.error === "STORAGE_FULL") {
      setShowStorageFullDialog(true);
      onStorageFull?.();
    } else if (result.success && result.story) {
      onUploadSuccess?.(result.story.id);
    }

    setPreviewData(null);
  };

  const handleEditorCancel = () => {
    setShowEditor(false);
    setPreviewData(null);
  };

  const handleClearAll = () => {
    clearAll();
    refreshStories();
    setShowStorageFullDialog(false);
    // Tentar adicionar novamente após limpar
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isUploading}
        className="
          flex-shrink-0
          w-16 h-16
          md:w-20 md:h-20
          rounded-full
          border-2 border-dashed border-gray-border
          bg-white
          flex items-center justify-center
          transition-all duration-200
          hover:border-instagram-primary
          hover:scale-105
          active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-instagram-primary focus:ring-offset-2
        "
        aria-label="Adicionar novo story"
      >
        {isUploading ? (
          <div className="w-6 h-6 border-2 border-instagram-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg
            className="w-6 h-6 md:w-8 md:h-8 text-gray-text"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/webm,video/ogg,video/quicktime"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Selecionar imagem"
      />

      {showStorageFullDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 animate-scale-in">
            <h3 className="text-lg font-semibold mb-4 text-gray-dark">
              Espaço Insuficiente
            </h3>
            <p className="text-base text-gray-dark mb-6">
              Não há espaço suficiente para salvar este story. Deseja limpar
              todos os stories para liberar espaço?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleClearAll}
                className="
                  flex-1
                  bg-instagram-primary
                  text-white
                  px-4 py-2
                  rounded-lg
                  font-medium
                  transition-colors
                  hover:bg-opacity-90
                  active:bg-opacity-80
                "
              >
                Limpar tudo
              </button>
              <button
                onClick={() => setShowStorageFullDialog(false)}
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

      {/* Editor de Pré-visualização */}
      {showEditor && previewData && (
        <StoryEditor
          mediaBase64={previewData.mediaBase64}
          mediaType={previewData.mediaType}
          onSave={handleEditorSave}
          onCancel={handleEditorCancel}
        />
      )}
    </>
  );
}
