// Returns the pot for today's date in a challenge, or null if today is
// outside the challenge's date range.

import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { and, eq } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { pots } from "@/shared/db/schema";
import { localISODate } from "../lib/dates";

export function useTodayPot(challengeId: string) {
  const today = localISODate();
  const { data } = useLiveQuery(
    db
      .select()
      .from(pots)
      .where(and(eq(pots.challengeId, challengeId), eq(pots.dayDate, today))),
    [challengeId, today]
  );
  return data?.[0] ?? null;
}
