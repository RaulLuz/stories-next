import imageCompression from "browser-image-compression";
import { MAX_IMAGE_WIDTH, JPEG_QUALITY, MAX_FILE_SIZE } from "./constants";
import { isGif } from "./validation";

export interface CompressionOptions {
  maxWidthOrHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

export async function compressImage(
  file: File,
  options?: CompressionOptions
): Promise<File> {
  // Se for GIF, retorna sem compressão (ou pode implementar lógica específica depois)
  if (isGif(file)) {
    // Para GIFs muito grandes (> 8MB), podemos considerar otimização futura
    if (file.size > 8 * 1024 * 1024) {
      // Por enquanto, apenas avisamos mas mantemos o GIF
      console.warn("GIF muito grande detectado. Considerar otimização futura.");
    }
    return file;
  }

  const compressionOptions = {
    maxSizeMB: MAX_FILE_SIZE / (1024 * 1024), // Converter para MB
    maxWidthOrHeight: options?.maxWidthOrHeight || MAX_IMAGE_WIDTH,
    quality: options?.quality || JPEG_QUALITY,
  };

  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    
    // Validar que o resultado não excedeu 10MB
    if (compressedFile.size > MAX_FILE_SIZE) {
      // Tentar compressão mais agressiva
      const aggressiveOptions = {
        ...compressionOptions,
        quality: 0.7,
      };
      const moreCompressed = await imageCompression(file, aggressiveOptions);
      
      if (moreCompressed.size > MAX_FILE_SIZE) {
        throw new Error(
          "Não foi possível comprimir a imagem para menos de 10MB. Por favor, escolha uma imagem menor."
        );
      }
      
      return moreCompressed;
    }

    return compressedFile;
  } catch (error) {
    console.error("Erro ao comprimir imagem:", error);
    throw new Error(
      "Erro ao processar a imagem. Por favor, tente novamente ou escolha outra imagem."
    );
  }
}
