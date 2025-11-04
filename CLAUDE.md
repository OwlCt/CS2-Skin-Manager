# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WeaponPaints CS2 Skin Manager - A Next.js 15 web application for managing Counter-Strike 2 weapon skins, gloves, agents, and music kits with full multilingual support (English & Simplified Chinese). Users authenticate via Steam OpenID and customize their in-game loadouts, which are stored in MySQL and synced with a CS2 game server plugin.

**Tech Stack**: Next.js 15 (App Router), React 19, Bun runtime, MySQL (Prisma ORM), Steam OpenID (iron-session), shadcn/ui, Tailwind CSS v4, Framer Motion, Biome (linting)

## Essential Commands

### Development
```bash
# Install dependencies
bun install

# Generate Prisma client (required after schema changes or fresh clone)
bun run db:generate

# Start development server with Turbopack
bun run dev

# Build for production
bun run build

# Start production server (auto-generates Prisma client)
bun run start

# Lint code with Biome
bun run lint
```

### Translations & Data Updates
```bash
# Update all translation files (English & Chinese) from CSGO-API
bun run translations:update
# OR manually: node scripts/fetch-translations.js

# Update game data files when CS2 adds new content
node scripts/extract-weapon-mappings.js  # Update skins
node scripts/extract-agents.js           # Update agents
node scripts/extract-music-kits.js       # Update music kits
node scripts/extract-stickers.js         # Update stickers
node scripts/extract-keychains.js        # Update keychains

# Add vanilla (unpainted) weapon entries
node scripts/add-vanilla-weapons.js
node scripts/verify-vanilla-weapons.js
```

## Architecture Overview

### Database Schema (Prisma)
**Location**: `prisma/schema.prisma`

Six MySQL tables track per-user, per-team configurations:
- `wp_player_skins` - Weapon skins with paint_id, wear, seed, StatTrak, nametag, stickers, keychains
- `wp_player_knife` - Knife selection per team (2=T, 3=CT)
- `wp_player_gloves` - Glove selection per team
- `wp_player_agents` - Agent selection for T and CT sides
- `wp_player_music` - Music kit selection per team
- `wp_player_pins` - Pin selection per team

**Key**: Most tables use composite unique key `(steamid, weapon_team)` or `(steamid, weapon_team, weapon_defindex)` for per-team configurations.

### Translation System (Dual-Layer)

**1. UI Translations** (`src/contexts/LanguageContext.tsx`):
- Hardcoded UI strings (buttons, labels, toasts) in English & Chinese
- Client-side React Context with `useLanguage()` hook
- Provides `t(key)` function for UI text translation
- Persisted to localStorage, auto-detects browser language

