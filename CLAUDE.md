# Olivia Ad Studio — Project Guide

## Quick Reference
- **Framework:** Next.js 16 (App Router, TypeScript)
- **UI:** Shadcn UI v4 (uses `@base-ui/react`, NOT Radix — use `render` prop instead of `asChild`)
- **Package Manager:** pnpm
- **Styling:** Tailwind CSS v4

## Commands
```bash
pnpm dev          # Dev server (Turbopack)
pnpm build        # Production build
pnpm test:run     # Run tests once
pnpm test         # Run tests in watch mode
pnpm lint         # ESLint
```

## Architecture
Single-page app with three-column layout:
- Left: collapsible sidebar (chat list)
- Center: chat panel (streaming AI messages)
- Right: canvas panel (image viewer, generation controls, asset gallery)

## Key Patterns
- **Shadcn/Base UI:** Use `render={<Button />}` instead of `asChild` on triggers (Tooltip, Popover, Dialog, AlertDialog)
- **No native dialogs:** Use Shadcn Dialog/AlertDialog/Sonner — never `alert()`, `confirm()`, `prompt()`
- **Theme:** `next-themes` with class strategy, `suppressHydrationWarning` on `<html>`
- **Persistence:** localStorage for settings, IndexedDB (via `idb-keyval`) for conversations/messages/assets
- **API routes:** `/api/gemini/chat` (SSE streaming), `/api/gemini/image` (single response, 240s timeout)
- **API key:** `x-api-key` header from client, falls back to `process.env.GEMINI_API_KEY`

## Models
- Chat: `gemini-3.1-pro-preview`
- Image: `gemini-3-pro-image-preview` (Nano Banana Pro)
- SDK: `@google/genai` — `imageConfig.imageSize` must be uppercase ("1K", "2K", "4K")

## Git Workflow
```
dev → PR → staging (Devin Review) → PR → main (Vercel deploy)
```

## Style Guide
- Warm neutrals, no purple, no AI-generated aesthetic
- Tailwind/CSS animations only (no Framer Motion)
- ARIA attributes on all interactive elements
