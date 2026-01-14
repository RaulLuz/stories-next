"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { TextOverlay } from "@/types/story";
import { FONTS, TEXT_COLORS } from "@/utils/constants";
interface StoryEditorProps {
  mediaBase64: string;
  mediaType: "image" | "video";
  onSave: (textOverlay?: TextOverlay) => void;
  onCancel: () => void;
}

export function StoryEditor({
  mediaBase64,
  mediaType,
  onSave,
  onCancel,
}: StoryEditorProps) {
  const [text, setText] = useState("");
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [color, setColor] = useState<string>(TEXT_COLORS[0]);
  const [customColor, setCustomColor] = useState("");
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState<string>(FONTS[0].value);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedText, setSelectedText] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      } else if (e.key === "Delete" && selectedText && text.trim()) {
        setText("");
        setSelectedText(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, selectedText, text]);

  // Limitar posição do texto dentro do container com cálculo preciso
  const updatePosition = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!containerRef.current || !textRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const textRect = textRef.current.getBoundingClientRect();

      const clientX =
        "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY =
        "touches" in e ? e.touches[0].clientY : e.clientY;

      // Calcular limites considerando o tamanho real do texto
      const textWidth = textRect.width;
      const textHeight = textRect.height;
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      // Margem de segurança (padding mínimo)
      const padding = 10; // pixels

      // Calcular posição em pixels
      let xPx = clientX - containerRect.left;
      let yPx = clientY - containerRect.top;

      // Limitar considerando metade da largura/altura do texto + padding
      const minX = textWidth / 2 + padding;
      const maxX = containerWidth - textWidth / 2 - padding;
      const minY = textHeight / 2 + padding;
      const maxY = containerHeight - textHeight / 2 - padding;

      // Aplicar limites
      xPx = Math.max(minX, Math.min(maxX, xPx));
      yPx = Math.max(minY, Math.min(maxY, yPx));

      // Converter de volta para percentual
      const x = (xPx / containerWidth) * 100;
      const y = (yPx / containerHeight) * 100;

      setPosition({ x, y });
    },
    []
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!text.trim()) return;
    e.stopPropagation();
    setIsDragging(true);
    setSelectedText(true);
    updatePosition(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !text.trim()) return;
    updatePosition(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (text.trim()) {
      setIsEditing(true);
      setSelectedText(true);
    }
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    setCustomColor("");
  };

  const handleHexColorChange = (hex: string) => {
    setCustomColor(hex);
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      setColor(hex);
    }
  };

  const handleSave = () => {
    const textOverlay: TextOverlay | undefined = text.trim()
      ? {
          text: text.trim(),
          position,
          color: customColor && /^#[0-9A-F]{6}$/i.test(customColor)
            ? customColor
            : color,
          fontSize,
          fontFamily,
          rotation,
        }
      : undefined;
    onSave(textOverlay);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex">
      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center relative bg-gray-900">
        <div
          ref={containerRef}
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ maxWidth: "400px", margin: "0 auto" }}
        >
          {/* Media com contraste */}
          <div 
            className="relative rounded-3xl overflow-hidden shadow-2xl bg-white p-2"
            style={{
              maxWidth: "400px",
              height: "calc(100vh - 120px)",
              width: "100%",
              maxHeight: "calc(100vh - 120px)"
            }}
          >
            {mediaType === "video" ? (
              <video
                src={mediaBase64}
                className="w-full h-full object-contain rounded-3xl"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img
                src={mediaBase64}
                alt="Preview"
                className="w-full h-full object-contain rounded-3xl"
              />
            )}

            {/* Text Overlay Preview */}
            {text.trim() && (
              <div
                ref={textRef}
                className={`absolute cursor-move select-none ${
                  selectedText ? "ring-2 ring-blue-500 ring-offset-2" : ""
                }`}
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                  color: customColor && /^#[0-9A-F]{6}$/i.test(customColor)
                    ? customColor
                    : color,
                  fontSize: `${fontSize}px`,
                  fontFamily: fontFamily,
                  textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                  whiteSpace: "nowrap",
                  padding: "4px",
                }}
                onMouseDown={handleMouseDown}
                onDoubleClick={handleDoubleClick}
              >
                {isEditing ? (
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onBlur={() => setIsEditing(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setIsEditing(false);
                      }
                    }}
                    className="bg-transparent border-none outline-none"
                    style={{
                      color: customColor && /^#[0-9A-F]{6}$/i.test(customColor)
                        ? customColor
                        : color,
                      fontSize: `${fontSize}px`,
                      fontFamily: fontFamily,
                      textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                    }}
                    autoFocus
                  />
                ) : (
                  text
                )}
              </div>
            )}
          </div>
        </div>

        {/* Botão X para fechar */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors bg-black bg-opacity-50"
          aria-label="Fechar"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Sidebar de Controles */}
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Header */}
          <div>
            <h2 className="text-white text-xl font-semibold mb-2">
              Editar Story
            </h2>
            <p className="text-gray-400 text-sm">
              Adicione texto personalizado ao seu story
            </p>
          </div>

          {/* Text Input */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Texto
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Digite seu texto..."
              className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-instagram-primary transition-colors"
            />
          </div>

          {/* Font Family */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Fonte
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-instagram-primary transition-colors"
            >
              {FONTS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Tamanho: {fontSize}px
            </label>
            <input
              type="range"
              min="12"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-instagram-primary"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Cor
            </label>
            <div className="space-y-3">
              {/* Cores pré-definidas */}
              <div className="flex gap-2 flex-wrap">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleColorChange(c)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      color === c && !customColor
                        ? "border-white scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Selecionar cor ${c}`}
                  />
                ))}
              </div>
              {/* Input HEX */}
              <div>
                <label className="block text-gray-400 text-xs mb-1">
                  HEX Code
                </label>
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => handleHexColorChange(e.target.value)}
                  placeholder="#FFFFFF"
                  maxLength={7}
                  className="w-full px-3 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-instagram-primary transition-colors text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* Rotation */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Rotação: {rotation}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-instagram-primary"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-700 space-y-3">
          <button
            onClick={handleSave}
            className="w-full px-4 py-3 bg-instagram-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors"
          >
            Salvar Story
          </button>
          <button
            onClick={onCancel}
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <p className="text-gray-500 text-xs text-center">
            Pressione ESC para sair
          </p>
        </div>
      </div>
    </div>
  );
}