**2. Game Data Translations** (`data/translations/`):
- Large JSON files (~6MB each) from [CSGO-API](https://github.com/ByMykel/CSGO-API)
- Contains all skin names, agent names, music kit names
- Loaded server-side via `src/lib/translations.ts` with in-memory cache
- Mapped via `src/lib/translation-mapping.ts` using paint_index, weapon_defindex, or IDs

**Important**: UI text uses LanguageContext, game items use translation JSON files. These are separate systems.

### Data Loading & Caching

**Location**: `src/lib/data.ts`

All game data files in `data/` directory are loaded via utility functions with **in-memory caching** to avoid repeated file reads:
- `getSkinsData()` - Returns all weapon skins from `data/skins.json`
- `loadAgents()` - Returns all agents from `data/agents.json`
- `getMusicKits()` - Returns all music kits from `data/music_kits.json`
- `getStickers()` - Returns all stickers from `data/stickers.json`
- `getKeychains()` - Returns all keychains from `data/keychains.json`
- `getBaseWeapons()` - Returns weapon definitions from `data/base_weapons.json`
- `getCategories()` - Returns weapon categories from `data/categories.json`

**Cache Strategy**: Data is cached in `dataCache` Map on first load and reused across requests. Cache persists until server restart.

### Image Proxy System

**Location**: `src/lib/image-proxy.ts`, `src/app/api/image-proxy/route.ts`

**Purpose**: Optionally cache Steam CDN images locally to work around regional CDN access issues.

**Toggle**: `ENABLE_IMAGE_CACHE` env var (default: "true")
- When enabled: Images from Steam CDN are proxied through `/api/image-proxy?url=...&category=...&weapon=...`
- When disabled: Original CDN URLs are used directly

**Cache Structure**: Images organized by category and subcategory:
- Skins: `cache/{category}/{weapon_name}/`
- Agents: `cache/agents/{terrorists|counter-terrorists}/`
- Music Kits: `cache/music-kits/`
- Stickers: `cache/stickers/{tournament_name}/`
- Keychains: `cache/keychains/{collection_name}/`

**Batch Processing**: `proxyImageUrls()` recursively converts image URLs in entire data structures.

### Team-Specific Weapon Restrictions

**Location**: `src/lib/weapons.ts`

CS2 has faction-exclusive weapons that can only be used by one team:
- **T-only weapons**: AK-47, Galil AR, SG 553, MAC-10, Tec-9, Sawed-Off, Glock-18, G3SG1
- **CT-only weapons**: M4A4, M4A1-S, FAMAS, AUG, MP9, MAG-7, Five-SeveN, P2000, USP-S, SCAR-20

**Functions**:
- `isTeamSpecific(defindex)` - Check if weapon is faction-locked
- `isTOnly(defindex)` / `isCTOnly(defindex)` - Check specific team
- `getRequiredTeam(defindex)` - Returns team number (2=T, 3=CT, 0=both)

**UI Impact**: When a team-specific weapon is selected, the team selector is automatically hidden and locked to the required team.

### Vanilla (Unpainted) Weapon Support

**Recent Addition**: System now supports selecting "vanilla" versions of all weapons (base skin with no paint).

**Data Generation**:
- Vanilla entries auto-generated by `scripts/add-vanilla-weapons.js`
- Special handling for knives (vanilla knife selection is meaningful)
- Non-knife vanilla weapons show notice: "Will use skin from your CS2 inventory"

**Detection**: Components check for `paint === 0` to display "Vanilla"/"无涂装" label instead of skin name.

### Authentication & Session

**Location**: `src/lib/session.ts`, `src/app/api/auth/`

**Flow**:
1. User clicks "Login with Steam" → redirected to Steam OpenID
2. Steam callback → validates, gets SteamID64
3. Session stored via `iron-session` (encrypted cookie)
4. Session contains: `steamId`, `personaName`, `avatarUrl`

**Middleware**: No custom middleware - authentication check happens in API routes and page components via `getSession()`.

### API Routes

**Location**: `src/app/api/`

**Key Routes**:
- `POST /api/skins/config` - Save weapon skin configuration
- `POST /api/agents/config` - Save agent selection
- `POST /api/music-kits/config` - Save music kit selection
- `GET /api/skins/search?q=...` - Search skins by name
- `GET /api/image-proxy?url=...` - Proxy/cache Steam CDN images
- `GET /api/auth/steam` - Initiate Steam OpenID flow
- `GET /api/auth/callback/steam` - Handle Steam callback
- `POST /api/auth/logout` - Clear session

**Common Pattern**: All config routes:
1. Check session with `getSession()`
2. Parse request body with Zod schema
3. Upsert to database via Prisma
4. Return success response

### App Router Structure

**Location**: `src/app/`

```
src/app/
├── (main)/                    # Authenticated routes group
│   ├── [category]/           # Dynamic weapon category pages (pistols, rifles, etc.)
│   │   └── [weapon]/         # Individual weapon customization page
│   ├── agents/               # Agent selection page
│   └── music-kits/           # Music kit selection page
├── api/                      # API route handlers
├── login/                    # Login page (public)
├── layout.tsx               # Root layout with providers
└── page.tsx                 # Home page
```

**Dynamic Routes**:
- `/[category]` - Maps to weapon categories from `data/categories.json`
- `/[category]/[weapon]` - Displays all skins for that weapon with customization UI

### Component Organization

**Location**: `src/components/`

**Key Components**:
- `skins/SkinCard.tsx` - Individual skin display card with rarity colors
- `skins/PaintUI.tsx` - Main weapon customization interface (wear, seed, StatTrak, stickers, etc.)
- `agents/AgentCard.tsx` - Agent display card with team indicator
- `music-kit/MusicKitCard.tsx` - Music kit display card
- `nav/Sidebar.tsx` - Category navigation sidebar
- `nav/MobileNav.tsx` - Mobile drawer menu with translations
- `ui/*` - shadcn/ui components (dialogs, buttons, sliders, etc.)

**Naming Convention**: Component files use PascalCase, match component name.

### Environment Variables

**Required** (see `.env.example`):
- `DATABASE_URL` - MySQL connection string
- `SESSION_PASSWORD` - 32-character random string for session encryption
- `STEAM_API_KEY` - From https://steamcommunity.com/dev/apikey
- `NEXT_PUBLIC_URL` - Full app URL for Steam callback

**Optional**:
- `ENABLE_IMAGE_CACHE` - Toggle image caching (default: "true")
- `NEXT_PUBLIC_SERVER_NAME` - Display name for CS2 server
- `NEXT_PUBLIC_SERVER_IP` / `NEXT_PUBLIC_SERVER_PORT` - For "Join Server" button

## Important Patterns & Gotchas

### Always Generate Prisma Client
After pulling changes or modifying `prisma/schema.prisma`, run:
```bash
bun run db:generate
```

### Translation Updates
When CS2 adds new content, update in this order:
1. Run `bun run translations:update` to fetch latest translations
2. Run relevant extract scripts to update game data
3. Test both English and Chinese languages
4. Verify search functionality works for new items

### Image URLs
All image URLs in data files are automatically proxied via `proxyImageUrls()` when data is loaded. Don't manually construct proxy URLs - use the utility functions in `src/lib/data.ts`.

### Team Values
Database uses numeric team values:
- `2` = Terrorists (T)
- `3` = Counter-Terrorists (CT)

Helper functions available in `src/lib/weapons.ts` for team logic.

### Float Values & Seeds
- **Wear float**: 0.000001 to 1.0 (lower = better condition)
- **Seed**: 0 to 1000 (affects pattern/placement)
- Database stores wear as FLOAT type, seed as INT

### Sticker/Keychain Format
Stored as string in format: `"id;wear;scale;rotation;offset_x;offset_y;slot"`
- Example: `"1234;0;1;0;0;0;0"` (sticker ID 1234, no wear, default scale/rotation/position)
- Use `"0;0;0;0;0;0;0"` for empty slot

### StatTrak Counter
Separate fields:
- `weapon_stattrak` (BOOLEAN) - Whether StatTrak is enabled
- `weapon_stattrak_count` (INT) - Kill count display (default: 0)

## Data Sources

All game content and translations sourced from:
- **CSGO-API**: https://github.com/ByMykel/CSGO-API
- Provides JSON endpoints for skins, agents, music kits, stickers, keychains
- Supports multiple languages with consistent structure
- Updated regularly by community

## Testing Notes

No automated test suite currently exists. Manual testing checklist:
- Test both English and Chinese UI/translations
- Verify search works for localized names
- Test team-specific weapon restrictions
- Verify Steam auth flow (login/logout)
- Check image loading with cache enabled/disabled
- Test mobile responsive layouts
- Verify database persistence after configuration changes
