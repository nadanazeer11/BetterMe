import { potState } from "../potState";
import type { Pot } from "@/shared/db/schema";

const basePot = (overrides: Partial<Pot>): Pot => ({
  id: "p1",
  challengeId: "c1",
  dayDate: "2026-05-10",
  amount: 10,
  openedAt: null,
  actualSpent: null,
  status: null,
  updatedAt: "2026-05-10T00:00:00Z",
  ...overrides,
});

describe("potState", () => {
  it("returns 'today' when day matches today", () => {
    expect(potState(basePot({ dayDate: "2026-05-10" }), "2026-05-10")).toBe("today");
  });

  it("returns 'future' for a day after today", () => {
    expect(potState(basePot({ dayDate: "2026-05-15" }), "2026-05-10")).toBe("future");
  });

  it("returns 'missed' for an unopened past day", () => {
    expect(potState(basePot({ dayDate: "2026-05-05" }), "2026-05-10")).toBe("missed");
  });

  it("returns 'met' when status='met' regardless of date", () => {
    expect(
      potState(basePot({ dayDate: "2026-05-15", status: "met" }), "2026-05-10")
    ).toBe("met");
  });

  it("returns 'under' when status='under'", () => {
    expect(
      potState(basePot({ dayDate: "2026-05-05", status: "under" }), "2026-05-10")
    ).toBe("under");
  });

  it("returns 'over' when status='over'", () => {
    expect(
      potState(basePot({ dayDate: "2026-05-05", status: "over" }), "2026-05-10")
    ).toBe("over");
  });
});
