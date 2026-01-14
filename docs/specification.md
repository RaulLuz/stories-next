# Especificação - Stories App

## Stack Tecnológica

- **Framework**: Next.js (App Router)
- **Linguagem**: TypeScript
- **Styling**: Tailwind CSS
- **Testes**: Jest + React Testing Library
- **Mobile-first**: Design responsivo com foco em dispositivos móveis
- **Compatibilidade**: Todos os dispositivos atuais (iOS, Android, Desktop)

## Princípios de Desenvolvimento

- **Clean Code**: Código legível, manutenível e bem documentado
- **Performance**: Otimizações de renderização, lazy loading, memoização quando necessário
- **Componentização**: Componentes reutilizáveis, separação de concerns, Single Responsibility Principle
- **Transições Suaves**: Animações fluidas e naturais em todas as interações

## 1. Funcionalidades Principais

### 1.1 Barra Horizontal de Stories

#### Layout
- Barra horizontal scrollável contendo previews dos stories
- Stories são adicionados sempre à direita (append)
- Primeiro item da barra é sempre um botão "+" para adicionar novo story
- Após o botão "+", seguem os stories existentes em ordem cronológica: **mais novo à esquerda, mais antigo à direita**

#### Preview dos Stories
- Cada story exibe uma miniatura (thumbnail) da imagem
- Tamanho fixo para os previews (mobile-first: ~64px, desktop: ~80px)
- Visual consistente para todos os previews
- Cada preview possui botão de exclusão (ícone X) ao passar mouse ou toque longo (mobile)
- Hover/touch feedback visual

### 1.2 Adicionar Story

#### Processo de Upload
1. Usuário clica no botão "+"
2. Sistema abre seletor de arquivo (input file)
3. Usuário seleciona uma imagem ou GIF
4. Sistema valida que é uma imagem ou GIF (tipo MIME)
5. Sistema valida tamanho máximo: **10MB** (tamanho original do arquivo)
6. Se exceder 10MB:
   - Exibe erro explicativo: "A imagem selecionada é muito grande. O tamanho máximo permitido é 10MB. Por favor, escolha uma imagem menor."
   - Não prossegue com o upload
7. Se válida:
   - **Para imagens estáticas (JPG, PNG, WebP)**: Sistema aplica compressão otimizada
     - Redimensiona se necessário (máximo 1920px na maior dimensão, mantendo aspect ratio)
     - Aplica compressão com qualidade ajustável (target: reduzir tamanho mantendo qualidade visual)
     - Valida que resultado final não excede 10MB após compressão
   - **Para GIFs**: 
     - Mantém GIF original (sem compressão adicional por padrão)
     - Se GIF for muito grande, pode otimizar reduzindo frames ou dimensões (opcional)
     - Valida que resultado final não excede 10MB
8. Sistema converte a imagem/GIF processada para base64
9. Sistema tenta armazenar no localStorage
10. Se localStorage estiver cheio:
    - Exibe aviso: "Não há espaço suficiente para salvar este story. Deseja limpar todos os stories para liberar espaço?"
    - Opções: "Limpar tudo" ou "Cancelar"
    - Se usuário escolher limpar, remove todos os stories e adiciona o novo
11. Se bem-sucedido, story aparece na barra horizontal (à direita dos existentes, mas visualizado como mais novo à esquerda após reordenação)

#### Armazenamento
- **Formato**: Base64 string
- **Local**: localStorage do navegador
- **Estrutura de dados**: Ver schema (seção 2)

### 1.3 Expiração Automática

#### Regra de Negócio
- Cada story expira automaticamente após **24 horas** da criação
- Sistema deve verificar periodicamente stories expirados
- Stories expirados são removidos do localStorage
- Remoção deve ser automática, sem intervenção do usuário

#### Timestamp
- Cada story deve ter um timestamp de criação
- Cálculo de expiração: timestamp_criacao + 24 horas
- Verificação pode ser feita:
  - Ao carregar a página
  - Periodicamente (ex: a cada minuto)
  - Ao visualizar stories

