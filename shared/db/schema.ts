import { sqliteTable, text, real, index, uniqueIndex } from "drizzle-orm/sqlite-core";

// Local-first SQLite schema. Mirrors the Postgres schema in supabase/migrations/.
// SQLite has no native date or numeric types — dates are stored as ISO 8601 strings,
// money/amounts as REAL (float) since per-user budgets don't need DECIMAL precision.

export const challenges = sqliteTable(
  "challenges",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    totalBudget: real("total_budget").notNull(),
    startDate: text("start_date").notNull(),
    endDate: text("end_date").notNull(),
    minPerDay: real("min_per_day"),
    maxPerDay: real("max_per_day"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => ({
    userIdIdx: index("challenges_user_id_idx").on(t.userId),
  })
);

export const pots = sqliteTable(
  "pots",
  {
    id: text("id").primaryKey(),
    challengeId: text("challenge_id")
      .notNull()
      .references(() => challenges.id, { onDelete: "cascade" }),
    dayDate: text("day_date").notNull(),
    amount: real("amount").notNull(),
    openedAt: text("opened_at"),
    actualSpent: real("actual_spent"),
    status: text("status", { enum: ["met", "under", "over"] }),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => ({
    challengeIdIdx: index("pots_challenge_id_idx").on(t.challengeId),
    dayDateIdx: index("pots_day_date_idx").on(t.dayDate),
    challengeDayUnique: uniqueIndex("pots_challenge_day_unique").on(t.challengeId, t.dayDate),
  })
);

// Out-of-hand expenses: things the user had to pay for during a challenge
// (fuel, gifts, etc.) that don't count against the daily allowance / pot
// status. Independent ledger.
export const expenses = sqliteTable(
  "expenses",
  {
    id: text("id").primaryKey(),
    challengeId: text("challenge_id")
      .notNull()
      .references(() => challenges.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    amount: real("amount").notNull(),
    spentOn: text("spent_on"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => ({
    challengeIdIdx: index("expenses_challenge_id_idx").on(t.challengeId),
    spentOnIdx: index("expenses_spent_on_idx").on(t.spentOn),
  })
);

export type Challenge = typeof challenges.$inferSelect;
export type NewChallenge = typeof challenges.$inferInsert;
export type Pot = typeof pots.$inferSelect;
export type NewPot = typeof pots.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
