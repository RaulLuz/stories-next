import { STORY_EXPIRATION_HOURS } from "./constants";

export function getExpirationTimestamp(createdAt: number): number {
  return createdAt + STORY_EXPIRATION_HOURS * 60 * 60 * 1000;
}

export function isStoryExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}

export function getTimeUntilExpiration(expiresAt: number): number {
  return Math.max(0, expiresAt - Date.now());
}

export function formatTimeRemaining(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