### 1.4 Visualização Modal

#### Abertura do Modal
- Ao clicar em um preview de story na barra horizontal
- Modal abre em tela cheia (fullscreen) com animação suave (fade + scale)
- **Fundo**: Preto com opacidade reduzida (ex: rgba(0, 0, 0, 0.85))
- **Imagem**: Centralizada, com comportamento de slider
- Transições suaves entre stories

#### Comportamento de Exibição
- Cada story fica visível por **3 segundos**
- Após 3 segundos, avança automaticamente para o próximo story com animação de slider (desliza para a esquerda)
- Ao chegar no último story e avançar: fecha modal
- Ao estar no primeiro story e voltar: fecha modal

#### Navegação Manual
- **Próximo story**: 
  - Swipe/touch para a esquerda (mobile)
  - Clique/toque na parte direita da tela (50% da largura)
  - Seta direita do teclado (desktop)
- **Story anterior**: 
  - Swipe/touch para a direita (mobile)
  - Clique/toque na parte esquerda da tela (50% da largura)
  - Seta esquerda do teclado (desktop)
- **Fechar modal**: 
  - Swipe para baixo (mobile)
  - Botão X no canto superior
  - Tecla ESC (desktop)
- **Comportamento do Timer durante navegação**:
  - Ao navegar manualmente: timer **pausa**, mas **não reseta** (mantém progresso)
  - Ao fechar modal: timer de **todos os stories é resetado**

#### Comportamento de Slider
- Transição suave entre imagens (slide horizontal)
- Efeito de deslize natural
- Suporte a gestos de swipe em mobile
- Compatível com mouse e teclado em desktop

### 1.5 Barra de Progresso

#### Visualização
- Barra de progresso no topo do modal
- **Uma barra para cada story** na sequência
- Todas as barras visíveis simultaneamente
- Layout horizontal, lado a lado com espaçamento pequeno

#### Comportamento
- Cada barra representa um story na ordem de exibição (mesma ordem da barra horizontal: mais novo à esquerda)
- Barra do story atual preenche progressivamente durante os 3 segundos
- Barras dos stories já visualizados ficam completamente preenchidas
- Barras dos stories futuros ficam vazias/transparentes
- **Clicável**: Ao clicar em uma barra, navega diretamente para o story correspondente
  - Timer do story anterior é resetado
  - Timer do story clicado começa do zero

#### Indicador Visual
- Story atual: barra preenchendo (animação de 0% a 100% em 3s) com transição suave
- Stories anteriores: barra 100% preenchida
- Stories futuros: barra vazia ou com opacidade reduzida
- Hover/touch feedback nas barras clicáveis

## 2. Estrutura de Dados

### 2.1 Schema de Story

```typescript
interface Story {
  id: string;              // ID único (UUID ou timestamp-based)
  imageBase64: string;     // Imagem ou GIF em formato base64 (data:image/[tipo];base64,...)
  createdAt: number;       // Timestamp de criação (Unix timestamp em ms)
  expiresAt: number;       // Timestamp de expiração (createdAt + 24h)
}
```

### 2.2 Armazenamento no localStorage

#### Chave
- Chave única para armazenar array de stories
- Exemplo: `"stories_app_data"`

#### Formato
```json
{
  "stories": [
    {
      "id": "story_1234567890",
      "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "createdAt": 1703123456789,
      "expiresAt": 1703209856789
    },
    {
      "id": "story_1234567891",
      "imageBase64": "data:image/png;base64,iVBORw0KGgo...",
      "createdAt": 1703123456790,
      "expiresAt": 1703209856790
    },
    {
      "id": "story_1234567892",
      "imageBase64": "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP...",
      "createdAt": 1703123456791,
      "expiresAt": 1703209856791
    }
  ]
}
```

## 3. Fluxos de Usuário

