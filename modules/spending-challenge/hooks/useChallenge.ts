// Live single challenge by id. Returns null while loading or if not found.

import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { eq } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { challenges } from "@/shared/db/schema";

export function useChallenge(id: string) {
  const { data } = useLiveQuery(
    db.select().from(challenges).where(eq(challenges.id, id)),
    [id]
  );
  return data?.[0] ?? null;
}
