# CLAUDE.md

Project-specific rules for Claude. Auto-loaded every session.

## What this is

**betterMe** — a personal React Native Expo app. A modular "life dashboard" where each idea (spending challenge, daily rules, monthly rituals, etc.) lives as its own self-contained module. Pastel + animated + image-driven aesthetic — soft, never busy.

Plan of record: `~/.claude/plans/delightful-crafting-wreath.md`.

## Database & migration workflow (READ THIS)

Schema lives in SQL files under `supabase/migrations/<timestamp>_<name>.sql`. **Git is the source of truth.** Do not edit schema in the Supabase Dashboard's Table Editor — those changes will diverge from the migrations.

### To make a schema change:

1. Generate a UTC timestamp: `date -u +%Y%m%d%H%M%S`.
2. Create `supabase/migrations/<that-timestamp>_<short_name>.sql`.
3. Write the SQL (CREATE TABLE / ALTER TABLE / RLS policies / etc.). For destructive changes, include a one-line comment explaining intent.
4. Run `npm run db:sync` — pushes the migration to Supabase **and** regenerates `shared/db/database.types.ts`.
5. Commit the new migration file **and** the regenerated `database.types.ts` in the **same commit**. They are inseparable.

### Hard rules:

- **Never hand-edit `shared/db/database.types.ts`.** It is generated from the live schema. Edits will be clobbered next sync.
- **Never make schema changes in the Supabase Dashboard.** If you discover dashboard drift, run `npm run db:diff` to capture it as a new migration, review it, then `db:sync`.
- The init migration `supabase/migrations/20260506000000_init.sql` is already applied (marked via `migration repair`). Do not re-run it.
- Keep RLS policies in the same migration as the table they protect.

### Commands:

```bash
npm run db:diff   # generate a migration from remote drift (rare, safety net)
npm run db:push   # apply local migrations to remote
npm run db:types  # regenerate TS types from remote schema
npm run db:sync   # db:push + db:types in one go (the usual command)
```

## Architecture principles

- **Local-first.** Reads come from on-device SQLite (`shared/db/client.ts`, Drizzle). Never `await` network on the render path. Supabase is a sync target, not a read source. This is what makes the app feel instant.
- **Modules don't import each other.** Each feature lives under `app/(app)/<module>/` (routes) and `modules/<module>/` (logic, components, assets). Cross-module communication happens through the shared layer or via the database, never direct imports.
- **Shared layer** under `shared/`: `auth/`, `db/`, `sync/`, `ui/`, `theme/`, `hooks/`. Reusable across modules.
- **Aesthetic is load-bearing.** Use `shared/ui/*` primitives (`Screen`, `SoftCard`, `PastelButton`, `PastelInput`, `Heading`, `Body`). Pastel palette in `tailwind.config.js` and `shared/theme/colors.ts`. Quicksand fonts. Soft shadows tinted by hue. Moti for entrance + state animations.

## Env vars

- `.env.local` (gitignored) holds real values.
- `.env.example` (committed) has placeholders.
- All client-accessible vars MUST be prefixed `EXPO_PUBLIC_*` so Expo inlines them at build time.
- Never commit the Supabase `service_role` / Secret key. Only the publishable / anon key belongs in the app.

## Auth

- Supabase email/password. Email confirmation is **off** during development.
- Session persists via AsyncStorage. The `AuthGate` in `app/_layout.tsx` redirects between `(auth)` and `(app)` route groups based on session.
- Web SSR uses a no-op storage adapter so static export doesn't crash on AsyncStorage in Node.

## Working style

- Build is structured into Phases A–G (see plan file). Each phase is a stopping point.
- One commit per logical unit. Co-author Claude on every commit.
- Run `npx tsc --noEmit` and `npx expo-doctor` before declaring a phase complete.
- For UI work, the visual identity ("does it feel right?") is a hard gate. If it doesn't feel pastel-soft, fix that before moving on.
- Never commit secrets or `node_modules/`.
