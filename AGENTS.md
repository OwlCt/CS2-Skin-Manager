# Repository Guidelines

## Project Structure & Module Organization
- `src/app` hosts all Next.js routes (`(main)` for authenticated pages, `api` for handlers) while shared UI lives in `src/components/{agents,skins,...}`.
- `src/contexts`, `src/hooks`, `src/lib`, and `src/types` hold shared state, utilities, and contracts—add new logic in the closest existing module.
- Data JSON sits in `data/`, Prisma schema in `prisma/`, and static assets plus translations in `public/`.

## Build, Test, and Development Commands
- `bun install` installs Bun-compatible dependencies defined in `bun.lock`.
- `bun run dev` launches Next.js 15 with Turbopack; use when iterating locally.
- `bun run build` creates an optimized production build; run before deployment changes.
- `bun run start` generates the Prisma client (`bun db:generate`) and starts the production server.
- `bun run lint` runs `next lint`; fix all warnings before opening a PR.
- `bun run translations:update` refreshes language files via `scripts/fetch-translations.js` (see `TRANSLATION_UPDATE.md`).

## Coding Style & Naming Conventions
- Use TypeScript, React Server Components, and Tailwind v4 classes; keep components functional and prefer hooks over class state.
- Follow the existing 2-space indentation and double-quote string style enforced by Biome/Next lint.
- Name React components in `PascalCase`, hooks in `useCamelCase`, utility helpers in `camelCase`, and directories in `kebab-case` when adding new ones.
- Co-locate CSS via Tailwind classes; avoid standalone `.css` files unless shared tokens are required.

## Testing Guidelines
- With no automated suite yet, pair `bun run lint` with manual smoke checks covering login, loadout edits, and locale switches.
- New tests should sit alongside sources as `*.test.tsx`; prefer Playwright or Vitest and document setup steps so reviewers can run them.

## Commit & Pull Request Guidelines
- Keep the existing prefixes (`Fix:`, `Optimized:`, `add:`) and limit subjects to ≤72 characters written in imperative mood.
- One concern per commit; avoid mixing feature work with translation refreshes or schema bumps.
- PRs must include a concise summary, UI screenshots/GIFs when visuals change, ticket links, and notes for env, translation, or schema updates (plus `.env.example` edits when applicable).

## Localization & Data Updates
- Run `bun run db:generate` after schema changes and include Prisma client updates when the deployment path requires them.
- Review diffs in `public/data/translations/*.json` and `data/*.json` after translation or data syncs to avoid accidental churn.
