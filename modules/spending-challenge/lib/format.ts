// Money formatter. Currency is hardcoded to EGP for now — if/when we add a
// settings screen with a currency picker, plumb it through here.

export function formatMoney(n: number): string {
  return `EGP ${n.toFixed(2)}`;
}
