"use client";

import React, { useState, useRef, useEffect } from "react";
import { Story, Comment } from "@/types/story";

interface CommentsPanelProps {
  story: Story;
  onAddComment: (comment: Comment) => void;
  onAddReply: (commentId: string, reply: Comment) => void;
}

const EMOJI_LIST = ["😀", "😂", "❤️", "🔥", "👍", "👏", "🎉", "😍", "😊", "🙌", "💯", "✨"];

export function CommentsPanel({ story, onAddComment, onAddReply }: CommentsPanelProps) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const comments = story.comments || [];

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments.length]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}-${Math.random()}`,
      text: newComment.trim(),
      createdAt: Date.now(),
    };

    onAddComment(comment);
    setNewComment("");
  };

  const handleAddReply = (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const reply: Comment = {
      id: `reply-${Date.now()}-${Math.random()}`,
      text: replyText.trim(),
      createdAt: Date.now(),
    };

    onAddReply(commentId, reply);
    setReplyText("");
    setReplyingTo(null);
  };

  const handleEmojiClick = (emoji: string) => {
    if (replyingTo) {
      setReplyText((prev) => prev + emoji);
    } else {
      setNewComment((prev) => prev + emoji);
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return "agora";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="w-80 bg-white border-l border-gray-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-border">
        <h3 className="text-lg font-semibold text-gray-dark">Comentários</h3>
        <p className="text-sm text-gray-text mt-1">{comments.length} comentários</p>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-text text-sm">Nenhum comentário ainda</p>
            <p className="text-gray-text text-xs mt-1">Seja o primeiro a comentar!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="space-y-2">
              {/* Comment */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-instagram-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">
                    {comment.text.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-light rounded-2xl px-3 py-2">
                    <p className="text-sm text-gray-dark break-words">{comment.text}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-text">{formatTime(comment.createdAt)}</span>
                    <button
                      onClick={() => {
                        setReplyingTo(comment.id);
                        inputRef.current?.focus();
                      }}
                      className="text-xs text-gray-text hover:text-instagram-primary transition-colors"
                    >
                      Responder
                    </button>
                  </div>
                </div>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-11 space-y-2">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-gray-border flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-text text-xs font-semibold">
                          {reply.text.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-light rounded-2xl px-3 py-2">
                          <p className="text-sm text-gray-dark break-words">{reply.text}</p>
                        </div>
                        <span className="text-xs text-gray-text">{formatTime(reply.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Input */}
              {replyingTo === comment.id && (
                <form
                  onSubmit={(e) => handleAddReply(e, comment.id)}
                  className="ml-11 flex gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Escreva uma resposta..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-border rounded-full focus:outline-none focus:ring-2 focus:ring-instagram-primary focus:border-transparent"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="px-4 py-2 bg-instagram-primary text-white rounded-full text-sm font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Enviar
                  </button>
                </form>
              )}
            </div>
          ))
        )}
        <div ref={commentsEndRef} />
      </div>

      {/* Emoji Picker */}
      <div className="p-3 border-t border-gray-border">
        <div className="flex gap-2 mb-2 overflow-x-auto scrollbar-hide">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              className="text-2xl hover:scale-110 transition-transform flex-shrink-0"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Adicione um comentário..."
            className="flex-1 px-4 py-2 text-sm border border-gray-border rounded-full focus:outline-none focus:ring-2 focus:ring-instagram-primary focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-instagram-primary text-white rounded-full text-sm font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </form>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
