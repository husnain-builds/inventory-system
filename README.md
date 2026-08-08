# StockFlow

A modern inventory management dashboard built with **Next.js 16**, **React 19**, and **Tailwind CSS**. StockFlow helps warehouse teams track stock levels, manage users, and act on inventory with **AI-powered chat, automation, search, and voice**.

Admins see organization-wide inventory and user assignments; regular users manage their own stock. All data persists in the browser via `localStorage` (mock seed data included).

---

## Project scope

| Area | What it includes |
|------|------------------|
| **Auth & roles** | Sign in/up, admin vs user permissions, demo accounts |
| **Inventory** | CRUD for items (name, SKU, category, qty, location, owner), stock status |
| **Dashboard** | Stats, recent activity, category charts, smart reorder suggestions |
| **Inventory list** | Filterable table/cards, NL search, product images |
| **Users** (admin) | View all warehouse users and their assignments |
| **Analytics** | Stock trends, category breakdown, health metrics |
| **Notifications** | Activity feed and alert-style notifications |
| **Settings** | Profile and preferences |
| **AI layer** | Chat assistant, voice input, automation, images, category hints |

---

## Features

### Core inventory

- **Role-based access** — Admin vs User views and permissions
- **Inventory CRUD** — Add, edit, delete items with validation (SKU uniqueness, ownership)
- **Stock status** — Automatic `in-stock`, `low-stock`, `out-of-stock` from quantity vs min stock
- **Categories & units** — Electronics, Furniture, Supplies, Equipment, Safety; units like boxes, pairs, reams
- **Activity feed** — Recent adds, updates, removals, and alerts on the dashboard
- **Responsive UI** — Fixed sidebar on desktop; mobile header + bottom nav; glass-card layout

### AI chat assistant

- **Inventory-aware chat** — Sparkles button in the top bar opens a panel backed by live inventory context
- **Questions & summaries** — e.g. *"Summarize inventory health"*, *"What should I restock first?"*
- **Natural-language automation** — e.g. *"Add 50 safety gloves to Warehouse A"*, *"Set Wireless Mouse quantity to 100"*, *"Delete wireless mouse"*
- **Free LLM providers** — Groq (recommended), OpenRouter, GitHub Models, or Cerebras via OpenAI-compatible APIs
- **Provider fallback** — Tries configured providers in order if one fails

### Voice agent

- **Speech-to-text** — Tap mic, speak your request (Web Speech API)
- **Silence detection** — Waits ~1.6s after you stop talking, then sends automatically
- **Text-to-speech** — Optional spoken replies; mic pauses while the agent thinks/speaks
- **Hands-free loop** — After TTS, listening can resume for the next turn

### Smart reorder suggestions

- Heuristic ranking on the dashboard by urgency (critical / high / medium)
- Uses stock status, min stock, and recent removal activity to estimate days until empty
- Surfaces suggested reorder quantities and reasons

### Natural language search

- On `/inventory`, search like *"low stock safety items in warehouse A"*
- AI parses query into filters (status, category, location, owner, keywords) when an API key is set
- Rule-based fallback when AI is unavailable

### Product images

- **Auto-generate on add** — AI prompt + free image generation (Pollinations) after creating an item
- **Preview on add/edit** — Generate or regenerate with optional style hints before saving
- **Table thumbnails** — Product image replaces the package icon; hover for zoom preview
- **Chat automation** — *"Regenerate image for safety gloves, blue packaging"*

### Category suggestions

- While typing a product name in Add/Edit Item, AI suggests categories with one-click apply
- Works on add and edit flows

---

## Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/sign-in` | Public | Sign in |
| `/sign-up` | Public | Create account |
| `/` | Auth | Dashboard — stats, activity, reorder suggestions, recent inventory |
| `/inventory` | Auth | Full inventory table + NL search + CRUD |
| `/users` | Admin | All users and their inventory |
| `/analytics` | Auth | Charts and stock health breakdown |
| `/settings` | Auth | Profile & sign out |

