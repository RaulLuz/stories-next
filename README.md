# Stories App

Aplicação de stories similar ao Instagram, desenvolvida com Next.js, TypeScript e Tailwind CSS.

## Funcionalidades

- ✅ Adicionar stories (imagens e GIFs)
- ✅ Visualizar stories em modal fullscreen
- ✅ Navegação entre stories (anterior/próximo)
- ✅ Barra de progresso clicável
- ✅ Timer automático de 3 segundos por story
- ✅ Compressão automática de imagens
- ✅ Suporte a GIFs animados
- ✅ Exclusão individual de stories
- ✅ Expiração automática após 24 horas
- ✅ Armazenamento local (localStorage)
- ✅ Design responsivo (mobile-first)
- ✅ Gestos de swipe em dispositivos móveis
- ✅ Navegação por teclado em desktop

## Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Jest** (para testes)
- **browser-image-compression** (para compressão de imagens)

## Instalação

1. Instale as dependências:

```bash
npm install
```

2. Execute o servidor de desenvolvimento:

```bash
npm run dev
```

3. Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa o linter
- `npm test` - Executa os testes
- `npm run test:watch` - Executa testes em modo watch
- `npm run test:coverage` - Executa testes com cobertura

## Estrutura do Projeto

```
stories/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Página principal
│   ├── layout.tsx         # Layout raiz
│   └── globals.css        # Estilos globais
├── components/            # Componentes React
│   ├── StoriesBar/       # Componentes da barra de stories
│   ├── StoryModal/       # Componentes do modal
│   └── Toast/            # Componente de notificações
├── hooks/                 # Hooks customizados
├── types/                 # Tipos TypeScript
├── utils/                 # Funções utilitárias
└── docs/                  # Documentação
```

## Especificações

Todas as especificações detalhadas estão em `docs/specification.md`.

## Limitações

- Armazenamento limitado pelo localStorage (geralmente ~5-10MB)
- Stories são armazenados localmente (não sincronizam entre dispositivos)
- Não há backend ou servidor

## Próximos Passos

Consulte `docs/specification.md` para melhorias futuras planejadas.
