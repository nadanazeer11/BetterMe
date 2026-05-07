// Shape converters between Drizzle (camelCase TS, SQLite types) and
// Supabase (snake_case TS, Postgres types). Both DBs use snake_case at the
// SQL column level, but the JS objects differ.
//
// One mapper per direction, per table — explicit and easy to audit.

import type {
  Challenge,
  Pot,
  Expense,
  NewChallenge,
  NewPot,
  NewExpense,
} from "@/shared/db/schema";
import type { Database } from "@/shared/db/database.types";

type ChallengeRow = Database["public"]["Tables"]["challenges"]["Row"];
type ChallengeInsert = Database["public"]["Tables"]["challenges"]["Insert"];
type PotRow = Database["public"]["Tables"]["pots"]["Row"];
type PotInsert = Database["public"]["Tables"]["pots"]["Insert"];

// Inline expense remote shape — switch to Database['public']['Tables']['expenses']
// after running `npm run db:sync` which regenerates database.types.ts.
type ExpenseRowRemote = {
  id: string;
  challenge_id: string;
  name: string;
  amount: number;
  spent_on: string | null;
  created_at: string;
  updated_at: string;
};
type ExpenseInsertRemote = {
  id: string;
  challenge_id: string;
  name: string;
  amount: number;
  spent_on?: string | null;
  created_at?: string;
  updated_at?: string;
};

// ---------------- challenges ----------------

export function challengeToRemote(c: Challenge): ChallengeInsert {
  return {
    id: c.id,
    user_id: c.userId,
    name: c.name,
    total_budget: c.totalBudget,
    start_date: c.startDate,
    end_date: c.endDate,
    min_per_day: c.minPerDay,
    max_per_day: c.maxPerDay,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  };
}

export function challengeFromRemote(r: ChallengeRow): NewChallenge {
  return {
    id: r.id,
    userId: r.user_id,
    name: r.name,
    totalBudget: r.total_budget,
    startDate: r.start_date,
    endDate: r.end_date,
    minPerDay: r.min_per_day,
    maxPerDay: r.max_per_day,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// ---------------- pots ----------------

export function potToRemote(p: Pot): PotInsert {
  return {
    id: p.id,
    challenge_id: p.challengeId,
    day_date: p.dayDate,
    amount: p.amount,
    opened_at: p.openedAt,
    actual_spent: p.actualSpent,
    status: p.status,
    updated_at: p.updatedAt,
  };
}

export function potFromRemote(r: PotRow): NewPot {
  return {
    id: r.id,
    challengeId: r.challenge_id,
    dayDate: r.day_date,
    amount: r.amount,
    openedAt: r.opened_at,
    actualSpent: r.actual_spent,
    status: r.status as Pot["status"],
    updatedAt: r.updated_at,
  };
}

// ---------------- expenses ----------------

export function expenseToRemote(e: Expense): ExpenseInsertRemote {
  return {
    id: e.id,
    challenge_id: e.challengeId,
    name: e.name,
    amount: e.amount,
    spent_on: e.spentOn,
    created_at: e.createdAt,
    updated_at: e.updatedAt,
  };
}

export function expenseFromRemote(r: ExpenseRowRemote): NewExpense {
  return {
    id: r.id,
    challengeId: r.challenge_id,
    name: r.name,
    amount: r.amount,
    spentOn: r.spent_on,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

