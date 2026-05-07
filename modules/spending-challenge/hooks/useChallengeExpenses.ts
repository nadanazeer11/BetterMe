// Live list of out-of-hand expenses for a challenge, newest first.

import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { desc, eq } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { expenses } from "@/shared/db/schema";

export function useChallengeExpenses(challengeId: string) {
  const { data } = useLiveQuery(
    db
      .select()
      .from(expenses)
      .where(eq(expenses.challengeId, challengeId))
      .orderBy(desc(expenses.spentOn), desc(expenses.createdAt)),
    [challengeId]
  );
  return data ?? [];
}
