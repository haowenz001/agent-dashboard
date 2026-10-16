import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TONE_BAR, TONE_TEXT } from '@/features/gate/components/gate-styles'
import {
  COVERAGE_THRESHOLD,
  GATE_CATEGORIES,
  type GateRepo,
  type RepoCategoryStat,
} from '@/features/gate/data/gate'
import { formatPercent } from '@/features/gate/lib/format'
import { useLang, type I18nKey } from '@/lib/i18n'

/**
 * Flat gate overview table (spec v1.9): repository · build / ready / merge /
 * daily / release pass-rate columns (value + mini bar) · coverage.
 * Rows sort by clicking a column header (first click: desc for metrics,
 * asc for repository names); repositories without a category always sink.
 */
const COL_LABEL: Record<string, I18nKey> = {
  repo: 'gate.col.repo',
  build: 'gate.col.build',
  ready: 'gate.col.ready',
  merge: 'gate.col.merge',
  daily: 'gate.col.daily',
  release: 'gate.col.release',
  coverage: 'gate.col.coverage',
}

type SortKey =
  | 'repo'
  | 'build'
  | 'ready'
  | 'merge'
  | 'daily'
  | 'release'
  | 'coverage'
type SortDir = 'asc' | 'desc'

const ROW_COLS =
  'grid grid-cols-[minmax(220px,1fr)_repeat(5,140px)_140px] items-center gap-x-2.5'

/** Sort value per column; null sinks to the bottom in both directions. */
function sortValue(repo: GateRepo, key: SortKey): number | string | null {
  switch (key) {
    case 'repo':
      return repo.name
    case 'coverage':
      return repo.coverage
    default:
      return (
        repo.stats.find((s) => s.category === key)?.passRate7d ?? null
      )
  }
}

/** Value (56px) + rounded mini bar (70px) per category column. */
function RateCell({ stat }: { stat?: RepoCategoryStat }) {
  return (
    <div className='flex items-center gap-2.5'>
      <span
        className={cn(
          'w-14 shrink-0 text-sm font-medium tabular-nums',
          stat ? TONE_TEXT[stat.health] : 'text-gate-faint'
        )}
      >
        {stat ? formatPercent(stat.passRate7d) : '–'}
      </span>
      <span className='h-2 w-[70px] shrink-0 overflow-hidden rounded-full bg-gate-track'>
        {stat && (
          <span
            className={cn('block h-full rounded-full', TONE_BAR[stat.health])}
            style={{ width: `${stat.passRate7d}%` }}
          />
        )}
      </span>
    </div>
  )
}

function CoverageCell({ coverage }: { coverage: number }) {
  const low = coverage < COVERAGE_THRESHOLD
  return (
    <div className='flex items-center gap-2.5'>
      <span
        className={cn(
          'w-14 shrink-0 text-sm font-medium tabular-nums',
          low ? 'text-gate-fail' : 'text-gate-pass'
        )}
      >
        {formatPercent(coverage)}
      </span>
      <span className='h-2 w-[70px] shrink-0 overflow-hidden rounded-full bg-gate-track'>
        <span
          className={cn(
            'block h-full rounded-full',
            low ? 'bg-gate-fail' : 'bg-gate-pass'
          )}
          style={{ width: `${coverage}%` }}
        />
      </span>
    </div>
  )
}

function SortHeader({
  labelKey,
  active,
  dir,
  onClick,
}: {
  labelKey: I18nKey
  active: boolean
  dir: SortDir
  onClick: () => void
}) {
  const { t } = useLang()
  const label = t(labelKey)
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'group flex items-center gap-1 text-left text-xs font-semibold tracking-[0.04em] uppercase outline-none focus-visible:ring-2 focus-visible:ring-gate-accent/30',
        active ? 'text-gate-ink' : 'text-gate-faint hover:text-gate-dim'
      )}
    >
      {label}
      {active ? (
        dir === 'asc' ? (
          <ArrowUp className='size-3' />
        ) : (
          <ArrowDown className='size-3' />
        )
      ) : (
        <ArrowDown className='size-3 opacity-0 transition-opacity group-hover:opacity-40' />
      )}
    </button>
  )
}

export function RepoGateTable({
  repos,
  statusCounts,
}: {
  repos: GateRepo[]
  statusCounts: { passed: number; failed: number; running: number }
}) {
  const { t } = useLang()
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sortedRepos = useMemo(() => {
    if (!sortKey) return repos
    const sorted = [...repos].sort((a, b) => {
      const va = sortValue(a, sortKey)
      const vb = sortValue(b, sortKey)
      if (va == null && vb == null) return 0
      if (va == null) return 1
      if (vb == null) return -1
      if (typeof va === 'string' || typeof vb === 'string') {
        return String(va).localeCompare(String(vb))
      }
      return sortDir === 'asc' ? va - vb : vb - va
    })
    return sorted
  }, [repos, sortKey, sortDir])

  const onSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'repo' ? 'asc' : 'desc')
    }
  }

  return (
    <div className='overflow-hidden rounded-xl border border-gate-line bg-gate-card'>
      {/* Header */}
      <div className={cn(ROW_COLS, 'h-11 border-b border-gate-grid px-4')}>
        <SortHeader
          labelKey='gate.col.repo'
          active={sortKey === 'repo'}
          dir={sortDir}
          onClick={() => onSort('repo')}
        />
        {GATE_CATEGORIES.map((c) => (
          <SortHeader
            key={c.id}
            labelKey={COL_LABEL[c.id]}
            active={sortKey === c.id}
            dir={sortDir}
            onClick={() => onSort(c.id)}
          />
        ))}
        <SortHeader
          labelKey='gate.col.coverage'
          active={sortKey === 'coverage'}
          dir={sortDir}
          onClick={() => onSort('coverage')}
        />
      </div>

      {/* Rows */}
      {sortedRepos.map((repo) => (
        <div
          key={repo.id}
          className={cn(
            ROW_COLS,
            'h-12 border-b border-gate-grid px-4 transition-colors last:border-b-0 hover:bg-gate-subtle'
          )}
        >
          <div className='min-w-0'>
            <div className='truncate text-sm leading-5 font-semibold text-gate-ink'>
              {repo.name}
            </div>
            <div className='truncate text-xs leading-4 text-gate-dim'>
              {repo.owner}
            </div>
          </div>

          {GATE_CATEGORIES.map((c) => (
            <RateCell
              key={c.id}
              stat={repo.stats.find((s) => s.category === c.id)}
            />
          ))}

          <CoverageCell coverage={repo.coverage} />
        </div>
      ))}

      {/* Empty state */}
      {repos.length === 0 && (
        <div className='flex flex-col items-center gap-2 py-16'>
          <SearchX className='size-8 text-gate-faint' />
          <p className='text-sm text-gate-dim'>{t('gate.empty')}</p>
        </div>
      )}

      {/* Footer sync bar */}
      <div className='flex h-10 items-center justify-between border-t border-gate-grid px-4 text-xs text-gate-faint'>
        <span className='flex items-center gap-4'>
          <span className='flex items-center gap-1.5 text-gate-dim'>
            <span className='size-1.5 animate-pulse rounded-full bg-gate-pass' />
            {t('gate.live')}
          </span>
          <span>{t('gate.synced')}</span>
        </span>
        <span>
          {t('gate.summary', {
            total: repos.length,
            passed: statusCounts.passed,
            failed: statusCounts.failed,
            running: statusCounts.running,
          })}
        </span>
      </div>
    </div>
  )
}
