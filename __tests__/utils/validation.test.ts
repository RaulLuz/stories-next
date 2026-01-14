import { validateFile, isValidImageType, isValidFileSize, isGif } from "@/utils/validation";

// Mock File constructor
class MockFile extends File {
  constructor(
    parts: (string | Blob | ArrayBuffer | ArrayBufferView)[],
    filename: string,
    options?: FilePropertyBag
  ) {
    super(parts, filename, options);
  }
}

describe("validation", () => {
  describe("isValidImageType", () => {
    it("should return true for valid image types", () => {
      const jpgFile = new MockFile([""], "test.jpg", { type: "image/jpeg" });
      const pngFile = new MockFile([""], "test.png", { type: "image/png" });
      const gifFile = new MockFile([""], "test.gif", { type: "image/gif" });

      expect(isValidImageType(jpgFile)).toBe(true);
      expect(isValidImageType(pngFile)).toBe(true);
      expect(isValidImageType(gifFile)).toBe(true);
    });

    it("should return false for invalid types", () => {
      const txtFile = new MockFile([""], "test.txt", { type: "text/plain" });
      expect(isValidImageType(txtFile)).toBe(false);
    });
  });

  describe("isValidFileSize", () => {
    it("should return true for files under 10MB", () => {
      const smallFile = new MockFile([""], "test.jpg", { type: "image/jpeg" });
      Object.defineProperty(smallFile, "size", { value: 5 * 1024 * 1024 });
      expect(isValidFileSize(smallFile)).toBe(true);
    });

    it("should return false for files over 10MB", () => {
      const largeFile = new MockFile([""], "test.jpg", { type: "image/jpeg" });
      Object.defineProperty(largeFile, "size", { value: 11 * 1024 * 1024 });
      expect(isValidFileSize(largeFile)).toBe(false);
    });
  });

  describe("isGif", () => {
    it("should return true for GIF files", () => {
      const gifFile = new MockFile([""], "test.gif", { type: "image/gif" });
      expect(isGif(gifFile)).toBe(true);
    });

    it("should return false for non-GIF files", () => {
      const jpgFile = new MockFile([""], "test.jpg", { type: "image/jpeg" });
      expect(isGif(jpgFile)).toBe(false);
    });
  });

  describe("validateFile", () => {
    it("should return valid for correct file", () => {
      const file = new MockFile([""], "test.jpg", { type: "image/jpeg" });
      Object.defineProperty(file, "size", { value: 5 * 1024 * 1024 });
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });

    it("should return invalid for wrong type", () => {
      const file = new MockFile([""], "test.txt", { type: "text/plain" });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should return invalid for file too large", () => {
      const file = new MockFile([""], "test.jpg", { type: "image/jpeg" });
      Object.defineProperty(file, "size", { value: 11 * 1024 * 1024 });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
