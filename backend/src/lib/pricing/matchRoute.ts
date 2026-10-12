import type { EstimateInput, Route } from './types';

export const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\(.*?\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const score = (text: string, aliases: string[]) =>
  Math.max(0, ...aliases.map((a) => (text.includes(a) || a.includes(text) ? a.length : 0)));

export function matchRoute(routes: Route[], i: EstimateInput): Route | null {
  if (i.routeSlug && i.routeSlug !== 'custom') {
    const hit = routes.find((r) => r.slug === i.routeSlug && r.status === 'active');
    if (hit) return hit;
  }
  const p = norm(i.pickup);
  const d = norm(i.dropoff);

  let best: { r: Route; s: number } | null = null;
  for (const r of routes.filter((x) => x.status === 'active')) {
    const A = r.areas.originAliases.map(norm);
    const B = r.areas.destinationAliases.map(norm);
    const fwd = Math.min(score(p, A), score(d, B));
    const rev = Math.min(score(d, A), score(p, B));
    const s = Math.max(fwd, rev);
    if (s > 0 && (!best || s > best.s || (s === best.s && r.sortOrder < best.r.sortOrder))) {
      best = { r, s };
    }
  }
  return best?.r ?? null;
}
