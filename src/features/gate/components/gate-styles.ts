import type { GateCategory, GateHealth } from '@/features/gate/data/gate'

/** Tailwind class maps for gate status / category colors (see tokens in index.css). */

export const TONE_TEXT: Record<GateHealth, string> = {
  pass: 'text-gate-pass',
  warn: 'text-gate-warn',
  fail: 'text-gate-fail',
}

export const TONE_BAR: Record<GateHealth, string> = {
  pass: 'bg-gate-pass',
  warn: 'bg-gate-warn',
  fail: 'bg-gate-fail',
}

export const CATEGORY_DOT: Record<GateCategory, string> = {
  build: 'bg-gate-cat-build',
  ready: 'bg-gate-cat-ready',
  merge: 'bg-gate-cat-merge',
  daily: 'bg-gate-cat-daily',
  release: 'bg-gate-cat-release',
}
