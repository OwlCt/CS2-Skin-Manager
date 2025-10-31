# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 web application for managing Counter-Strike 2 weapon skins, gloves, knives, agents, and music kits. Users authenticate via Steam OpenID and can configure their in-game cosmetics through a web interface. The application persists user configurations to a MySQL database, which is read by a CS2 game server plugin.

## Tech Stack

- **Framework**: Next.js 15 (App Router, React Server Components)
- **Runtime**: Bun (preferred over npm/node)
- **UI**: React 19, shadcn/ui components, Tailwind CSS v4, Framer Motion
- **Database**: MySQL via Prisma ORM
- **Authentication**: Steam OpenID via `iron-session`
- **Validation**: Zod schemas
- **Linting**: Biome (not ESLint)

## Development Commands

```bash
# Development server with Turbopack
bun run dev

# Production build
bun run build

# Start production server (generates Prisma client first)
bun run start

# Lint code with Biome
bun run lint

# Generate Prisma client after schema changes
bun run db:generate
```

## Database Architecture

The database schema follows the WeaponPaints CS2 plugin structure with tables prefixed `wp_`:

- `wp_player_skins`: Weapon skin configurations (paint, wear, seed, nametag, stattrak, stickers, keychains)
- `wp_player_knife`: Knife selections per team (CT/T)
- `wp_player_gloves`: Glove selections per team
- `wp_player_agents`: Agent selections per team
- `wp_player_music`: Music kit selections per team
- `wp_player_pins`: Pin selections per team

All tables use Steam ID (18-character string) as the primary identifier. Most tables support team-specific configurations:
- `weapon_team`: 0 (both teams), 2 (Terrorists), 3 (Counter-Terrorists)

After modifying `prisma/schema.prisma`, run `bun run db:generate` to update the Prisma client.

## Authentication Flow

1. User visits root `/` and clicks Steam login
2. App redirects to `/api/auth/steam` which initiates Steam OpenID authentication
3. Steam redirects back to `/api/auth/callback/steam` with authentication data
4. Callback handler validates the Steam ID and stores it in an encrypted iron-session cookie
5. Middleware (`src/middleware.ts`) protects all routes except `/` and `/api/*`
6. Authenticated users are redirected from `/` to `/gloves` (default starting page)

Session management is handled via `src/lib/session.ts` using `iron-session` with a `SESSION_PASSWORD` environment variable.

## Routing Structure

The app uses Next.js 15 App Router with grouped routes:

```
src/app/
├── (main)/                    # Main authenticated app layout
│   ├── [category]/            # Dynamic category pages (gloves, rifles, knives, etc.)
│   │   ├── [weapon]/          # Dynamic weapon pages within category
│   │   │   └── [paint]/       # Individual paint/skin detail page
│   │   ├── loading.tsx        # Category loading state
│   │   └── not-found.tsx      # Category not found
│   ├── agents/[team]/         # Agent selection by team (terrorists/counter-terrorists)
│   ├── music-kits/            # Music kit selection
│   └── layout.tsx             # Main app layout with navigation
├── api/                       # API routes
│   ├── auth/                  # Authentication endpoints (steam, callback, logout)
│   ├── skins/config/          # GET/POST skin configurations
│   ├── agents/config/         # GET/POST agent configurations
│   └── music-kits/config/     # GET/POST music kit configurations
├── layout.tsx                 # Root layout
└── page.tsx                   # Login page
```

## Data Loading Pattern

Static game data is loaded from JSON files in the `data/` directory:

- `skins.json`: All weapon skins with paint IDs, defindexes, images, categories
- `agents.json`: All agent models with team assignments
- `music_kits.json`: All music kit IDs and metadata
- `categories.json`: Weapon category mappings
- `base_weapons.json`: Base weapon definitions

Data loading functions are in `src/lib/data.ts` and use Node.js `fs.promises` to read JSON files at runtime. These functions are called in Server Components and API routes.

## Key Concepts

### Weapon Identifiers
- `weapon_defindex`: Unique integer identifier for each weapon/glove type
- `weapon_paint_id` (or `paint`): Integer identifier for skin finish
- Knives and gloves have special handling via `isKnife()` and `isGlove()` utilities in `src/lib/weapons.ts`

### Skin Configuration
The main skin configuration flow (`src/api/skins/config/route.ts`):
1. User selects weapon, skin, wear, seed, nametag, stattrak
2. POST request validates data with Zod schema
3. Special handling for knives (updates `wp_player_knife` table)
4. Special handling for gloves (updates `wp_player_gloves` table)
5. Main skin data saved to `wp_player_skins` with upsert (update or create)
6. If `weapon_team` is 0, configuration is saved for both teams (2 and 3)

### Component Architecture
- **Server Components**: Pages and layout components that fetch data
- **Client Components**: Interactive UI in `src/components/` (marked with `"use client"`)
- **shadcn/ui**: Pre-built components in `src/components/ui/` (do not edit directly, regenerate via shadcn CLI)
- **Feature Components**: Domain-specific components in `src/components/{skins,agents,music-kit,weapons,nav,dialogs}`

Example: `PaintUI.tsx` is a client component that handles the skin customization interface (wear slider, seed input, stattrak toggle, etc.) and POSTs to `/api/skins/config`.

## Environment Variables

Required variables (see `.env.example`):
- `DATABASE_URL`: MySQL connection string
- `SESSION_PASSWORD`: 32-character random string for encrypting session cookies
- `STEAM_API_KEY`: Steam Web API key from https://steamcommunity.com/dev/apikey
- `NEXT_PUBLIC_URL`: Full app URL (e.g., `http://localhost:3000` for dev)

## Data Extraction Scripts

The `scripts/` directory contains Node.js scripts to extract game data from CS2 game files:
- `extract-weapon-mappings.js`: Extracts weapon skins data to `data/skins.json`
- `extract-agents.js`: Extracts agent data to `data/agents.json`
- `extract-music-kits.js`: Extracts music kit data to `data/music_kits.json`

These are run manually when CS2 game data is updated and should not be part of the build process.

## Type Definitions

TypeScript types are in `src/types/`:
- `skins.ts`: `Skins` interface and `Category` enum
- `agent.ts`: `Agent` interface
- `music-kit.ts`: `MusicKit` interface

## Path Aliases

```typescript
@/* maps to ./src/*
```

Example: `import { getSession } from "@/lib/session"`

## Build Configuration

- TypeScript build errors are ignored in production (`next.config.ts` has `ignoreBuildErrors: true`)
- Output mode is `standalone` for Docker/container deployments
- Remote images allowed from `raw.githubusercontent.com` and `cdn.jsdelivr.net`
