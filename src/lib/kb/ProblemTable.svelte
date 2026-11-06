<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { rowsIn, type Problem } from '#lib/kb/problems';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // issues: problem → link to the ticket filed for it.
  let { ticket, issues = {} }: { ticket: number; issues?: Partial<Record<Problem, string>> } = $props();

  const split = $derived(rowsIn(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const channels = (c: Record<string, number>) =>
    Object.entries(c)
      .sort((a, b) => b[1] - a[1])
      .map(([ch, n]) => `${ch} ×${n}`)
      .join(' · ');
  const issueOf = (p: string) => issues[p as Problem];
</script>

<p class="sum">
  <strong>{split.unique}</strong> reports merged into #{ticket}
  ({split.exported} rows in the export, {split.exported - split.unique} of them repeats) ·
  <strong>{split.rows.length}</strong>
  {split.rows.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>channels</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each split.rows as r (r.problem)}
      <tr>
        <td><code>{r.problem}</code></td>
        <td><strong>{r.reports.length}</strong></td>
        <td>{r.tenants.length}</td>
        <td class="muted">{channels(r.channels)}</td>
        <td>{r.firstSeen} → {r.lastSeen}</td>
        <td>{#if issueOf(r.problem)}<a href={issueOf(r.problem)}>{issueOf(r.problem)?.replace(/.*\/issues\//, '#')}</a>{:else}<span class="warn">none yet</span>{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each split.rows as r (r.problem)}
  <p class="muted"><code>{r.problem}</code>: {r.tenants.join(', ')}</p>
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .muted { color: var(--muted); font-size: 0.85em; }
  .warn { color: var(--warn); font-weight: 600; }
</style>
