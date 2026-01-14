import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  ACCEPTED_MEDIA_TYPES,
  MAX_FILE_SIZE,
  AcceptedImageType,
  AcceptedVideoType,
  AcceptedMediaType,
} from "./constants";

export function isValidImageType(file: File): boolean {
  return ACCEPTED_IMAGE_TYPES.includes(file.type as AcceptedImageType);
}

export function isValidVideoType(file: File): boolean {
  return ACCEPTED_VIDEO_TYPES.includes(file.type as AcceptedVideoType);
}

export function isValidMediaType(file: File): boolean {
  return ACCEPTED_MEDIA_TYPES.includes(file.type as AcceptedMediaType);
}

export function isValidFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

export function validateFile(file: File): {
  valid: boolean;
  error?: string;
} {
  if (!isValidMediaType(file)) {
    return {
      valid: false,
      error: "Formato de arquivo não suportado. Por favor, selecione uma imagem (JPG, PNG, WebP, GIF) ou vídeo (MP4, WebM, MOV).",
    };
  }

  if (!isValidFileSize(file)) {
    return {
      valid: false,
      error: "O arquivo selecionado é muito grande. O tamanho máximo permitido é 10MB. Por favor, escolha um arquivo menor.",
    };
  }

  return { valid: true };
}

export function isGif(file: File): boolean {
  return file.type === "image/gif";
}

export function isVideo(file: File): boolean {
  return isValidVideoType(file);
}
