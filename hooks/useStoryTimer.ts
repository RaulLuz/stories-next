import { useState, useEffect, useRef, useCallback } from "react";
import { STORY_DURATION } from "@/utils/constants";

export function useStoryTimer(
  isActive: boolean,
  onComplete?: () => void
): {
  progress: number;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  isPaused: boolean;
} {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Salvar o progresso atual antes de pausar
    if (startTimeRef.current > 0) {
      const currentElapsed = Date.now() - startTimeRef.current;
      elapsedRef.current = currentElapsed;
      // Atualizar progresso imediatamente para manter visual
      const currentProgress = (currentElapsed / STORY_DURATION) * 100;
      setProgress(Math.min(100, currentProgress));
    }
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (!isPaused || !isActive) return;

    setIsPaused(false);
    // Continuar de onde parou
    startTimeRef.current = Date.now() - elapsedRef.current;

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      elapsedRef.current = elapsed;

      if (elapsed >= STORY_DURATION) {
        setProgress(100);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onComplete?.();
      } else {
        setProgress((elapsed / STORY_DURATION) * 100);
      }
    }, 16); // ~60fps
  }, [isPaused, isActive, onComplete]);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setProgress(0);
    setIsPaused(false);
    elapsedRef.current = 0;
    startTimeRef.current = 0;
  }, []);

  useEffect(() => {
    if (isActive && !isPaused) {
      // Se não há progresso salvo ou foi resetado, começar do zero
      if (elapsedRef.current === 0 || startTimeRef.current === 0) {
        startTimeRef.current = Date.now();
        elapsedRef.current = 0;
      } else {
        // Continuar de onde parou - ajustar startTime para continuar do progresso atual
        startTimeRef.current = Date.now() - elapsedRef.current;
      }

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        elapsedRef.current = elapsed;

        if (elapsed >= STORY_DURATION) {
          setProgress(100);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onComplete?.();
        } else {
          const newProgress = (elapsed / STORY_DURATION) * 100;
          setProgress(newProgress);
        }
      }, 16); // ~60fps
    } else if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    // Quando pausado, não fazer nada - o progresso já está salvo e visível

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, isPaused, onComplete]);

  return {
    progress,
    pause,
    resume,
    reset,
    isPaused,
  };
}
