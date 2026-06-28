@NEXT.md

- Bun (bun.lock). Run scripts with `bun run <script>`.
- Next.js 16 with breaking changes. READ `node_modules/next/dist/docs/` before touching Next.js APIs.
- Path alias: `@/*` → `./src/*`.

## STRICT RULES (MUST FOLLOW)

- **TYPESCRIPT**: STRICT TYPING ONLY. NEVER use `any`.
- **SHARED TYPES**: All custom DB relation types MUST be defined and exported from `src/types/index.ts` (e.g., `LeadWithRelations`, `OrderWithRelations`). ALWAYS import types from this directory.
- **NATIVE HTML FORBIDDEN**: NEVER use native HTML tags for UI elements (`<button>`, `<input>`, `<select>`, `<textarea>`, `<label>`, `<table>`, `<a>`).
- **UI COMPONENTS REQUIRED**: ALWAYS import and use predefined UI components from `@/components/ui/*` (e.g., `Button`, `Input`, `Select`, `Label`, `Table`). Use `Link` from `next/link` for navigation.

## Commands

- `bun run dev` — dev server
- `bun run lint` — eslint (core-web-vitals + typescript)
- `bun run build` — typechecks and builds (no separate typecheck script)
- `bun run db:generate` — generate Drizzle migration from schema changes
- `bun run db:migrate` — apply migrations
- `bun run db:push` — push schema to prod DB (uses `drizzle-prod.drizzle.config`, not checked in)

## Architecture

- **DB**: Neon serverless Postgres, Drizzle ORM with `neon-http` driver (not websocket). Client at `src/db/drizzle.ts`.
- **Auth**: better-auth at `src/lib/auth.ts`. Catch-all API route at `src/app/api/auth/[...all]`.
- **Drizzle schemas**: `src/db/auth-schema.ts` (better-auth tables: user, session, account, verification). `src/db/schema.ts` (app tables). Both registered in `drizzle.config.ts`.
- **CSS**: Tailwind v4 via `@tailwindcss/postcss` (no tailwind.config file — v4 uses CSS-first config).

## Setup

`.env` / `.env.local` required with `DATABASE_URL` (Neon connection string).
