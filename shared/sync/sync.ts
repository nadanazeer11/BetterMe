// Sync orchestrator. The pattern is:
//
//   1. Local write happens (e.g. in a feature module's createChallenge()).
//   2. The feature module calls enqueuePush*(id). That writes to the outbox
//      AND fires a non-blocking push attempt — so when online, the cloud is
//      updated almost immediately, but the UI never waits.
//   3. On app foreground / sign-in, syncAll() drains the outbox and pulls
//      anything new from Supabase since the last watermark.
//
// Conflict policy: last-write-wins. flushOutbox runs before pull on every
// sync, so any pending local changes are pushed before remote changes are
// merged in. For a single-user-most-of-the-time app this is sufficient.

import { eq } from "drizzle-orm";
import { supabase } from "@/shared/auth/supabase";
import { db } from "@/shared/db/client";
import { challenges, expenses, pots } from "@/shared/db/schema";
import * as outbox from "./outbox";
import * as lastSync from "./lastSync";
import {
  challengeFromRemote,
  challengeToRemote,
  expenseFromRemote,
  expenseToRemote,
  potFromRemote,
  potToRemote,
} from "./converters";

// ---------------- pushes (local → cloud) ----------------

async function pushChallenge(id: string): Promise<void> {
  const rows = await db.select().from(challenges).where(eq(challenges.id, id));
  if (rows.length === 0) {
    await outbox.remove("challenges", id);
    return;
  }
  const { error } = await supabase.from("challenges").upsert(challengeToRemote(rows[0]));
  if (error) {
    if (__DEV__) console.warn("[sync] pushChallenge failed", id, error.message);
    return;
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

async function pushExpense(id: string): Promise<void> {
  const rows = await db.select().from(expenses).where(eq(expenses.id, id));
  if (rows.length === 0) {
    await outbox.remove("expenses", id);
    return;
  }
  const { error } = await supabase.from("expenses").upsert(expenseToRemote(rows[0]));
  if (error) {
    if (__DEV__) console.warn("[sync] pushExpense failed", id, error.message);
    return;
  }
  await outbox.remove("expenses", id);
}

export async function flushOutbox(): Promise<void> {
  const pending = await outbox.snapshot();
  for (const entry of pending) {
    if (entry.table === "challenges") await pushChallenge(entry.id);
    else if (entry.table === "pots") await pushPot(entry.id);
    else if (entry.table === "expenses") await pushExpense(entry.id);
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

async function pullExpenses(): Promise<void> {
  const since = await lastSync.getSince("expenses");
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .gt("updated_at", since)
    .order("updated_at", { ascending: true });
  if (error) {
    if (__DEV__) console.warn("[sync] pullExpenses failed", error.message);
    return;
  }
  if (!data || data.length === 0) return;
  for (const r of data) {
    const local = expenseFromRemote(r);
    await db
      .insert(expenses)
      .values(local)
      .onConflictDoUpdate({ target: expenses.id, set: local });
  }
  await lastSync.setSince("expenses", data[data.length - 1].updated_at);
}

// ---------------- public API ----------------

export async function syncAll(): Promise<void> {
  await flushOutbox();
  await pullChallenges();
  await pullPots();
  await pullExpenses();
}

export function enqueuePushChallenge(id: string): void {
  void outbox.enqueue("challenges", id).then(() => pushChallenge(id));
}

export function enqueuePushPot(id: string): void {
  void outbox.enqueue("pots", id).then(() => pushPot(id));
}

export function enqueuePushExpense(id: string): void {
  void outbox.enqueue("expenses", id).then(() => pushExpense(id));
}
