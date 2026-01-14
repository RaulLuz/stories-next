import { STORAGE_KEY } from "./constants";
import { StoriesData, Story } from "@/types/story";
import { isStoryExpired } from "./time";

export function getStoriesFromStorage(): Story[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }

    const parsed: StoriesData = JSON.parse(data);
    const validStories = parsed.stories.filter(
      (story) => !isStoryExpired(story.expiresAt)
    );

    // Se houver stories expirados, salvar a lista limpa
    if (validStories.length !== parsed.stories.length) {
      saveStoriesToStorage(validStories);
    }

    return validStories;
  } catch (error) {
    console.error("Erro ao ler stories do localStorage:", error);
    return [];
  }
}

export function saveStoriesToStorage(stories: Story[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const data: StoriesData = { stories };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      throw new Error("STORAGE_FULL");
    }
    console.error("Erro ao salvar stories no localStorage:", error);
    throw error;
  }
}

export function addStoryToStorage(story: Story): void {
  const stories = getStoriesFromStorage();
  stories.push(story);
  saveStoriesToStorage(stories);
}

export function removeStoryFromStorage(storyId: string): void {
  const stories = getStoriesFromStorage();
  const filtered = stories.filter((s) => s.id !== storyId);
  saveStoriesToStorage(filtered);
}

export function clearAllStories(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Erro ao limpar stories do localStorage:", error);
  }
}

export function checkStorageAvailable(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function getStorageUsage(): { used: number; available: number } {
  if (typeof window === "undefined") {
    return { used: 0, available: 0 };
  }

  try {
    let used = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    // A maioria dos navegadores tem limite de ~5-10MB
    const available = 10 * 1024 * 1024 - used; // Assumindo 10MB como limite
    return { used, available };
  } catch {
    return { used: 0, available: 0 };
  }
}
