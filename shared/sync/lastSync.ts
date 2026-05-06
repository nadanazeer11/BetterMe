// Tracks the most recent `updated_at` we've seen per table during pulls.
// On the next pull, we ask Supabase for rows updated > this watermark, so we
// only fetch the delta. Stored per-device in AsyncStorage.

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SyncedTable } from "./outbox";

const keyFor = (table: SyncedTable) => `sync.lastSync.${table}.v1`;

const EPOCH = "1970-01-01T00:00:00.000Z";

export async function getSince(table: SyncedTable): Promise<string> {
  return (await AsyncStorage.getItem(keyFor(table))) ?? EPOCH;
}

export async function setSince(table: SyncedTable, isoTimestamp: string): Promise<void> {
  await AsyncStorage.setItem(keyFor(table), isoTimestamp);
}

export async function reset(table: SyncedTable): Promise<void> {
  await AsyncStorage.removeItem(keyFor(table));
}
