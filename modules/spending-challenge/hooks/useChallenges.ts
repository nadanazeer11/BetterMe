// Live list of all challenges owned by the signed-in user, newest first.
// Reactive: when sync layer or local mutations change rows, this re-fires.

import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { desc, eq } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { challenges } from "@/shared/db/schema";
import { useAuth } from "@/shared/auth/AuthProvider";

export function useChallenges() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const { data } = useLiveQuery(
    db
      .select()
      .from(challenges)
      .where(eq(challenges.userId, userId))
      .orderBy(desc(challenges.createdAt)),
    [userId]
  );
  return data;
}
