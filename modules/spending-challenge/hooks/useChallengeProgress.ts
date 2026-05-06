// Derived progress stats for a challenge. Computes:
//   - bloomed:     number of pots logged (any status)
//   - totalDays:   total pots in the challenge
//   - remaining:   totalDays - bloomed
//   - totalSpent:  sum of actual_spent for logged pots
//   - allocated:   sum of amount for logged pots (what was budgeted for those days)
//   - aheadBy:     allocated - totalSpent. Positive = under budget so far.
//
// Pure derivation on top of useChallenge + useChallengePots — no extra query.

import { useChallenge } from "./useChallenge";
import { useChallengePots } from "./useChallengePots";

export function useChallengeProgress(challengeId: string) {
  const challenge = useChallenge(challengeId);
  const pots = useChallengePots(challengeId);

  if (!challenge) return null;

  const totalDays = pots.length;
  const opened = pots.filter((p) => p.status != null);
  const bloomed = opened.length;
  const remaining = totalDays - bloomed;
  const totalSpent = opened.reduce((sum, p) => sum + (p.actualSpent ?? 0), 0);
  const allocated = opened.reduce((sum, p) => sum + p.amount, 0);
  const aheadBy = allocated - totalSpent;

  return {
    bloomed,
    totalDays,
    remaining,
    totalSpent,
    allocated,
    totalBudget: challenge.totalBudget,
    aheadBy,
  };
}
