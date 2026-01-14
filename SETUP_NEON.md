# Setup do Neon Database

## Passo 1: Instalar a integração Neon no Vercel

1. Acesse o [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto **Stories**
3. Vá em **Settings** → **Integrations**
4. Clique em **Browse Marketplace**
5. Procure por **"Neon"**
6. Clique em **"Add Integration"**
7. Siga o wizard:
   - Crie uma conta Neon (se ainda não tiver)
   - Escolha seu projeto Vercel
   - Configure o banco de dados
8. **Pronto!** As variáveis de ambiente serão configuradas automaticamente

## Passo 2: Executar a migration SQL

Após instalar o Neon, você precisa criar a tabela no banco:

### Opção A: Via Neon Dashboard (Recomendado)

1. Acesse o [Neon Dashboard](https://console.neon.tech)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Cole o seguinte SQL e execute:

```sql
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
```

### Opção B: Via Script Node.js (Automático)

1. Configure a variável de ambiente `POSTGRES_URL`:
   
   **Windows (PowerShell):**
   ```powershell
   $env:POSTGRES_URL="sua_connection_string_aqui"
   ```
   
   **Windows (CMD):**
   ```cmd
   set POSTGRES_URL=sua_connection_string_aqui
   ```
   
   **Linux/Mac:**
   ```bash
   export POSTGRES_URL="sua_connection_string_aqui"
   ```

2. Execute o script de migration:
   ```bash
   npm run migrate
   ```

   O script irá:
   - Verificar se a connection string está configurada
   - Executar a migration SQL automaticamente
   - Informar se houve sucesso ou erro

### Opção C: Via Vercel CLI

1. Instale o Vercel CLI se ainda não tiver:
   ```bash
   npm i -g vercel
   ```

2. Baixe as variáveis de ambiente:
   ```bash
   vercel env pull .env.local
   ```

3. Execute a migration:
   ```bash
   npm run migrate
   ```

**Onde encontrar a connection string:**
- Neon Dashboard → Seu projeto → Connection Details → Connection String

## Passo 3: Instalar dependências

```bash
npm install
```

As seguintes dependências foram adicionadas:
- `@neondatabase/serverless` - Cliente oficial do Neon
- `drizzle-orm` - ORM opcional (para uso futuro)

## Passo 4: Verificar variáveis de ambiente

Após instalar a integração, o Vercel deve ter adicionado automaticamente:
- `POSTGRES_URL` - Connection string do Neon

Você pode verificar em:
- Vercel Dashboard → Settings → Environment Variables

## Passo 5: Testar

1. Faça deploy do projeto:
   ```bash
   vercel
   ```

2. Teste adicionando um story
3. Verifique se os dados aparecem no Neon Dashboard → Data

## Troubleshooting

### Erro: "POSTGRES_URL não encontrada"
- Verifique se a integração Neon foi instalada corretamente
- Confirme que a variável `POSTGRES_URL` está presente nas Environment Variables

### Erro: "relation 'stories' does not exist"
- Execute a migration SQL no Neon Dashboard (veja Passo 2)

### Stories não aparecem após deploy
- Verifique os logs do Vercel: Dashboard → Deployments → Functions
- Confirme que a tabela foi criada corretamente

## Estrutura do Banco

A tabela `stories` armazena:
- `id` - ID único do story
- `media_base64` - Mídia em base64
- `media_type` - Tipo: 'image', 'video' ou 'gif'
- `text_overlay` - Texto sobreposto (JSON)
- `comments` - Array de comentários (JSON)
- `created_at` - Timestamp de criação
- `expires_at` - Timestamp de expiração

## Próximos Passos

Após configurar, o app usará o Neon ao invés do localStorage. Todos os stories e comentários serão sincronizados entre dispositivos!
