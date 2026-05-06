// Calendar-date helpers. We treat dates as YYYY-MM-DD strings throughout
// (no time component), comparing in the user's local timezone. This avoids
// the classic "off-by-one-day" timezone bugs that come from using Date objects.

export function localISODate(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Parses YYYY-MM-DD as a local-time Date at 00:00 (avoiding UTC parsing surprises).
export function parseLocalISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function eachDayBetween(startISO: string, endISO: string): string[] {
  const start = parseLocalISODate(startISO);
  const end = parseLocalISODate(endISO);
  const out: string[] = [];
  const cursor = new Date(start);
  while (cursor.getTime() <= end.getTime()) {
    out.push(localISODate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

export function dayCountBetween(startISO: string, endISO: string): number {
  const start = parseLocalISODate(startISO);
  const end = parseLocalISODate(endISO);
  const ms = end.getTime() - start.getTime();
  return Math.round(ms / 86400000) + 1; // inclusive
}
