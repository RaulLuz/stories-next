"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Story } from "@/types/story";
import { useStoryTimer } from "@/hooks/useStoryTimer";
import { useSwipe } from "@/hooks/useSwipe";
import { ProgressBarsContainer } from "./ProgressBarsContainer";
import { StoryImage } from "./StoryImage";
import { CloseButton } from "./CloseButton";
import { CommentsPanel } from "./CommentsPanel";
import { Comment } from "@/types/story";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

interface StoryModalProps {
  stories: Story[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function StoryModal({
  stories,
  initialIndex,
  isOpen,
  onClose,
}: StoryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
    } else {
      onClose();
    }
  }, [currentIndex, onClose]);

  const handleComplete = useCallback(() => {
    handleNext();
  }, [handleNext]);

  // Timer ativo apenas quando o modal está aberto e não está pausado
  const isTimerActive = isOpen && !isHolding;
  const timer = useStoryTimer(isTimerActive, handleComplete);

  const handleBarClick = useCallback(
    (index: number) => {
      if (index !== currentIndex) {
        timer.pause();
        timer.reset();
        setCurrentIndex(index);
      }
    },
    [currentIndex, timer]
  );

  // Navegação por teclado
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        timer.pause();
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        timer.pause();
        handleNext();
      } else if (e.key === "Escape") {
        timer.reset();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrevious, onClose, timer]);

  // Swipe gestures (touch e mouse)
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      timer.pause();
      handleNext();
    },
    onSwipeRight: () => {
      timer.pause();
      handlePrevious();
    },
    onSwipeDown: () => {
      timer.reset();
      onClose();
    },
  });

  // Reset ao fechar
  useEffect(() => {
    if (!isOpen) {
      timer.reset();
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex, timer]);

  // Reset e reiniciar timer quando mudar de story
  const prevIndexRef = useRef(currentIndex);
  useEffect(() => {
    if (isOpen && prevIndexRef.current !== currentIndex) {
      timer.reset();
      prevIndexRef.current = currentIndex;
      // Forçar reinício do timer para o novo story
      // O timer será reiniciado automaticamente pelo useStoryTimer quando isActive for true
    }
  }, [currentIndex, isOpen, timer]);

  // Pausar/resumir timer ao segurar
  useEffect(() => {
    if (isHolding) {
      timer.pause();
    } else if (isOpen) {
      timer.resume();
    }
  }, [isOpen, isHolding, timer]);

  // Handlers para pausar ao clicar e segurar
  const handleMouseDown = useCallback(() => {
    holdTimeoutRef.current = setTimeout(() => {
      setIsHolding(true);
      timer.pause();
    }, 100);
  }, [timer]);

  const handleMouseUp = useCallback(() => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (isHolding) {
      setIsHolding(false);
      timer.resume();
    }
  }, [isHolding, timer]);

  const handleTouchStart = useCallback(() => {
    holdTimeoutRef.current = setTimeout(() => {
      setIsHolding(true);
      timer.pause();
    }, 100);
  }, [timer]);

  const handleTouchEnd = useCallback(() => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (isHolding) {
      setIsHolding(false);
      timer.resume();
    }
  }, [isHolding, timer]);

  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen || stories.length === 0) {
    return null;
  }

  const currentStory = stories[currentIndex];

  return (
    <div
      className="
        fixed inset-0
        bg-black bg-opacity-85
        z-50
        flex items-center justify-center
        animate-fade-in
      "
      onTouchStart={(e) => {
        handleTouchStart();
        swipeHandlers.onTouchStart(e);
      }}
      onTouchMove={swipeHandlers.onTouchMove}
      onTouchEnd={(e) => {
        handleTouchEnd();
        swipeHandlers.onTouchEnd();
      }}
      onMouseDown={(e) => {
        handleMouseDown();
        swipeHandlers.onMouseDown(e);
      }}
      onMouseMove={swipeHandlers.onMouseMove}
      onMouseUp={(e) => {
        handleMouseUp();
        swipeHandlers.onMouseUp();
      }}
      onMouseLeave={(e) => {
        handleMouseUp();
        swipeHandlers.onMouseLeave();
      }}
      style={{ cursor: swipeHandlers.isDragging ? "grabbing" : "grab" }}
    >
      {/* Barra de progresso */}
      <ProgressBarsContainer
        stories={stories}
        currentIndex={currentIndex}
        progress={timer.progress}
        onBarClick={handleBarClick}
      />

      {/* Botão fechar */}
      <CloseButton onClick={() => {
        timer.reset();
        onClose();
      }} />

      {/* Áreas clicáveis para navegação - apenas para pausar ao segurar */}

      {/* Container principal com story e comentários */}
      <div className="flex w-full h-full">
        {/* Imagem do story */}
        <div className="relative flex-1 flex items-center justify-center">
          <StoryImage story={currentStory} isActive={isOpen} />
        </div>

        {/* Painel de comentários */}
        <CommentsPanel
          story={currentStory}
          onAddComment={async (comment) => {
            try {
              await fetch(`${API_URL}/stories/${currentStory.id}/comments`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(comment),
              });
              // Atualizar story local
              if (!currentStory.comments) {
                currentStory.comments = [];
              }
              currentStory.comments.push(comment);
            } catch (error) {
              console.error("Erro ao adicionar comentário:", error);
            }
          }}
          onAddReply={async (commentId, reply) => {
            try {
              await fetch(`${API_URL}/stories/${currentStory.id}/comments/${commentId}/replies`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(reply),
              });
              // Atualizar story local
              const comment = currentStory.comments?.find((c) => c.id === commentId);
              if (comment) {
                if (!comment.replies) {
                  comment.replies = [];
                }
                comment.replies.push(reply);
              }
            } catch (error) {
              console.error("Erro ao adicionar resposta:", error);
            }
          }}
        />
      </div>

      {/* Setas de navegação */}
      {currentIndex > 0 && (
        <button
          onClick={() => {
            timer.pause();
            handlePrevious();
          }}
          className="
            absolute left-4
            top-1/2 -translate-y-1/2
            z-20
            w-10 h-10
            md:w-12 md:h-12
            bg-black bg-opacity-50
            rounded-full
            flex items-center justify-center
            transition-all duration-200
            hover:bg-opacity-70
            active:scale-90
            focus:outline-none focus:ring-2 focus:ring-white
          "
          aria-label="Story anterior"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {currentIndex < stories.length - 1 && (
        <button
          onClick={() => {
            timer.pause();
            handleNext();
          }}
          className="
            absolute right-4
            top-1/2 -translate-y-1/2
            z-20
            w-10 h-10
            md:w-12 md:h-12
            bg-black bg-opacity-50
            rounded-full
            flex items-center justify-center
            transition-all duration-200
            hover:bg-opacity-70
            active:scale-90
            focus:outline-none focus:ring-2 focus:ring-white
          "
          aria-label="Próximo story"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