### 3.1 Fluxo: Adicionar Story
```
1. Usuário vê barra horizontal com botão "+" e stories existentes
2. Usuário clica no botão "+"
3. Sistema abre diálogo de seleção de arquivo
4. Usuário seleciona imagem ou GIF
5. Sistema valida arquivo (é imagem ou GIF?)
6. Sistema valida tamanho (máximo 10MB original)
7. Sistema aplica compressão/otimização:
   - Imagens estáticas: redimensiona e comprime
   - GIFs: mantém original ou otimiza se necessário
8. Sistema valida que resultado não excede 10MB
9. Sistema converte para base64
10. Sistema cria objeto Story com:
    - ID único gerado
    - imageBase64 (pode ser GIF animado)
    - createdAt: timestamp atual
    - expiresAt: createdAt + 24 horas
11. Sistema adiciona story ao array no localStorage
12. Sistema atualiza UI mostrando novo story na barra (à direita)
```

### 3.2 Fluxo: Visualizar Story
```
1. Usuário vê barra horizontal com stories
2. Usuário clica em um preview de story
3. Sistema abre modal em tela cheia (fundo preto com opacidade, animação suave)
4. Sistema exibe:
   - Imagem do story clicado (centralizada, comportamento de slider)
   - Barra de progresso no topo (todas as barras visíveis, clicáveis)
5. Sistema inicia timer de 3 segundos
6. Barra do story atual começa a preencher progressivamente
7. Durante visualização:
   - Se usuário navegar manualmente: timer pausa (não reseta)
   - Se usuário clicar em barra de progresso: navega para story correspondente, resetando timer
8. Após 3 segundos completos:
   - Se houver próximo story: avança automaticamente com slide
   - Se for o último: fecha modal
9. Ao fechar modal: todos os timers são resetados
10. Usuário pode navegar manualmente (swipe/clique/teclado)
```

### 3.4 Fluxo: Excluir Story Individual
```
1. Usuário visualiza barra horizontal de stories
2. Usuário passa mouse sobre preview (desktop) ou toca e segura (mobile)
3. Botão de exclusão (X) aparece no preview
4. Usuário clica no botão X
5. Sistema solicita confirmação: "Deseja excluir este story?"
6. Se confirmar:
   - Remove story do array no localStorage
   - Atualiza UI removendo preview da barra
7. Se cancelar: nada acontece
```

### 3.5 Fluxo: Limpar Todos os Stories
```
1. Sistema detecta que localStorage está cheio ao tentar adicionar story
2. Sistema exibe modal/alert: 
   - Mensagem: "Não há espaço suficiente para salvar este story. Deseja limpar todos os stories para liberar espaço?"
   - Botões: "Limpar tudo" e "Cancelar"
3. Se usuário escolher "Limpar tudo":
   - Remove todos os stories do localStorage
   - Limpa barra horizontal (exceto botão +)
   - Adiciona novo story normalmente
4. Se usuário escolher "Cancelar":
   - Fecha modal
   - Não adiciona story
```

### 3.3 Fluxo: Expiração Automática
```
1. Sistema carrega stories do localStorage
2. Sistema verifica timestamp de expiração de cada story
3. Para cada story onde expiresAt < timestamp atual:
   - Remove story do array
4. Sistema salva array atualizado no localStorage
5. Sistema atualiza UI removendo stories expirados da barra
```

## 4. Requisitos Técnicos

### 4.1 Validação de Arquivo
- Aceitar formatos de imagem: JPG, JPEG, PNG, WebP, GIF (incluindo GIFs animados)
- Validar tipo MIME antes de processar
- **Tamanho máximo original**: 10MB (antes da compressão)
- Se exceder limite, exibir mensagem de erro explicativa:
  - "A imagem selecionada é muito grande. O tamanho máximo permitido é 10MB. Por favor, escolha uma imagem menor."
- Validação deve acontecer antes do processamento

### 4.2 Compressão e Otimização de Imagens

#### Imagens Estáticas (JPG, PNG, WebP)
- **Redimensionamento**: 
  - Se largura ou altura > 1920px, redimensionar mantendo aspect ratio
  - Máximo: 1920px na maior dimensão
  - Usar algoritmo de alta qualidade para redimensionamento
