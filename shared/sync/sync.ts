// Sync orchestrator. The pattern is:
//
//   1. Local write happens (e.g. in a feature module's createChallenge()).
//   2. The feature module calls enqueuePushChallenge(id). That writes to the
//      outbox AND fires a non-blocking push attempt — so when online, the
//      cloud is updated almost immediately, but the UI never waits.
//   3. On app foreground / sign-in, syncAll() drains the outbox and pulls
//      anything new from Supabase since the last watermark.
//
// Conflict policy: last-write-wins. flushOutbox runs before pull on every
// sync, so any pending local changes are pushed before remote changes are
// merged in. For a single-user-most-of-the-time app this is sufficient.

import { eq } from "drizzle-orm";
import { supabase } from "@/shared/auth/supabase";
import { db } from "@/shared/db/client";
import { challenges, pots } from "@/shared/db/schema";
import * as outbox from "./outbox";
import * as lastSync from "./lastSync";
import {
  challengeFromRemote,
  challengeToRemote,
  potFromRemote,
  potToRemote,
} from "./converters";

// ---------------- pushes (local → cloud) ----------------

async function pushChallenge(id: string): Promise<void> {
  const rows = await db.select().from(challenges).where(eq(challenges.id, id));
  if (rows.length === 0) {
    // Local row was deleted before push. Drop the queue entry; deletions
    // aren't propagated yet (no tombstone table), so the row stays in cloud.
    await outbox.remove("challenges", id);
    return;
  }
  const { error } = await supabase.from("challenges").upsert(challengeToRemote(rows[0]));
  if (error) {
    if (__DEV__) console.warn("[sync] pushChallenge failed", id, error.message);
    return; // leave it in the outbox; will retry next sync
  }
  await outbox.remove("challenges", id);
}

async function pushPot(id: string): Promise<void> {
  const rows = await db.select().from(pots).where(eq(pots.id, id));
  if (rows.length === 0) {
    await outbox.remove("pots", id);
    return;
  }
  const { error } = await supabase.from("pots").upsert(potToRemote(rows[0]));
  if (error) {
    if (__DEV__) console.warn("[sync] pushPot failed", id, error.message);
    return;
  }
  await outbox.remove("pots", id);
}

export async function flushOutbox(): Promise<void> {
  const pending = await outbox.snapshot();
  for (const entry of pending) {
    if (entry.table === "challenges") await pushChallenge(entry.id);
    else if (entry.table === "pots") await pushPot(entry.id);
  }
}

// ---------------- pulls (cloud → local) ----------------

async function pullChallenges(): Promise<void> {
  const since = await lastSync.getSince("challenges");
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .gt("updated_at", since)
    .order("updated_at", { ascending: true });
  if (error) {
    if (__DEV__) console.warn("[sync] pullChallenges failed", error.message);
    return;
  }
  if (!data || data.length === 0) return;
  for (const r of data) {
    const local = challengeFromRemote(r);
    await db
      .insert(challenges)
      .values(local)
      .onConflictDoUpdate({ target: challenges.id, set: local });
  }
  await lastSync.setSince("challenges", data[data.length - 1].updated_at);
}

async function pullPots(): Promise<void> {
  const since = await lastSync.getSince("pots");
  const { data, error } = await supabase
    .from("pots")
    .select("*")
    .gt("updated_at", since)
    .order("updated_at", { ascending: true });
  if (error) {
    if (__DEV__) console.warn("[sync] pullPots failed", error.message);
    return;
  }
  if (!data || data.length === 0) return;
  for (const r of data) {
    const local = potFromRemote(r);
    await db
      .insert(pots)
      .values(local)
      .onConflictDoUpdate({ target: pots.id, set: local });
  }
  await lastSync.setSince("pots", data[data.length - 1].updated_at);
}

// ---------------- public API ----------------

export async function syncAll(): Promise<void> {
  await flushOutbox();
  await pullChallenges();
  await pullPots();
}

// Public helpers feature modules call after a local write. They:
//   1. Add the row to the outbox so it survives an app restart.
//   2. Fire a non-blocking push so when online the cloud is updated quickly.
//      If it fails, the outbox entry persists and the next sync retries.

export function enqueuePushChallenge(id: string): void {
  void outbox.enqueue("challenges", id).then(() => pushChallenge(id));
}

export function enqueuePushPot(id: string): void {
  void outbox.enqueue("pots", id).then(() => pushPot(id));
}
