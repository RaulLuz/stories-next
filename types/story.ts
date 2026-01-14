export type MediaType = "image" | "video" | "gif";

export interface TextOverlay {
  text: string;
  position: { x: number; y: number }; // Percentual (0-100)
  color: string; // Hex color
  fontSize: number; // px
  fontFamily: string;
  rotation: number; // 0-360 degrees
}

export interface Comment {
  id: string;
  text: string;
  createdAt: number; // Unix timestamp em ms
  replies?: Comment[]; // Respostas ao comentário (não podem ter respostas)
}

export interface Story {
  id: string;
  mediaBase64: string; // data:image/[tipo];base64,... ou data:video/[tipo];base64,...
  mediaType: MediaType;
  textOverlay?: TextOverlay;
  createdAt: number; // Unix timestamp em ms
  expiresAt: number; // Unix timestamp em ms
  comments?: Comment[]; // Comentários do story
}

export interface StoriesData {
  stories: Story[];
}
