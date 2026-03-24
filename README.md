# Olivia Ad Studio

AI-powered product ad generator. Upload a product image, describe your vision, and generate professional ad creatives through conversation.

## Features

- **Conversational AI** — Chat with Gemini to describe and refine your ad creatives
- **AI Image Generation** — Powered by Nano Banana Pro for studio-quality visuals
- **Iterative Editing** — "Make it warmer", "Add a headline" — refine through conversation
- **Resolution Control** — Generate in 1K, 2K, or 4K
- **Aspect Ratios** — 10 options from 1:1 to 21:9 with visual ratio previews
- **Agentic Behavior** — Auto-detects product type, suggests ad directions, improves prompts
- **Multi-Chat** — Create and switch between conversations, all persisted locally
- **Asset Gallery** — Browse all generated images in a conversation
- **Dark/Light/System Theme** — No flash on page load
- **Custom API Key** — Bring your own Gemini API key or use the default
- **Fully Local** — All data stored in your browser (localStorage + IndexedDB)

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **UI:** Shadcn UI + Tailwind CSS
- **Chat AI:** Gemini 3.1 Pro Preview
- **Image AI:** Nano Banana Pro (`gemini-3-pro-image-preview`)
- **Theming:** next-themes
- **Storage:** localStorage + IndexedDB (idb-keyval)
- **Testing:** Vitest + React Testing Library
- **Package Manager:** pnpm

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Gemini API key ([Get one here](https://aistudio.google.com/apikey))

### Setup

```bash
# Clone the repo
git clone https://github.com/thangk/olivia-app.git
cd olivia-app

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Default Gemini API key for all users | Yes |

Users can also enter their own API key in Settings to use instead of the default.

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── api/gemini/       # API routes (chat + image generation)
│   ├── layout.tsx        # Root layout with theme provider
│   └── page.tsx          # Main workspace page
├── components/
│   ├── ui/               # Shadcn components
│   ├── layout/           # App layout (sidebar, chat panel, canvas)
│   ├── chat/             # Chat messages, input, suggestions
│   ├── canvas/           # Image viewer, gallery, ratio/resolution controls
│   ├── settings/         # Settings dialog
│   └── theme/            # Theme provider
├── hooks/                # Custom React hooks
├── lib/                  # Utilities (Gemini client, storage, image utils)
└── types/                # TypeScript interfaces
```

## Development

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm test         # Run tests
pnpm lint         # Lint code
```

### Git Workflow

```
dev → PR → staging (code review) → PR → main (Vercel deploy)
```

## Deployment

Deployed on [Vercel](https://vercel.com). Auto-deploys on push to `main`.

## License

MIT
