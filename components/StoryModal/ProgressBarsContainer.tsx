"use client";

import React from "react";
import { ProgressBar } from "./ProgressBar";
import { Story } from "@/types/story";

interface ProgressBarsContainerProps {
  stories: Story[];
  currentIndex: number;
  progress: number; // 0-100 do story atual
  onBarClick: (index: number) => void;
}

export function ProgressBarsContainer({
  stories,
  currentIndex,
  progress,
  onBarClick,
}: ProgressBarsContainerProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 px-2 pt-2">
      <div className="flex gap-1">
        {stories.map((story, index) => (
          <ProgressBar
            key={story.id}
            progress={
              index < currentIndex
                ? 100
                : index === currentIndex
                ? progress
                : 0
            }
            isActive={index === currentIndex}
            onClick={() => onBarClick(index)}
          />
        ))}
      </div>
    </div>
  );
}
