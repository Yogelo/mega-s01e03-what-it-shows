// What went wrong in a merged ticket, one row per problem. Builds on causes.ts; pages explain it.

// causes.ts places a report by tenant and channel. The desk also reads some bodies differently
// (desk-notes.json): those reports describe a different problem and get a row of their own.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day move';

export type ProblemRow = {
  problem: Problem | 'unplaced';
  reports: Report[];
  tenants: string[];
  channels: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
};

export function rowsIn(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { exported: number; unique: number; rows: ProblemRow[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const byProblem = new Map<ProblemRow['problem'], Report[]>();
  for (const r of merged) {
    const p = oneDayMove.includes(r.id) ? 'one-day move' : (causeOf(r, tenantOf(r)) ?? 'unplaced');
    byProblem.set(p, [...(byProblem.get(p) ?? []), r]);
  }
  const rows = [...byProblem.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
        channels: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {}),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
  return { exported: all.filter((r) => r.mergedInto === ticket).length, unique: merged.length, rows };
}
