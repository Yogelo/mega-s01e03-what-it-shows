// What went wrong in a merged ticket, one row per problem. Builds on causes.ts; pages explain it.

// Counted the desk's way: causes.ts places a report by tenant and channel, and a report is counted
// where it is filed. The desk reads some bodies differently (desk-notes.json): those describe a
// different problem, get a row of their own, and stay counted where they are filed too.
import { groupByCause, readAs, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day move';

export type ProblemRow = {
  problem: Problem | 'unplaced';
  reports: Report[];
  // Set on a row whose reports are also counted under another cause.
  filedUnder?: string;
  tenants: string[];
  channels: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
};

function rowOf(problem: ProblemRow['problem'], rs: Report[], filedUnder?: string): ProblemRow {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    reports: rs,
    filedUnder,
    tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
    channels: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {}),
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
  };
}

export function rowsIn(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { exported: number; unique: number; rows: ProblemRow[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const rows = groupByCause(merged, tenantOf).map((g) => rowOf(g.cause, g.reports));
  for (const g of groupByCause(merged, tenantOf)) {
    if (readAs(g, oneDayMove)) rows.push(rowOf('one-day move', g.reports.filter((r) => oneDayMove.includes(r.id)), g.cause));
  }
  return { exported: all.filter((r) => r.mergedInto === ticket).length, unique: merged.length, rows };
}
