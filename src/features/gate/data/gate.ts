/**
 * AgentGate · gate domain types, category metadata and demo data.
 * All numbers mirror the approved design mock (Gate Overview, 12 repos).
 */

export type GateCategory = 'build' | 'ready' | 'merge' | 'daily' | 'release'
export type GateRunStatus = 'passed' | 'failed' | 'running'
/** Per-category health derived from pass rate thresholds. */
export type GateHealth = 'pass' | 'warn' | 'fail'

export interface RepoCategoryStat {
  category: GateCategory
  passRate7d: number
  avgDurationSec: number | null
  /** Canary-style runs still in progress → renders "2h 51m+". */
  ongoing?: boolean
  runs7d: number
  health: GateHealth
}

export interface GateRepo {
  id: string
  name: string
  owner: string
  /** Status of the repo's most recent gate run. */
  gateStatus: GateRunStatus
  /** UT coverage %, red below the 75% threshold. */
  coverage: number
  stats: RepoCategoryStat[]
}

export interface GateCategoryMeta {
  id: GateCategory
  description: string
  /** Pass-rate colorization thresholds, per the approved design. */
  warnBelow: number
  failBelow: number
}

export const GATE_CATEGORIES: GateCategoryMeta[] = [
  {
    id: 'build',
    description: 'Commit & PR Base Gate',
    warnBelow: 85,
    failBelow: 80,
  },
  { id: 'ready', description: 'PR Ready Gate', warnBelow: 90, failBelow: 80 },
  {
    id: 'merge',
    description: 'Post-Merge Integration',
    warnBelow: 90,
    failBelow: 80,
  },
  {
    id: 'daily',
    description: 'Nightly & Canary',
    warnBelow: 90,
    failBelow: 80,
  },
  {
    id: 'release',
    description: 'Release Candidate',
    warnBelow: 95,
    failBelow: 80,
  },
]

const CATEGORY_MAP = new Map(GATE_CATEGORIES.map((c) => [c.id, c]))

export function getCategoryMeta(category: GateCategory): GateCategoryMeta {
  const meta = CATEGORY_MAP.get(category)
  if (!meta) throw new Error(`Unknown gate category: ${category}`)
  return meta
}

export function passRateHealth(
  category: GateCategory,
  passRate: number
): GateHealth {
  const { warnBelow, failBelow } = getCategoryMeta(category)
  if (passRate < failBelow) return 'fail'
  if (passRate < warnBelow) return 'warn'
  return 'pass'
}

/** Count repos below the coverage gate threshold (75%). */
export const COVERAGE_THRESHOLD = 75

function stat(
  category: GateCategory,
  passRate7d: number,
  avgDurationSec: number | null,
  runs7d: number,
  ongoing?: boolean
): RepoCategoryStat {
  return {
    category,
    passRate7d,
    avgDurationSec,
    runs7d,
    ongoing,
    health: passRateHealth(category, passRate7d),
  }
}

/**
 * Monitored repositories. Gate numbers are design-mock placeholders until the
 * CI pipelines publish real gate results.
 */
export const GATE_REPOS: GateRepo[] = [
  {
    id: 'sciencediscovery',
    name: 'sciencediscovery',
    owner: 'openJiuwen-ai',
    gateStatus: 'failed',
    coverage: 71.2,
    stats: [
      stat('build', 96.2, 492, 342),
      stat('ready', 93.8, 1300, 298),
      stat('merge', 88.6, 1565, 164),
      stat('daily', 85.1, 10260, 32, true),
      stat('release', 100, 18720, 4),
    ],
  },
  {
    id: 'digitalmate',
    name: 'DigitalMate',
    owner: 'openJiuwen-ai',
    gateStatus: 'passed',
    coverage: 82.4,
    stats: [
      stat('build', 98.2, 460, 351),
      stat('ready', 96.5, 1220, 305),
      stat('merge', 91.2, 1490, 171),
      stat('daily', 88.4, 9800, 33),
      stat('release', 100, 17600, 5),
    ],
  },
]

export function countReposByStatus(repos: GateRepo[]) {
  const counts = { passed: 0, failed: 0, running: 0 }
  for (const repo of repos) counts[repo.gateStatus] += 1
  return counts
}
