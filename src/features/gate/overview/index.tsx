import { useMemo } from 'react'
import { GATE_REPOS } from '@/features/gate/data/gate'
import { deriveGateRepos, useGateDatasets } from '@/features/gate/data/gate-api'
import { RepoGateTable } from '@/features/gate/overview/repo-gate-table'
import { useGateSearch } from '@/features/gate/stores/gate-search'
import { useLang } from '@/lib/i18n'
import { GateWindowSelect } from '@/features/gate/components/gate-window-select'
import { useGateWindow } from '@/features/gate/stores/gate-window'

export function GateOverview() {
  const query = useGateSearch((s) => s.query)
  const { t } = useLang()
  const { data: datasets } = useGateDatasets()
  const windowDays = useGateWindow((s) => s.windowDays)

  /** Collected datasets win; demo entries fill repositories without one. */
  const allRepos = useMemo(() => {
    const collected = deriveGateRepos(datasets ?? [], windowDays)
    const collectedIds = new Set(collected.map((repo) => repo.id))
    return [
      ...collected,
      ...GATE_REPOS.filter((r) => !collectedIds.has(r.id)).map((r) => ({
        ...r,
        demo: true,
      })),
    ]
  }, [datasets, windowDays])

  const visibleRepos = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allRepos
    return allRepos.filter((repo) =>
      `${repo.name} ${repo.owner}`.toLowerCase().includes(q)
    )
  }, [allRepos, query])

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
        <h1 className='text-2xl font-bold tracking-tight text-gate-ink'>
          {t('gate.title')}
        </h1>
        <p className='text-sm text-gate-dim'>{t('gate.subtitle')}</p>
        <GateWindowSelect />
      </div>

      <RepoGateTable repos={visibleRepos} />
    </div>
  )
}
