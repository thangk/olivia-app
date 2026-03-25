# Olivia Ad Studio — Product Requirements Document

## Overview

**Olivia Ad Studio** is an AI-powered product ad generator that lets users upload product images and create professional advertising assets through conversational AI. Users describe their vision in natural language, and the system generates, iterates, and refines ad creatives in real time.

Built as a take-home challenge for the Olivia Applied Agentic Developer position.

---

## Problem Statement

Creating product advertisements typically requires design skills, expensive tools, and significant time. Small businesses, marketers, and content creators need a fast way to generate professional ad creatives from product photos without hiring a designer or learning complex software.

## Solution

A web-based AI studio that combines conversational AI with image generation to produce ad creatives. Users upload a product image, describe what they want in plain English, and iterate through conversation — the same way they'd work with a human designer.

---

## Target Users

- Olivia hiring judges (primary audience for this submission)
- Marketers needing quick ad mockups
- Small business owners creating social media content
- Content creators producing product-focused visuals

---

## Core Features

### 1. Conversational AI Chat
- Chat interface powered by Gemini 3.1 Pro Preview
- Streaming text responses for real-time feel
- Context-aware: understands uploaded products and previous generations
- Multi-turn conversation for iterative refinement

### 2. AI Image Generation
- Powered by Nano Banana Pro (`gemini-3-pro-image-preview`)
- Text-to-image from product descriptions
- Image editing: modify existing images via natural language
- Configurable resolution: 1K, 2K, 4K
- Configurable aspect ratio: 1:1, 9:16, 16:9, 3:4, 4:3, 3:2, 2:3, 5:4, 4:5, 21:9

### 3. Product Image Upload
- Drag-and-drop or click-to-upload
- Client-side compression for API efficiency
- Displayed in canvas panel as reference

### 4. Agentic Behavior
- Auto-analyzes uploaded product images (detects product type, suggests ad directions)
- Suggests prompt improvements for vague requests
- Proactively recommends lighting, angle, and text placement
- Generates 3-4 ad direction suggestions after product upload

### 5. Multi-Chat Management
- Create new conversations
- Switch between persisted chats in sidebar
- Chat history stored locally in IndexedDB
- Auto-generated chat titles from first message

### 6. Asset Gallery
- All generated images in current conversation displayed as thumbnails
- Click to view any previous version
- Download individual assets

### 7. Settings
- Custom Gemini API key (toggle to use own key instead of default)
- Theme selection: light / dark / system (default)
- Clear all local data with confirmation

### 8. Features Dialog
- Accessible from header ("?" button)
- Showcases app capabilities in a clean card layout
- Helps new users understand what the app can do

---

## Non-Functional Requirements

### Performance
- No theme flash on page load (next-themes with class strategy)
- Lazy-load heavy components (dynamic imports)
- Debounced localStorage writes
- Client-side image compression before API calls
- Skeleton loaders during async operations

### Accessibility
- ARIA attributes on all interactive elements
- Focus trapping in dialogs
- Keyboard navigation (Escape closes dialogs, Tab cycles controls)
- Live regions for streaming chat content
- Screen reader friendly

### UI Consistency
- All UI uses Shadcn components — no native browser dialogs
- No native `alert()`, `confirm()`, or `prompt()`
- Sonner for toast notifications
- Consistent warm neutral color palette (no purple, no AI-generated aesthetic)
- Tailwind/CSS animations only (no Framer Motion)

### Abuse Protection
- Client-side rate limiting: max 5 image generations per minute, 30 per hour
- Remaining quota visible in UI
- Countdown timer when limit reached
- Protects $10 API budget from accidental rapid-fire usage

### Persistence
- All data stored locally in the browser (no backend database)
- localStorage: API key, theme preference
- IndexedDB: conversations, messages, generated image assets
- Data survives page refresh

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router, TypeScript) |
| Package Manager | pnpm |
| UI Components | Shadcn UI |
| Styling | Tailwind CSS |
| Chat AI | Gemini 3.1 Pro Preview |
| Image AI | Nano Banana Pro (gemini-3-pro-image-preview) |
| SDK | @google/genai |
| Theming | next-themes |
| Local DB | IndexedDB via idb-keyval |
| Testing | Vitest + React Testing Library |
| Deployment | Vercel |
| Code Review | Devin Review |

---

## UI Layout

Three-column layout inspired by Google AI Studio:

| Column | Content |
|--------|---------|
| Left sidebar (collapsible) | Chat list, "New Chat" button, settings gear |
| Center | Chat messages + input with image upload |
| Right | Canvas (image viewer, resolution/ratio controls, asset gallery) |

### Responsive Behavior
- **Desktop (>=1024px):** Full three-column layout
- **Tablet (768-1023px):** Sidebar collapsed, two-column chat + canvas
- **Mobile (<768px):** Single column with bottom tab navigation

---

## API Architecture

Two Next.js API routes (thin proxies to Gemini):

### POST /api/gemini/chat
- Streams text from Gemini 3.1 Pro Preview
- Accepts conversation history + system instruction
- Returns SSE stream

### POST /api/gemini/image
- Generates/edits images via Nano Banana Pro
- Accepts prompt, reference image(s), resolution, aspect ratio
- Returns base64 image + descriptive text
- 240-second timeout for generation

API key priority: user-provided key (via header) > environment variable

---

## Git Workflow

```
dev (development) → PR → staging (Devin Review) → PR → main (Vercel deploy)
```

---

## Success Criteria

1. User can upload a product image and generate an ad creative via conversation
2. User can iterate on generated images ("make it warmer", "add headline")
3. Generated images respect selected resolution and aspect ratio
4. Chat history and assets persist across page refreshes
5. Theme switches without flash
6. App deployed and accessible on Vercel
7. Clean, consistent UI with good product taste
8. Agentic features work (auto-analysis, prompt suggestions)
