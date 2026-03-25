# Olivia Ad Studio — Build Log

> **Note:** This project was built using [Claude Code](https://claude.com/claude-code) (Anthropic's CLI agent). Unlike ChatGPT or similar tools, Claude Code doesn't have a shareable conversation link feature — sessions run locally in the terminal. This document reconstructs the full conversation history: the design decisions, back-and-forth iterations, code review cycles, and implementation journey.

A chronological log of the design decisions, implementation, and review process for building Olivia Ad Studio as a take-home challenge for the Olivia Applied Agentic Developer position.

---

## Phase 1: Planning & Architecture

### Initial Brief
- Build an AI-powered product ad generator web app
- 48-hour time limit
- Must demonstrate agentic behavior, clean code, good UX, and product taste

### Tech Stack Discussion
**Proposed by user:**
- TanStack Start, Shadcn UI, Google Nano Banana Pro for image gen, Vercel, Convex (if needed)
- Dual theme, single page, settings for custom API key

**Decisions made:**
- **Framework:** Switched from TanStack Start to **Next.js** — battle-tested on Vercel, aligns with Olivia's stack (TypeScript/React/Node)
- **Backend:** Skipped Convex — localStorage + IndexedDB sufficient for API key storage and persistence
- **Layout:** Split panel (chat left, canvas right) for "editor feel" bonus points
- **Package manager:** pnpm
- **Testing:** Vitest + React Testing Library (unit/component tests, no E2E)
- **Animations:** Tailwind/CSS only, no Framer Motion (zero bundle cost)
- **Theme:** next-themes with class strategy, no flash on refresh

### Nano Banana Pro Research
- Official codename for Google's `gemini-3-pro-image-preview` model
- Same API key as regular Gemini models
- Supports text-to-image, image editing, multi-turn iteration
- Resolution: 1K, 2K, 4K (must be uppercase)
- 10 aspect ratios supported
- $0.134/image at 1K/2K, $0.24 at 4K (~74 images within $10 budget)
- SDK: `@google/genai` with `responseModalities: ["TEXT", "IMAGE"]`

### Architecture Decisions
- Two API routes: `/api/gemini/chat` (SSE streaming) and `/api/gemini/image` (single response, 240s timeout)
- API key flow: user-provided via `x-api-key` header, falls back to `process.env.GEMINI_API_KEY`
- Chat model: Gemini 3.1 Pro Preview for conversation
- Image model: Nano Banana Pro for generation
- Persistence: localStorage (settings) + IndexedDB via idb-keyval (conversations, messages, assets)

---

## Phase 2: Core UI Build

### Three-Column Layout (inspired by Google AI Studio)
- Left: collapsible sidebar with chat list + projects
- Center: chat panel with streaming messages
- Right: asset panel with generated image thumbnails

### Layout Iterations
1. Started with Shadcn ResizablePanelGroup — panels had wildly wrong flex ratios (4% vs 96%), persisted stale layout data
2. Switched to simple CSS flex layout — more reliable
3. Right panel sized to `w-72` (narrow asset sidebar) per user preference

### UI Components Built
- Aspect ratio selector with visual SVG proportional icons (popover)
- Resolution selector as popover (was badge buttons, changed to single-select popover)
- Mode selector (Assisted / Generate) with colored indicators
- Message bubbles with markdown rendering (react-markdown)
- Image lightbox with keyboard navigation
- Trash bin with soft delete + permanent delete
- Search in sidebar
- Settings dialog (API key, theme, clear data)
- Features dialog (app capabilities showcase)
- Breadcrumbs for project navigation

### Key UI Fixes
- Nested `<button>` inside `<button>` errors — changed outer elements to `<div role="button">`
- Font changed from Geist to Inter + JetBrains Mono
- All native dialogs replaced with Shadcn (no `alert()`, `confirm()`, `prompt()`)
- Scrollbars hidden but scrolling preserved (`scrollbar-none`)
- Fixed-width mode selector and resolution selector to prevent layout shift

---

## Phase 3: AI Integration

### Two Generation Modes
1. **Assisted** — Gemini 3.1 Pro as "Product Ad Specialist", asks clarifying questions about product, audience, platform, style before generating
2. **Generate** — Sends prompt directly to Nano Banana Pro, bypasses chat model

### Image Iteration System
- "Iterate" button below each generated image in chat
- Clicking sets image as reference — shows as small thumbnail above input
- Reference image sent to Nano Banana Pro for context
- Both file upload and Iterate click share the same ref image slot (1 at a time)
- Ref image NOT shown in user's message bubble — only text prompt appears

### Per-Conversation Settings
- Mode, resolution, and aspect ratio saved to each conversation in IndexedDB
- Settings restored when switching between conversations
- Changes persisted immediately

### Chat Features
- Streaming responses with SSE
- Markdown rendering for model messages (bold, italic, lists)
- Generation intent parsing from model responses (`\`\`\`generation` blocks)
- Suggestions parsing (`\`\`\`suggestions` blocks)
- Skeleton loader during image generation
- Images appear inline in chat AND in asset panel

---

## Phase 4: Polish & Persistence

### Data Persistence
- Conversations, messages, and assets stored in IndexedDB
- Generated images persist across page refresh
- URL-based navigation state (`useUrlState` hook)
- Chat history with auto-generated titles from first message

### Projects System
- Create projects to organize related chats
- Project chats don't appear as standalone in sidebar
- Active project highlighted in sidebar
- Project assets aggregated from all child conversations

### Abuse Protection
- Client-side rate limiting: 5 generations/min, 30/hr
- Rate status displayed in header (e.g., "4/min · 29/hr")
- Countdown timer when limit reached

---

## Phase 5: Code Review (Devin Review)

### Git Workflow
```
dev → PR → staging (Devin Review) → PR → main (Vercel deploy)
```

### Round 1 — 3 findings (all fixed)
| Severity | File | Issue | Fix |
|----------|------|-------|-----|
| Severe | `use-chat.ts` | `mode` and `onDirectGenerate` missing from `useCallback` deps — stale closure when switching modes | Added to dependency array |
| Non-severe | `image-utils.ts` | `compressImage` promise never settles on image load failure | Added `img.onerror` handler |
| Non-severe | `use-chat.ts` | SSE parser drops text when data lines split across TCP chunks | Added line buffer between reads |

### Round 2 — 4 findings (all fixed)
| Severity | File | Issue | Fix |
|----------|------|-------|-----|
| Severe | `use-chat.ts` | Generate mode silently fails on first message — stale `activeConversationId` in closures | Pass `convId` through callbacks, `generateImage` accepts override |
| Non-severe | `use-conversations.ts` | Stale `allConversations` closure causes IndexedDB writes to lose concurrent updates | Capture updated value inside `setAllConversations` for DB writes |
| Non-severe | `suggestions.test.tsx` | Test expects old default suggestion text | Updated to match current text |
| Non-severe | `resolution-badges.test.tsx` | Tests query `role="radio"` but component uses popover `<button>` | Rewrote tests for popover structure |

### Round 3 — Clean
- 0 findings, all checks passed
- Devin Review completed analysis with no issues

---

## Deployment

- Vercel auto-deploys on push to `main`
- Build command: `pnpm build`
- Install command: `pnpm install`
- Environment variable: `GEMINI_API_KEY`

### PR History
1. PR #1: `dr-review-2026-03-24-1` (dev → staging) — Round 1 review
2. PR #2: `dr-review-2026-03-24-2` (dev → staging) — Round 2 review
3. PR #3: `dr-review-2026-03-24-3` (dev → staging) — Clean review, merged
4. PR #4: `Release: Olivia Ad Studio v1.0` (staging → main) — Production deploy

---

## Key Design Principles

- **No purple, no AI-generated aesthetic** — warm neutrals, off-white/charcoal
- **No native browser dialogs** — all Shadcn Dialog/AlertDialog/Sonner
- **ARIA attributes on all interactive elements**
- **Tailwind/CSS animations only** — no Framer Motion
- **Minimal dependencies** — no state management library, no image processing library
- **Per-conversation settings** — mode, resolution, ratio remembered per chat
- **Reference image system** — single ref slot, shared between Iterate and file upload
- **Two-phase delete** — soft delete to trash, then permanent delete

---

*Built with Claude Code (Opus) + Devin Review*
*Total Devin Review findings: 7 across 2 rounds, all addressed*
