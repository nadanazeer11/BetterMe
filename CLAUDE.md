# CLAUDE.md

Project-specific rules for Claude. Auto-loaded every session.

## What this is

**betterMe** — a personal React Native Expo app. A modular "life dashboard" where each idea (spending challenge, daily rules, monthly rituals, etc.) lives as its own self-contained module. Pastel + animated + image-driven aesthetic — soft, never busy.

Plan of record: `~/.claude/plans/delightful-crafting-wreath.md`.

## Database & migration workflow (READ THIS)

There are **two parallel schemas** that must stay in sync:

1. **Remote (Supabase / Postgres)** — `supabase/migrations/<timestamp>_<name>.sql`. Source of truth for the cloud schema. Includes RLS policies.
2. **Local (SQLite / Drizzle)** — `shared/db/schema.ts` (TypeScript DSL) → generates `shared/db/drizzle/*.sql`. Source of truth for the on-device schema.

Different SQL dialects (Postgres vs SQLite), same logical schema. Each schema change touches both.

### To make a schema change:

1. Generate a UTC timestamp: `date -u +%Y%m%d%H%M%S`.
2. Write the **remote** migration: `supabase/migrations/<timestamp>_<short_name>.sql` (Postgres syntax + any RLS).
3. Update **local** Drizzle schema: edit `shared/db/schema.ts` to match.
4. Run `npm run db:sync` — pushes Postgres migration and regenerates `shared/db/database.types.ts`.
5. Run `npm run db:gen-local` — generates a new SQLite migration under `shared/db/drizzle/` from the updated `schema.ts`.
6. Commit **all four pieces in one commit**:
   - `supabase/migrations/<new>.sql`
   - `shared/db/database.types.ts` (regenerated)
   - `shared/db/schema.ts` (updated)
   - `shared/db/drizzle/<new>.sql` + `shared/db/drizzle/meta/*` (regenerated)

### Hard rules:

- **Never hand-edit `shared/db/database.types.ts`** — generated from remote schema. Clobbered next sync.
- **Never hand-edit `shared/db/drizzle/*.sql` or `shared/db/drizzle/meta/*`** — generated from `schema.ts`. Clobbered next `db:gen-local`.
- **Never make schema changes in the Supabase Dashboard** Table Editor. Migrations only — git is the source of truth. If drift happened, capture it with `npm run db:diff` and review.
- Remote and local schemas must stay in lockstep. Renaming a column in one without the other will break the sync layer.
- The init migration `supabase/migrations/20260506000000_init.sql` is already applied (marked via `migration repair`). Do not re-run it.
- Keep RLS policies in the same Supabase migration as the table they protect.

### Commands:

```bash
npm run db:diff       # generate a migration from remote drift (safety net)
npm run db:push       # apply local migrations to remote Supabase
npm run db:types      # regenerate Supabase TS types
npm run db:sync       # db:push + db:types (the usual remote command)
npm run db:gen-local  # regenerate Drizzle SQLite migration from schema.ts
```

## Architecture principles

- **Local-first.** Reads come from on-device SQLite (`shared/db/client.ts`, Drizzle). Never `await` network on the render path. Supabase is a sync target, not a read source. This is what makes the app feel instant.
- **Modules don't import each other.** Each feature lives under `app/(app)/<module>/` (routes) and `modules/<module>/` (logic, components, assets). Cross-module communication happens through the shared layer or via the database, never direct imports.
- **Shared layer** under `shared/`: `auth/`, `db/`, `sync/`, `ui/`, `theme/`, `hooks/`. Reusable across modules.
- **Aesthetic is load-bearing.** Use `shared/ui/*` primitives (`Screen`, `SoftCard`, `PastelButton`, `PastelInput`, `Heading`, `Body`). Pastel palette in `tailwind.config.js` and `shared/theme/colors.ts`. Quicksand fonts. Soft shadows tinted by hue. Moti for entrance + state animations.

## Voice & copy

- **Visual aesthetic = soft. Copy = direct.** The pastel palette and gentle animations carry the warmth. The words don't need to.
- **Don't lean on the garden/pot metaphor in copy.** "Spending garden", "tend your garden", "water it well", "soft hello", "kindnesses you owe yourself" — all out. Pots are a *visual* device, not a verbal one.
- Use plain, functional sentences. "Sign in to your account." beats "Sign in to tend your garden."
- Skip decorative overlines like "welcome back" or "hello, you" above headings. The heading itself is enough.
- Error messages: literal and helpful. "Password needs at least 6 characters." not "That password is a bit shy."
- Module blurbs describe what the module does, plainly. Visual personality lives in colors and illustrations, not adjectives.

