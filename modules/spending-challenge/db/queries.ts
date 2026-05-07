// Database queries for the spending-challenge module.
//
// Pattern: every mutation writes to local SQLite first (instant feel), then
// calls the matching enqueuePush*() from the sync layer to propagate to
// Supabase in the background. Never query Supabase directly here — reads
// come from local, sync keeps it fresh.

import * as Crypto from "expo-crypto";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/shared/db/client";
import {
  challenges,
  expenses,
  pots,
  type Challenge,
  type Expense,
  type NewChallenge,
  type NewExpense,
  type NewPot,
  type Pot,
} from "@/shared/db/schema";
import {
  enqueuePushChallenge,
  enqueuePushExpense,
  enqueuePushPot,
} from "@/shared/sync";
import { generateAmounts } from "../lib/generateAmounts";
import { eachDayBetween } from "../lib/dates";

// ---------------- create ----------------

export type CreateChallengeInput = {
  userId: string;
  name: string;
  totalBudget: number;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  minPerDay?: number | null;
  maxPerDay?: number | null;
};

export async function createChallenge(input: CreateChallengeInput): Promise<{
  challenge: Challenge;
  pots: Pot[];
}> {
  const challengeId = Crypto.randomUUID();
  const now = new Date().toISOString();
  const days = eachDayBetween(input.startDate, input.endDate);

  const amounts = generateAmounts({
    total: input.totalBudget,
    dayCount: days.length,
    min: input.minPerDay ?? undefined,
    max: input.maxPerDay ?? undefined,
  });

  const challengeRow: NewChallenge = {
    id: challengeId,
    userId: input.userId,
    name: input.name,
    totalBudget: input.totalBudget,
    startDate: input.startDate,
    endDate: input.endDate,
    minPerDay: input.minPerDay ?? null,
    maxPerDay: input.maxPerDay ?? null,
    createdAt: now,
    updatedAt: now,
  };

  const potRows: NewPot[] = days.map((day, i) => ({
    id: Crypto.randomUUID(),
    challengeId,
    dayDate: day,
    amount: amounts[i],
    openedAt: null,
    actualSpent: null,
    status: null,
    updatedAt: now,
  }));

  await db.transaction(async (tx) => {
    await tx.insert(challenges).values(challengeRow);
    await tx.insert(pots).values(potRows);
  });

  enqueuePushChallenge(challengeId);
  for (const p of potRows) enqueuePushPot(p.id);

  return {
    challenge: challengeRow as Challenge,
    pots: potRows as Pot[],
  };
}

// ---------------- read ----------------

export async function listChallenges(userId: string): Promise<Challenge[]> {
  return db
    .select()
    .from(challenges)
    .where(eq(challenges.userId, userId))
    .orderBy(desc(challenges.createdAt));
}

export async function getChallenge(id: string): Promise<Challenge | null> {
  const rows = await db.select().from(challenges).where(eq(challenges.id, id));
  return rows[0] ?? null;
}

export async function listPotsForChallenge(challengeId: string): Promise<Pot[]> {
  return db
    .select()
    .from(pots)
    .where(eq(pots.challengeId, challengeId))
    .orderBy(asc(pots.dayDate));
}

// ---------------- mutate pots ----------------

// Marks a pot as opened (revealing the amount to the user). Idempotent —
// calling twice doesn't reset openedAt.
export async function openPot(potId: string): Promise<void> {
  const now = new Date().toISOString();
  const existing = await db.select().from(pots).where(eq(pots.id, potId));
  if (existing.length === 0) throw new Error(`openPot: pot ${potId} not found`);
  if (existing[0].openedAt) return;

  await db
    .update(pots)
    .set({ openedAt: now, updatedAt: now })
    .where(eq(pots.id, potId));

  enqueuePushPot(potId);
}

// Logs the day's outcome. actualSpent vs the assigned amount derives the
// status (met/under/over). Re-loggable — overwrites prior result if user
// corrects themselves.
export async function logPotResult(input: {
  potId: string;
  actualSpent: number;
}): Promise<void> {
  const rows = await db.select().from(pots).where(eq(pots.id, input.potId));
  if (rows.length === 0) throw new Error(`logPotResult: pot ${input.potId} not found`);
  const pot = rows[0];
  const now = new Date().toISOString();

  let status: Pot["status"];
  if (input.actualSpent < pot.amount) status = "under";
  else if (input.actualSpent > pot.amount) status = "over";
  else status = "met";

  await db
    .update(pots)
    .set({
      actualSpent: input.actualSpent,
      status,
      openedAt: pot.openedAt ?? now,
      updatedAt: now,
    })
    .where(eq(pots.id, input.potId));

  enqueuePushPot(input.potId);
}

// ---------------- expenses ----------------

export type CreateExpenseInput = {
  challengeId: string;
  name: string;
  amount: number;
  spentOn?: string | null; // YYYY-MM-DD
};

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const id = Crypto.randomUUID();
  const now = new Date().toISOString();
  const row: NewExpense = {
    id,
    challengeId: input.challengeId,
    name: input.name,
    amount: input.amount,
    spentOn: input.spentOn ?? null,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(expenses).values(row);
  enqueuePushExpense(id);
  return row as Expense;
}

export async function listExpensesForChallenge(challengeId: string): Promise<Expense[]> {
  return db
    .select()
    .from(expenses)
    .where(eq(expenses.challengeId, challengeId))
    .orderBy(desc(expenses.spentOn), desc(expenses.createdAt));
}

export async function updateExpense(input: {
  id: string;
  name?: string;
  amount?: number;
  spentOn?: string | null;
}): Promise<void> {
  const now = new Date().toISOString();
  const patch: Partial<NewExpense> = { updatedAt: now };
  if (input.name !== undefined) patch.name = input.name;
  if (input.amount !== undefined) patch.amount = input.amount;
  if (input.spentOn !== undefined) patch.spentOn = input.spentOn;
  await db.update(expenses).set(patch).where(eq(expenses.id, input.id));
  enqueuePushExpense(input.id);
}
