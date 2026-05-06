// Derives the visual/logical state of a pot from its row data. Used by the UI
// to pick the right illustration (closed / glowing / bloomed / wilted / …).
//
// State takes precedence over date: if the user has logged a result, that
// status drives the visual. Otherwise we compare the pot's day to today.

import type { Pot } from "@/shared/db/schema";
import { localISODate } from "./dates";

export type PotState = "future" | "today" | "missed" | "met" | "under" | "over";

export function potState(pot: Pot, todayISO: string = localISODate()): PotState {
  if (pot.status === "met") return "met";
  if (pot.status === "under") return "under";
  if (pot.status === "over") return "over";

  if (pot.dayDate === todayISO) return "today";
  if (pot.dayDate > todayISO) return "future";
  return "missed";
}
