// Public API of the spending-challenge module.
// Feature code (routes / components) should import only from here.

export { generateAmounts } from "./lib/generateAmounts";
export { potState, type PotState } from "./lib/potState";
export { localISODate, parseLocalISODate, eachDayBetween, dayCountBetween } from "./lib/dates";
export { formatMoney } from "./lib/format";

export {
  createChallenge,
  listChallenges,
  getChallenge,
  listPotsForChallenge,
  openPot,
  logPotResult,
  type CreateChallengeInput,
} from "./db/queries";

export { useChallenges } from "./hooks/useChallenges";
export { useChallenge } from "./hooks/useChallenge";
export { useChallengePots } from "./hooks/useChallengePots";
export { useChallengeProgress } from "./hooks/useChallengeProgress";
export { useTodayPot } from "./hooks/useTodayPot";

export type { Challenge, Pot, NewChallenge, NewPot } from "./types";
