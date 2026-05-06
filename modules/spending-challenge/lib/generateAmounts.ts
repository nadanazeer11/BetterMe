// generateAmounts: split a total budget across N days as a list of varied
// daily amounts that sum exactly to the total and respect optional min/max
// per-day bounds.
//
// Algorithm — "even split + zero-sum pair swaps":
//   1. Start with the even split in cents (rounding leftover spread across
//      the first few days). Sum is exact by construction.
//   2. Iterate: pick two random day indices, transfer a random number of
//      cents from one to the other while respecting bounds. This keeps the
//      sum unchanged and the bounds satisfied at every step.
//
// We work in integer cents throughout so the sum is exact (no float drift),
// then divide by 100 at the boundary. This is why amounts always sum to the
// requested total — not "approximately equal", actually equal.

export type GenerateAmountsOpts = {
  total: number;
  dayCount: number;
  min?: number;
  max?: number;
  rng?: () => number;
};

export function generateAmounts(opts: GenerateAmountsOpts): number[] {
  const { total, dayCount, min: minOpt, max: maxOpt, rng = Math.random } = opts;

  if (!Number.isFinite(total) || total <= 0) {
    throw new Error("generateAmounts: total must be a positive finite number");
  }
  if (!Number.isInteger(dayCount) || dayCount < 1) {
    throw new Error("generateAmounts: dayCount must be a positive integer");
  }

  const totalC = Math.round(total * 100);
  const minC = minOpt != null ? Math.round(minOpt * 100) : 0;
  const maxC = maxOpt != null ? Math.round(maxOpt * 100) : totalC;
  if (minC > maxC) {
    throw new Error("generateAmounts: min cannot exceed max");
  }
  if (totalC < minC * dayCount) {
    throw new Error(
      `generateAmounts: total (${total}) is less than min (${minOpt}) × days (${dayCount})`
    );
  }
  if (totalC > maxC * dayCount) {
    throw new Error(
      `generateAmounts: total (${total}) is greater than max (${maxOpt}) × days (${dayCount})`
    );
  }

  // Even split as a starting point, with rounding leftover spread across the
  // first `leftover` days so the cents sum is exact.
  const baseC = Math.floor(totalC / dayCount);
  const leftover = totalC - baseC * dayCount;
  const cents = new Array<number>(dayCount).fill(baseC);
  for (let i = 0; i < leftover; i++) cents[i] += 1;

  // Random pair-swap variance. The sum is preserved by construction; bounds
  // are respected by clamping the transfer amount per swap.
  const iterations = dayCount * 12;
  for (let iter = 0; iter < iterations; iter++) {
    const i = Math.floor(rng() * dayCount);
    let j = Math.floor(rng() * dayCount);
    if (i === j) j = (j + 1) % dayCount;

    const giverRoom = cents[i] - minC; // how many cents i can give
    const recvRoom = maxC - cents[j]; // how many cents j can accept
    const maxTransfer = Math.min(giverRoom, recvRoom);
    if (maxTransfer <= 0) continue;

    const transfer = Math.floor(rng() * maxTransfer) + 1;
    cents[i] -= transfer;
    cents[j] += transfer;
  }

  return cents.map((c) => c / 100);
}