- **Compressão**:
  - JPG: Qualidade ajustável (target: 80-85% para balanço qualidade/tamanho)
  - PNG: Converter para JPG se possível, ou usar compressão PNG otimizada
  - WebP: Manter formato ou converter para JPG dependendo do suporte
- **Validação pós-compressão**: 
  - Verificar que arquivo comprimido não excede 10MB
  - Se ainda exceder, aplicar compressão mais agressiva progressivamente

#### GIFs Animados
- **Preservação**: Por padrão, manter GIF original sem compressão
- **Otimização opcional**: Se GIF for muito grande (> 8MB):
  - Opção 1: Reduzir dimensões (max 1920px) mantendo animação
  - Opção 2: Reduzir frames (ex: manter 1 frame a cada 2)
  - Opção 3: Converter para formato estático (último frame como imagem)
- **Limite final**: Resultado não deve exceder 10MB
- **Suporte**: Navegadores modernos suportam GIFs animados em base64

#### Indicador Visual
- Mostrar feedback durante processamento (loading spinner)
- Exibir progresso da compressão quando possível

### 4.3 Conversão Base64
- Formato: `data:image/[tipo];base64,[dados]`
  - Para GIFs: `data:image/gif;base64,[dados]`
- Tipo detectado automaticamente do arquivo processado (MIME type)
- Manter qualidade otimizada após compressão

### 4.3 Geração de ID
- ID único para cada story
- Usar UUID v4 ou timestamp-based com random
- Deve ser único dentro do localStorage

### 4.4 Limpeza de Stories Expirados
- Verificação em múltiplos momentos:
  - Ao carregar a página
  - Ao abrir modal de visualização
  - Intervalo periódico (a cada 1 minuto)
  - Ao adicionar novo story
- Remoção automática e silenciosa

### 4.5 Gestão de localStorage
- Verificar disponibilidade de espaço antes de adicionar
- Se não houver espaço:
  - Tentar limpar stories expirados primeiro
  - Se ainda não houver espaço, solicitar limpeza manual ao usuário
- Tratamento de erro para quota excedida com mensagem amigável

## 5. Interface do Usuário

### 5.1 Design System

