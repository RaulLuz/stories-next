import { pgTable, text, jsonb, bigint, index } from "drizzle-orm/pg-core";
import { Story, Comment } from "@/types/story";

// Tabela de Stories
export const storiesTable = pgTable(
  "stories",
  {
    id: text("id").primaryKey(),
    mediaBase64: text("media_base64").notNull(),
    mediaType: text("media_type").notNull(), // 'image' | 'video' | 'gif'
    textOverlay: jsonb("text_overlay"), // TextOverlay | null
    comments: jsonb("comments").$type<Comment[]>(), // Comment[] | null
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
  },
  (table) => ({
    createdAtIdx: index("created_at_idx").on(table.createdAt),
    expiresAtIdx: index("expires_at_idx").on(table.expiresAt),
  })
);

export type StoryRow = typeof storiesTable.$inferSelect;
export type NewStoryRow = typeof storiesTable.$inferInsert;
