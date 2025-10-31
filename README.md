# WeaponPaints CS2 Skin Manager

A Next.js web application for managing Counter-Strike 2 weapon skins, gloves, agents, and music kits with full multilingual support.

## Features

- 🎨 **Weapon Skins Management** - Browse and configure 2000+ CS2 skins
- 🧤 **Gloves & Knives** - Customize team-specific loadouts
- 👤 **Agent Selection** - Choose agents for T and CT sides
- 🎵 **Music Kits** - Configure in-game music
- 🌐 **Multilingual Support** - Full English and Simplified Chinese translations
- 🔐 **Steam Authentication** - Secure login via Steam OpenID
- 💾 **MySQL Database** - Persistent configuration storage

## Quick Start

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
bun run db:generate

# Start development server
bun run dev
```

## Language Support

This application supports multiple languages with automatic translation of all game content:

### Supported Languages
- 🇺🇸 English
- 🇨🇳 简体中文 (Simplified Chinese)

### Updating Translations

When CS2 adds new items, update translations with:

```bash
# Quick update command
bun run translations:update

# Or manually
node scripts/fetch-translations.js
```

See [TRANSLATION_UPDATE.md](./TRANSLATION_UPDATE.md) for detailed instructions.

### Translation Features

- ✅ Weapon skins and pattern names
- ✅ Agent names and descriptions
- ✅ Music kit names
- ✅ UI text (buttons, menus, etc.)
- ✅ Weapon categories and rarities
- ✅ Wear conditions

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: Bun
- **UI**: React 19, shadcn/ui, Tailwind CSS v4, Framer Motion
- **Database**: MySQL via Prisma ORM
- **Auth**: Steam OpenID (iron-session)
- **Validation**: Zod
- **Linting**: Biome

## Development

```bash
# Development server (with Turbopack)
bun run dev

# Production build
bun run build

# Start production server
bun run start

# Lint code
bun run lint

# Update database schema
bun run db:generate
```

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (main)/            # Main authenticated routes
│   │   ├── [category]/    # Dynamic weapon categories
│   │   ├── agents/        # Agent selection
│   │   └── music-kits/    # Music kit selection
│   └── api/               # API routes
├── components/            # React components
│   ├── skins/            # Skin-related components
│   ├── agents/           # Agent components
│   ├── music-kit/        # Music kit components
│   ├── nav/              # Navigation components
│   └── ui/               # shadcn/ui components
├── contexts/             # React contexts
│   └── LanguageContext.tsx  # Language state management
├── hooks/                # Custom React hooks
│   └── useTranslation.ts    # Translation hook
├── lib/                  # Utility functions
│   ├── data.ts          # Data loading utilities
│   ├── translations.ts  # Translation utilities
│   └── translation-mapping.ts  # Translation mappers
└── types/               # TypeScript type definitions

public/
└── data/
    └── translations/    # Translation JSON files
        ├── en.json      # English translations (6MB)
        └── zh-CN.json   # Chinese translations (6MB)

data/                    # Game data files
├── skins.json          # Local skin data
├── agents.json         # Local agent data
└── music_kits.json     # Local music kit data
```

## Environment Variables

Required variables (see `CLAUDE.md` for details):

```env
DATABASE_URL="mysql://..."
SESSION_PASSWORD="32-character-random-string"
STEAM_API_KEY="your-steam-api-key"
NEXT_PUBLIC_URL="http://localhost:3000"
```

## Translation Data Source

All translations are sourced from [CSGO-API](https://github.com/ByMykel/CSGO-API):
- Automatically updated game data
- Multiple language support
- Community-maintained

## License

[Your License Here]

## Credits

- Translation data: [CSGO-API by ByMykel](https://github.com/ByMykel/CSGO-API)
- UI Components: [shadcn/ui](https://ui.shadcn.com/)