---

## API routes

| Endpoint | Purpose |
|----------|---------|
| `POST /api/automation` | Parse prompt → chat reply or structured inventory action |
| `POST /api/chat` | Inventory chat with conversation history |
| `POST /api/ai` | Generic prompt → reply |
| `POST /api/search` | Natural language → search filters |
| `POST /api/suggest-category` | Product name → category suggestions |
| `POST /api/generate-image` | Product name/category → image URL |
| `POST /api/dashboard-summary` | Inventory context → AI summary |

---

## Tech stack

- **Framework** — [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- **UI** — React 19, Tailwind CSS 4, Lucide icons
- **Charts** — Recharts
- **AI** — Custom client for Groq / OpenRouter / GitHub Models / Cerebras; Pollinations for images
- **Voice** — Browser Web Speech API (STT + TTS)
- **Analytics** — Vercel Analytics
- **Deploy** — [Vercel](https://vercel.com)

---

## Getting started

### 1. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 2. Enable AI (optional but recommended)

Copy the example env file and add **one** free API key:

```bash
cp .env.example .env.local
```

| Provider | Env variable | Notes |
|----------|--------------|--------|
| **Groq** (recommended) | `GROQ_API_KEY` | [Get key](https://console.groq.com/keys) — fast, generous free tier |
| OpenRouter | `OPENROUTER_API_KEY` | Free models available |
| GitHub Models | `GITHUB_TOKEN` | Free with GitHub account |
| Cerebras | `CEREBRAS_API_KEY` | Free tier |

Use the raw key only — no quotes:

```bash
GROQ_API_KEY=gsk_your_key_here
```

Optional: `AI_PROVIDER=groq` to force a specific provider.  
Optional: `NEXT_PUBLIC_APP_URL` for OpenRouter headers.

Restart the dev server after changing `.env.local`.

### 3. Demo credentials

Click **Demo Credentials** on the sign-in form:

| Account | Email | Password |
|---------|-------|----------|
| Admin | `admin@stockflow.io` | `admin123456` |
| Warehouse User | `elena@stockflow.io` | `user123456` |

---

## Project structure

```
src/
├── app/
│   ├── (auth)/          # Sign in / sign up
│   ├── (dashboard)/     # Main app pages
│   └── api/             # AI & automation API routes
├── components/
│   ├── ai/              # Chat, NL search, reorder panel
│   ├── auth/            # Auth forms, guards
│   ├── inventory/       # Tables, forms, charts, product images
│   └── layout/          # Sidebar, top bar, mobile nav
├── context/             # Auth, inventory, settings providers
├── hooks/               # Chat + voice hooks
└── lib/
    ├── ai/              # Providers, automation, prompts, images
    ├── mock-data.ts     # Seed users & inventory
    └── inventory-utils.ts
```

---

## Data & auth

- **Storage** — Inventory and activity persist in `localStorage` (`stockflow_inventory`, `stockflow_activity`)
- **Auth** — Client-side session in `localStorage`; no backend database
- **Seed data** — Loaded from `src/lib/mock-data.ts` on first visit

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Design

Light theme with white cards on a soft gray background and indigo accents. Sidebar navigation on desktop; compact header and bottom tabs on mobile. Only the main content area scrolls.

---

## AI roadmap

See [AI-features.md](./AI-features.md) for additional planned capabilities (forecasting, anomaly detection, executive summaries, and more).

---

## Deploy on Vercel

1. Push the branch to GitHub and connect the repo on [Vercel](https://vercel.com).
2. Add `GROQ_API_KEY` (or another provider key) under **Project → Settings → Environment Variables** for **Preview** and **Production**.
3. Redeploy after adding env vars so serverless functions pick them up.

Without an API key, core inventory works; AI chat, NL search parsing, and category suggestions fall back to rule-based behavior where implemented.

---

## License

Private project.
