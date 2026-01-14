# 🚨 Solução Rápida: Erro "relation 'stories' does not exist"

## Execute este SQL no Neon Dashboard:

1. Acesse: **https://console.neon.tech**
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Cole e execute:

```sql
CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  media_base64 TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'gif')),
  text_overlay JSONB,
  comments JSONB DEFAULT '[]'::jsonb,
  created_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS created_at_idx ON stories(created_at);
CREATE INDEX IF NOT EXISTS expires_at_idx ON stories(expires_at);
```

5. Clique em **Run** ou pressione `Ctrl+Enter`

✅ Pronto! O app voltará a funcionar normalmente.
