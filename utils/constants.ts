export const STORAGE_KEY = "stories_app_data";

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB em bytes

export const MAX_IMAGE_WIDTH = 1920; // pixels

export const JPEG_QUALITY = 0.85; // 85% de qualidade

export const STORY_DURATION = 3000; // 3 segundos em ms

export const STORY_EXPIRATION_HOURS = 24;

export const EXPIRED_CHECK_INTERVAL = 60 * 1000; // 1 minuto em ms

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime", // .mov
] as const;

export const ACCEPTED_MEDIA_TYPES = [
  ...ACCEPTED_IMAGE_TYPES,
  ...ACCEPTED_VIDEO_TYPES,
] as const;

export type AcceptedImageType = (typeof ACCEPTED_IMAGE_TYPES)[number];
export type AcceptedVideoType = (typeof ACCEPTED_VIDEO_TYPES)[number];
export type AcceptedMediaType = (typeof ACCEPTED_MEDIA_TYPES)[number];

export const FONTS = [
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Poppins", value: "Poppins, sans-serif" },
  { name: "Montserrat", value: "Montserrat, sans-serif" },
  { name: "Open Sans", value: '"Open Sans", sans-serif' },
] as const;

export const TEXT_COLORS = [
  "#FFFFFF", // Branco
  "#000000", // Preto
  "#FF0000", // Vermelho
  "#00FF00", // Verde
  "#0000FF", // Azul
  "#FFFF00", // Amarelo
  "#FF00FF", // Magenta
  "#00FFFF", // Ciano
  "#FFA500", // Laranja
  "#FF69B4", // Rosa
] as const;