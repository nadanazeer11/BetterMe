// Outbox: a tiny AsyncStorage-backed queue of pending writes that need to be
// pushed to Supabase. We enqueue an entry on every local mutation; the sync
// orchestrator drains the queue when the app comes online / opens.
//
// Why AsyncStorage and not a SQLite table: the outbox is per-device transient
// state, not user data — we don't want it cluttering the synced schema, and
// AsyncStorage is more than fast enough for personal-scale usage.

import AsyncStorage from "@react-native-async-storage/async-storage";

export type SyncedTable = "challenges" | "pots";
export type OutboxEntry = { table: SyncedTable; id: string };

const KEY = "sync.outbox.v1";

async function read(): Promise<OutboxEntry[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as OutboxEntry[];
  } catch {
    return [];
  }
}

async function write(entries: OutboxEntry[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(entries));
}

export async function enqueue(table: SyncedTable, id: string): Promise<void> {
  const entries = await read();
  // De-dup: if we already have this row queued, keep only the latest enqueue.
  // A single push will pick up the row's current local state regardless.
  const without = entries.filter((e) => !(e.table === table && e.id === id));
  without.push({ table, id });
  await write(without);
}

export async function snapshot(): Promise<OutboxEntry[]> {
  return read();
}

export async function remove(table: SyncedTable, id: string): Promise<void> {
  const entries = await read();
  await write(entries.filter((e) => !(e.table === table && e.id === id)));
}

export async function clear(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
