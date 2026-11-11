import checklist from '../data/checklistItems.json';
import extras from '../data/checklistExtras.json';
import { colors } from '../theme';

export const OPTIONS = [
  { label: 'Pass', color: colors.pass, points: 1 },
  { label: 'Warning', color: colors.warning, points: 0.5 },
  { label: 'Fail', color: colors.fail, points: 0 },
];

// Common mechanical checks + a section that depends on Used / Reconditioned
export const getChecklist = (condition) => [...checklist, ...(extras[condition] || [])];
export const getItems = (condition) =>
  getChecklist(condition).flatMap((s) => s.items.map((i) => ({ ...i, category: s.category })));
export const totalItems = (condition) => getItems(condition).length;

// Every known section/item (used to display saved reports of any type)
export const ALL_SECTIONS = [...checklist, ...extras.Used, ...extras.Reconditioned];
export const ALL_ITEMS = ALL_SECTIONS.flatMap((s) =>
  s.items.map((i) => ({ ...i, category: s.category }))
);

export function computeScore(results, condition) {
  const pts = Object.values(results).reduce(
    (sum, r) => sum + (OPTIONS.find((o) => o.label === r)?.points ?? 0),
    0
  );
  return Math.round((pts / totalItems(condition)) * 100);
}

export function scoreColor(score) {
  if (score >= 75) return colors.pass;
  if (score >= 50) return colors.warning;
  return colors.fail;
}

export function verdict(score) {
  if (score >= 85) return 'Excellent condition';
  if (score >= 70) return 'Good, minor issues only';
  if (score >= 50) return 'Fair: check the issues and negotiate';
  return 'Poor: major concerns found';
}

export function countStatus(results, status) {
  return Object.values(results).filter((r) => r === status).length;
}
