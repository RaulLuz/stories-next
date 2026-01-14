-- Criar tabela de stories
CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  media_base64 TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'gif')),
  text_overlay JSONB,
  comments JSONB DEFAULT '[]'::jsonb,
  created_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS created_at_idx ON stories(created_at);
CREATE INDEX IF NOT EXISTS expires_at_idx ON stories(expires_at);
