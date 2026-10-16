import { useMemo } from 'react'
import { GATE_REPOS, countReposByStatus } from '@/features/gate/data/gate'
import { RepoGateTable } from '@/features/gate/overview/repo-gate-table'
import { useGateSearch } from '@/features/gate/stores/gate-search'
import { useLang } from '@/lib/i18n'

export function GateOverview() {
  const query = useGateSearch((s) => s.query)
  const { t } = useLang()

  const visibleRepos = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return GATE_REPOS
    return GATE_REPOS.filter((repo) =>
      `${repo.name} ${repo.owner}`.toLowerCase().includes(q)
    )
  }, [query])

  const visibleCounts = useMemo(
    () => countReposByStatus(visibleRepos),
    [visibleRepos]
  )

  return (
    <div className='flex flex-col gap-5'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight text-gate-ink'>
          {t('gate.title')}
        </h1>
        <p className='mt-1 text-sm text-gate-dim'>{t('gate.subtitle')}</p>
      </div>

      <RepoGateTable repos={visibleRepos} statusCounts={visibleCounts} />
    </div>
  )
}