## Sync layer (`shared/sync/`)

Local-first means writes go to SQLite first; the sync layer is what gets them to Supabase eventually. Public API (always import from `@/shared/sync`):

- **`enqueuePushChallenge(id)` / `enqueuePushPot(id)`** — call this **after every local mutation** of that table. It records the row in an AsyncStorage outbox and fires a non-blocking push attempt. Outbox survives app restarts; failed pushes retry on next sync.
- **`syncAll()`** — flushes outbox, then pulls remote changes since the last watermark. Called automatically on sign-in and app foreground via `useSync` (mounted once in root layout). Manual trigger only needed for "pull-to-refresh"-style UX.
- **`useSync()`** — hook that wires syncAll() to session + AppState changes. Don't call it from feature code; it lives once in `app/_layout.tsx`.

Conflict policy: last-write-wins via `updated_at`. `flushOutbox` always runs before pulls each sync, so pending local writes hit the cloud before remote rows are merged in. Single-user-most-of-the-time apps stay consistent with this rule.

**Rules:**
- Don't query Supabase directly in feature code. Read from local SQLite (Drizzle); the sync layer keeps it fresh.
- Every mutation function (e.g. `createChallenge`, `openPot`) must end with the matching `enqueuePush*(id)` call. Easy to forget — that row would never reach the cloud.
- Deletions aren't synced yet (no tombstone table). If we ever support delete, add a `tombstones` table + sync.
- Conversion between Drizzle (camelCase, SQLite types) and Supabase (snake_case, Postgres types) lives in `shared/sync/converters.ts`. Add a converter pair when adding a new synced table.

## Forms & keyboard

- Use `<Screen scroll keyboardAware>` for any screen with a `TextInput`. The `keyboardAware` prop wraps the content in `KeyboardAvoidingView` so inputs lift above the keyboard. `scroll` lets the user scroll if content still doesn't fit.
- Set `keyboardShouldPersistTaps="handled"` (already done in `Screen`) so tapping outside dismisses the keyboard naturally.
- **Inputs inside a BottomSheetModal:** the regular `TextInput` ignores the sheet's keyboard handling — the keyboard will overlay the input. Pass `TextInputComponent={BottomSheetTextInput}` to `PastelInput` (imported from `@gorhom/bottom-sheet`), and set `keyboardBehavior="interactive"`, `keyboardBlurBehavior="restore"`, `android_keyboardInputMode="adjustResize"` on the `BottomSheetModal`. See `RevealSheet.tsx` for the working setup.

## Env vars

- `.env.local` (gitignored) holds real values.
- `.env.example` (committed) has placeholders.
- All client-accessible vars MUST be prefixed `EXPO_PUBLIC_*` so Expo inlines them at build time.
- Never commit the Supabase `service_role` / Secret key. Only the publishable / anon key belongs in the app.

## Auth

- Supabase email/password. Email confirmation is **off** during development.
- Session persists via AsyncStorage. The `AuthGate` in `app/_layout.tsx` redirects between `(auth)` and `(app)` route groups based on session.
- Web SSR uses a no-op storage adapter so static export doesn't crash on AsyncStorage in Node.

## Tests

Jest + ts-jest. Tests live next to the code they test in `**/__tests__/*.test.ts`. Cover **pure logic only** — anything that touches Drizzle, expo-sqlite, or React Native must be tested in the running app, not here.

```bash
npm test          # run once
npm run test:watch
```

When adding a pure-logic helper (a generator, a state derivation, a formatter), write its tests in the same commit. Skip tests for code that orchestrates side effects.

## Working style

- Build is structured into Phases A–G (see plan file). Each phase is a stopping point.
- One commit per logical unit. Co-author Claude on every commit.
- Run `npx tsc --noEmit` and `npx expo-doctor` before declaring a phase complete.
- For UI work, the visual identity ("does it feel right?") is a hard gate. If it doesn't feel pastel-soft, fix that before moving on.
- Never commit secrets or `node_modules/`.
