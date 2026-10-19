import { useMemo } from 'react'
import { GATE_REPOS } from '@/features/gate/data/gate'
import { useGateRepos } from '@/features/gate/data/gate-api'
import { RepoGateTable } from '@/features/gate/overview/repo-gate-table'
import { useGateSearch } from '@/features/gate/stores/gate-search'
import { useLang } from '@/lib/i18n'

export function GateOverview() {
  const query = useGateSearch((s) => s.query)
  const { t } = useLang()
  const { data: collectedRepos } = useGateRepos()

  /** Collected datasets win; demo entries fill repositories without one. */
  const allRepos = useMemo(() => {
    const collected = collectedRepos ?? []
    const collectedIds = new Set(collected.map((repo) => repo.id))
    return [
      ...collected,
      ...GATE_REPOS.filter((r) => !collectedIds.has(r.id)).map((r) => ({
        ...r,
        demo: true,
      })),
    ]
  }, [collectedRepos])

  const visibleRepos = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allRepos
    return allRepos.filter((repo) =>
      `${repo.name} ${repo.owner}`.toLowerCase().includes(q)
    )
  }, [allRepos, query])

  return (
    <div className='flex flex-col gap-5'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight text-gate-ink'>
          {t('gate.title')}
        </h1>
        <p className='mt-1 text-sm text-gate-dim'>{t('gate.subtitle')}</p>
      </div>

      <RepoGateTable repos={visibleRepos} />
    </div>
  )
}
