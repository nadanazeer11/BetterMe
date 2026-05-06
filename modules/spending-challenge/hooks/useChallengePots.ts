// Live list of pots for a challenge, ordered by day.

import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { asc, eq } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { pots } from "@/shared/db/schema";

export function useChallengePots(challengeId: string) {
  const { data } = useLiveQuery(
    db
      .select()
      .from(pots)
      .where(eq(pots.challengeId, challengeId))
      .orderBy(asc(pots.dayDate)),
    [challengeId]
  );
  return data ?? [];
}
