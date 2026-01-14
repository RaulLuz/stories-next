# ⚠️ Migration Necessária

## Erro: `relation "stories" does not exist`

Este erro indica que a tabela `stories` ainda não foi criada no banco de dados Neon.

## Solução Rápida

### Método 1: Via Neon Dashboard (Mais Fácil)

1. Acesse: https://console.neon.tech
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Cole e execute este SQL:

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

### Método 2: Via Script (Automático)

1. Configure a variável de ambiente com sua connection string do Neon:
   
   ```bash
   # Windows PowerShell
   $env:POSTGRES_URL="postgresql://user:password@host/database"
   
   # Windows CMD
   set POSTGRES_URL=postgresql://user:password@host/database
   
   # Linux/Mac
   export POSTGRES_URL="postgresql://user:password@host/database"
   ```

2. Execute:
   ```bash
   npm run migrate
   ```

**Encontre sua connection string em:**
- Neon Dashboard → Connection Details → Connection String

---

Após executar a migration, o app funcionará normalmente! 🎉