#### Cores (Instagram-like)
- **Primária**: Gradiente roxo-rosa (#833AB4, #FD1D1D, #FCB045) ou #0095F6 (azul Instagram)
- **Fundo**: Branco (#FFFFFF) ou modo escuro (#000000)
- **Texto**: Preto (#262626) ou branco (#FFFFFF) dependendo do tema
- **Bordas**: Cinza claro (#DBDBDB)
- **Hover/Active**: Cinza médio (#8E8E8E)
- **Barra de Progresso**: Branco (#FFFFFF) ou gradiente primário

#### Tipografia (Instagram-like)
- **Fonte Principal**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif
- **Tamanhos**:
  - Extra Small: 12px
  - Small: 14px
  - Base: 16px
  - Large: 18px
  - Extra Large: 22px

#### Espaçamento
- Mobile: 8px base (múltiplos de 8)
- Desktop: 12px base (múltiplos de 12)

### 5.2 Barra Horizontal
- **Posição**: Topo da página (mobile-first)
- **Scroll**: Horizontal quando há muitos stories, com scroll suave
- **Padding**: Mobile 12px, Desktop 16px
- **Botão "+"**: 
  - Primeiro item, sempre visível
  - Tamanho: 64px (mobile), 80px (desktop)
  - Estilo: Círculo com borda tracejada (#DBDBDB), ícone de "+" centralizado
  - Hover: Escurecer borda, leve scale
- **Previews**: 
  - Tamanho fixo: 64px (mobile), 80px (desktop)
  - Formato: Círculo perfeito
  - Borda: 2px sólida (cor primária quando não visualizado, cinza quando visualizado)
  - Espaçamento: 12px entre itens
  - Botão de exclusão: Aparece ao hover (desktop) ou touch longo (mobile)
    - Ícone X pequeno no canto superior direito do preview
    - Fundo semi-transparente
- **Transições**: Suaves em todas as interações (hover, adicionar, remover)

### 5.3 Modal de Visualização
- **Layout**: Fullscreen (position: fixed, top: 0, left: 0, width: 100vw, height: 100vh)
- **Fundo**: Preto com opacidade reduzida (rgba(0, 0, 0, 0.85))
- **Animação de entrada**: Fade in + scale (0.95 a 1.0) em 200ms
- **Animação de saída**: Fade out em 150ms
- **Z-index**: Máximo (ex: 9999)

#### Imagem/GIF
- **Posição**: Centralizada (flexbox ou grid)
- **Aspect Ratio**: Mantido original
- **Ajuste**: object-fit: contain (garante que toda imagem seja visível)
- **Tamanho máximo**: 90% da viewport (altura ou largura, o que for menor)
- **Comportamento de Slider**:
  - Transição suave entre imagens/GIFs (transform: translateX)
  - Duração: 300ms (ease-in-out)
  - Suporte a gestos de swipe (touch events)
- **GIFs Animados**:
  - Reproduzir animação automaticamente ao ser exibido
  - Loop infinito (padrão de GIFs)
  - Timer de 3 segundos conta mesmo durante animação

#### Barra de Progresso
- **Posição**: Topo do modal, com padding de 8px das bordas
- **Container**: Flexbox horizontal com gap de 4px
- **Altura**: 3px (mobile), 4px (desktop)
- **Bordas**: Arredondadas (border-radius: 2px)
- **Cor de fundo**: Branco com 30% de opacidade
- **Cor preenchida**: Branco 100% ou gradiente primário
- **Animação**: Transição linear de width (0% a 100% em 3s)
- **Interatividade**: Cursor pointer, hover effect leve

#### Controles de Navegação
- **Área esquerda (50% da largura)**: Story anterior
  - Cursor: pointer (desktop)
  - Feedback visual ao hover
- **Área direita (50% da largura)**: Próximo story
  - Cursor: pointer (desktop)
  - Feedback visual ao hover
- **Botão fechar**: 
  - Posição: Canto superior direito
  - Ícone: X branco
  - Tamanho: 32px (mobile), 40px (desktop)
  - Background: Semi-transparente preto (rgba(0, 0, 0, 0.5))
  - Border-radius: 50%
  - Hover: Escurecer background

### 5.4 Responsividade e Mobile-First

#### Breakpoints (Tailwind)
- Mobile: < 640px (default)
- Tablet: 640px - 1024px
- Desktop: > 1024px

#### Adaptações Mobile
- Touch targets: mínimo 44x44px
- Gestos de swipe nativos
- Scroll horizontal com momentum
- Botões maiores para facilitar toque

#### Adaptações Desktop
- Hover states em todos os elementos interativos
- Navegação por teclado (setas, ESC)
- Scroll com mouse wheel na barra horizontal
- Cursor pointer em áreas clicáveis

#### Comportamento Consistente
- Mesma funcionalidade em mobile e desktop
- Apenas adaptações visuais/touch quando necessário
- Performance otimizada para ambos

### 5.5 Mensagens e Feedback

#### Erro de Tamanho de Imagem
- **Tipo**: Toast ou modal
- **Mensagem**: "A imagem selecionada é muito grande. O tamanho máximo permitido é 10MB. Por favor, escolha uma imagem menor."
- **Estilo**: Fundo vermelho claro, texto branco, ícone de alerta
- **Duração**: 4 segundos ou até usuário fechar

#### Aviso de localStorage Cheio
- **Tipo**: Modal com confirmação
- **Mensagem**: "Não há espaço suficiente para salvar este story. Deseja limpar todos os stories para liberar espaço?"
- **Botões**: 
  - "Limpar tudo" (primário, destaque)
  - "Cancelar" (secundário)

#### Confirmação de Exclusão
- **Tipo**: Modal pequeno ou toast com ação
- **Mensagem**: "Deseja excluir este story?"
- **Botões**: "Excluir" e "Cancelar"

#### Transições
- Todas as mensagens aparecem com fade in
- Animações suaves (200-300ms)
- Não bloqueiam interação desnecessariamente

## 6. Comportamentos Especiais

### 6.1 Quando Não Há Stories
- Barra horizontal mostra apenas o botão "+"
- Ao clicar, adiciona primeiro story
- Transição suave quando primeiro story é adicionado

### 6.2 Navegação no Modal
- Ao chegar no último story e avançar: fecha modal
- Ao estar no primeiro story e voltar: fecha modal
- Durante a visualização automática (3s):
  - Se usuário navegar manualmente: timer **pausa** (mantém progresso atual)
  - Se usuário clicar em barra de progresso: navega para story e **reseta** timer daquele story
- Ao fechar modal: todos os timers são **resetados** para estado inicial

### 6.3 Múltiplos Stories
- Ordem de exibição no modal: mesma ordem da barra horizontal
- Ordem: **mais novo à esquerda, mais antigo à direita**
- Barra de progresso mostra todas as barras na mesma ordem
- Navegação segue esta ordem (esquerda = próximo, direita = anterior no tempo)

### 6.4 Gestos e Interações
- **Mobile**:
  - Swipe esquerda: próximo story
  - Swipe direita: story anterior
  - Swipe baixo: fechar modal
  - Touch longo no preview: mostrar opção de excluir
- **Desktop**:
  - Clique esquerda tela: próximo story
  - Clique direita tela: story anterior
  - ESC: fechar modal
  - Setas teclado: navegar stories
  - Hover no preview: mostrar botão excluir

## 7. Estrutura de Componentes (Sugestão)

### 7.1 Arquitetura de Componentes
```
components/
  ├── StoriesBar/
  │   ├── StoriesBar.tsx          // Container principal
  │   ├── AddStoryButton.tsx      // Botão de adicionar
  │   ├── StoryPreview.tsx        // Preview individual
  │   └── DeleteStoryButton.tsx   // Botão de excluir
  ├── StoryModal/
  │   ├── StoryModal.tsx          // Container do modal
  │   ├── StoryImage.tsx          // Imagem com slider
  │   ├── ProgressBar.tsx         // Barra de progresso individual
  │   ├── ProgressBarsContainer.tsx // Container das barras
  │   └── CloseButton.tsx         // Botão de fechar
  ├── Toast/
  │   └── Toast.tsx               // Mensagens de erro/sucesso
  └── ConfirmDialog/
      └── ConfirmDialog.tsx       // Modal de confirmação
```

### 7.2 Hooks Customizados (Sugestão)
```
hooks/
  ├── useStories.ts              // Gerenciamento de stories (CRUD)
  ├── useStoryTimer.ts           // Lógica do timer de 3s
  ├── useLocalStorage.ts         // Wrapper para localStorage
  ├── useSwipe.ts                // Detecção de gestos swipe
  └── useImageUpload.ts          // Upload, validação, compressão de imagens/GIFs
```

### 7.3 Utilitários
```
utils/
  ├── storage.ts                 // Funções de localStorage
  ├── validation.ts              // Validação de arquivos (tipo, tamanho)
  ├── compression.ts             // Compressão e otimização de imagens/GIFs
  ├── base64.ts                  // Conversão para base64
  ├── time.ts                    // Cálculos de expiração
  └── constants.ts               // Constantes (10MB, 24h, maxWidth, etc)
```

### 7.4 Tipos TypeScript
```
types/
  └── story.ts                   // Interface Story e tipos relacionados
```

## 8. Testes

### 8.1 Cobertura Mínima
- Testes unitários para funções utilitárias
- Testes de componentes com React Testing Library
- Testes de hooks customizados
- Testes de integração para fluxos principais

### 8.2 Casos de Teste Principais
- Adicionar story (sucesso e erro)
- Validar tamanho de arquivo (10MB)
- Compressão de imagens estáticas
- Suporte a GIFs animados
- Validação pós-compressão (não exceder 10MB)
- Excluir story individual
- Limpar todos os stories
- Expiração automática após 24h
- Navegação no modal (anterior/próximo)
- Timer pausa e reset
- Gestos de swipe
- localStorage cheio
- Reprodução de GIFs animados no modal

## 9. Melhorias Futuras (Fora do Escopo Inicial)

### 9.1 Funcionalidades de Conteúdo
- [ ] Suporte a vídeos ✅ (Implementado)
- [ ] Edição de stories (texto, filtros, stickers) ✅ (Texto implementado)
- [ ] Múltiplas imagens por story
- [ ] Adicionar stickers/emojis aos stories
- [ ] Aplicar filtros visuais (brilho, contraste, saturação)
- [ ] Adicionar música/fundo sonoro aos stories
- [ ] Criar stories com múltiplos textos sobrepostos
- [ ] Templates pré-definidos de stories

### 9.2 Interface e UX
- [ ] Modo escuro/claro ✅ (Implementado)
- [ ] Animações mais elaboradas ✅ (Melhorado)
- [ ] Pré-visualização antes de adicionar story ✅ (Implementado)
- [ ] Grid de stories na área principal (abaixo da barra)
- [ ] Visualização em lista de todos os stories
- [ ] Busca e filtros de stories
- [ ] Categorias/tags para organizar stories
- [ ] Preview hover com informações do story
- [ ] Indicador de stories não visualizados mais destacado

### 9.3 Organização e Gestão
- [ ] Coleções/álbuns de stories
- [ ] Favoritar stories importantes
- [ ] Compartilhar stories (exportar como imagem/vídeo)
- [ ] Download de stories individuais
- [ ] Histórico de stories deletados (com opção de restaurar)
- [ ] Estatísticas de visualização (se implementar backend)
- [ ] Backup e restauração de stories

### 9.4 Técnicas e Performance
- [ ] Sincronização entre dispositivos (backend)
- [ ] Compressão mais avançada de GIFs (otimização de frames, paleta de cores)
- [ ] Ajuste manual de qualidade de compressão pelo usuário
- [ ] Lazy loading otimizado para muitos stories
- [ ] Cache inteligente de thumbnails
- [ ] Suporte a WebP e AVIF para melhor compressão
- [ ] Otimização de vídeos antes do upload

### 9.5 Interatividade Social (se implementar backend)
- [ ] Comentários em stories
- [ ] Reações (curtir, amor, riso, etc.)
- [ ] Compartilhamento entre usuários
- [ ] Stories colaborativos
- [ ] Menções e tags de usuários
- [ ] Stories em destaque/pinados

### 9.6 Área Principal do App (Preencher espaço vazio)
- [ ] **Grid de Stories**: Exibir todos os stories em formato de grid abaixo da barra horizontal
  - Cards com preview, data de criação, tempo restante até expiração
  - Filtros: Todos, Imagens, Vídeos, Com texto
  - Ordenação: Mais recente, Mais antigo, Por tipo
- [ ] **Estatísticas Dashboard**: 
  - Total de stories criados
  - Stories ativos vs expirados
  - Espaço usado no localStorage
  - Gráfico de stories criados ao longo do tempo
- [ ] **Galeria de Stories**: 
  - Visualização em modo galeria com thumbnails maiores
  - Busca por texto (se stories tiverem texto)
  - Visualização em slideshow automático
- [ ] **Configurações**: 
  - Ajustes de qualidade de compressão
  - Preferências de tema (claro/escuro/automático)
  - Configurações de notificações (quando implementar)
  - Limpar cache e dados
- [ ] **Tutorial/Onboarding**: 
  - Guia interativo para novos usuários
  - Dicas e truques
  - Atalhos de teclado
- [ ] **Feed de Atividades**: 
  - Histórico de ações (story criado, deletado, editado)
  - Timeline de stories criados
- [ ] **Exportação e Compartilhamento**: 
  - Exportar story como imagem/vídeo
  - Compartilhar via link (se implementar backend)
  - Criar collage de múltiplos stories