import { generateAmounts } from "../generateAmounts";

// Deterministic linear-congruential RNG so tests reproduce.
function lcg(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

const SUM_TOLERANCE = 0.011; // 1 cent of slack for float compare

describe("generateAmounts", () => {
  it("dayCount=1 returns [total]", () => {
    expect(generateAmounts({ total: 100, dayCount: 1 })).toEqual([100]);
  });

  it("returns dayCount items", () => {
    expect(generateAmounts({ total: 300, dayCount: 30 }).length).toBe(30);
  });

  it("sum equals total across 1000 seeds (no bounds)", () => {
    for (let seed = 1; seed <= 1000; seed++) {
      const amounts = generateAmounts({ total: 300, dayCount: 30, rng: lcg(seed) });
      const sum = amounts.reduce((a, b) => a + b, 0);
      expect(Math.abs(sum - 300)).toBeLessThan(SUM_TOLERANCE);
    }
  });

  it("sum equals total across 1000 seeds (with bounds)", () => {
    for (let seed = 1; seed <= 1000; seed++) {
      const amounts = generateAmounts({
        total: 300,
        dayCount: 30,
        min: 5,
        max: 20,
        rng: lcg(seed),
      });
      const sum = amounts.reduce((a, b) => a + b, 0);
      expect(Math.abs(sum - 300)).toBeLessThan(SUM_TOLERANCE);
    }
  });

  it("respects min and max bounds", () => {
    for (let seed = 1; seed <= 1000; seed++) {
      const amounts = generateAmounts({
        total: 300,
        dayCount: 30,
        min: 5,
        max: 20,
        rng: lcg(seed),
      });
      for (const a of amounts) {
        expect(a).toBeGreaterThanOrEqual(5);
        expect(a).toBeLessThanOrEqual(20);
      }
    }
  });

  it("produces variance (not all-equal) over many runs", () => {
    let varied = 0;
    for (let seed = 1; seed <= 100; seed++) {
      const amounts = generateAmounts({ total: 300, dayCount: 30, rng: lcg(seed) });
      const min = Math.min(...amounts);
      const max = Math.max(...amounts);
      if (max - min > 1) varied++;
    }
    // Out of 100 runs, the vast majority should have at least $1 spread
    expect(varied).toBeGreaterThan(95);
  });

  it("works when min equals max (all equal)", () => {
    const amounts = generateAmounts({
      total: 300,
      dayCount: 30,
      min: 10,
      max: 10,
      rng: lcg(42),
    });
    for (const a of amounts) expect(a).toBe(10);
  });

  it("throws when total is too small for min × days", () => {
    expect(() =>
      generateAmounts({ total: 100, dayCount: 5, min: 30 })
    ).toThrow(/less than min/);
  });

  it("throws when total is too large for max × days", () => {
    expect(() =>
      generateAmounts({ total: 100, dayCount: 5, max: 10 })
    ).toThrow(/greater than max/);
  });

  it("throws on min > max", () => {
    expect(() =>
      generateAmounts({ total: 100, dayCount: 5, min: 50, max: 10 })
    ).toThrow(/min cannot exceed max/);
  });

  it("throws on non-positive total", () => {
    expect(() => generateAmounts({ total: 0, dayCount: 5 })).toThrow();
    expect(() => generateAmounts({ total: -10, dayCount: 5 })).toThrow();
  });

  it("throws on non-positive dayCount", () => {
    expect(() => generateAmounts({ total: 100, dayCount: 0 })).toThrow();
    expect(() => generateAmounts({ total: 100, dayCount: -1 })).toThrow();
  });
});
