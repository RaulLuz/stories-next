import { useRef, useState, useCallback } from "react";

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeDown?: () => void;
  onSwipeUp?: () => void;
}

export function useSwipe(handlers: SwipeHandlers) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const minSwipeDistance = 50;

  const handleStart = useCallback((clientX: number, clientY: number) => {
    touchEndRef.current = null;
    touchStartRef.current = { x: clientX, y: clientY };
    setIsDragging(true);
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (touchStartRef.current) {
      touchEndRef.current = { x: clientX, y: clientY };
    }
  }, []);

  const handleEnd = useCallback(() => {
    if (!touchStartRef.current || !touchEndRef.current) {
      setIsDragging(false);
      return;
    }

    const distanceX = touchStartRef.current.x - touchEndRef.current.x;
    const distanceY = touchStartRef.current.y - touchEndRef.current.y;
    const absX = Math.abs(distanceX);
    const absY = Math.abs(distanceY);

    // Priorizar swipe horizontal se movimento horizontal for maior
    if (absX > absY && absX > minSwipeDistance) {
      if (distanceX > 0 && handlers.onSwipeLeft) {
        handlers.onSwipeLeft();
      } else if (distanceX < 0 && handlers.onSwipeRight) {
        handlers.onSwipeRight();
      }
    } else if (absY > absX && absY > minSwipeDistance) {
      if (distanceY > 0 && handlers.onSwipeUp) {
        handlers.onSwipeUp();
      } else if (distanceY < 0 && handlers.onSwipeDown) {
        handlers.onSwipeDown();
      }
    }

    touchStartRef.current = null;
    touchEndRef.current = null;
    setIsDragging(false);
  }, [handlers]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    handleStart(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
  }, [handleStart]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    handleMove(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
  }, [handleMove]);

  const onTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY);
  }, [handleStart]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX, e.clientY);
    }
  }, [isDragging, handleMove]);

  const onMouseUp = useCallback(() => {
    if (isDragging) {
      handleEnd();
    }
  }, [isDragging, handleEnd]);

  const onMouseLeave = useCallback(() => {
    if (isDragging) {
      handleEnd();
    }
  }, [isDragging, handleEnd]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    isDragging,
  };
}
