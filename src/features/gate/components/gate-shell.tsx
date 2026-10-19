import { Outlet } from '@tanstack/react-router'
import { Bell, ChevronDown, Search, ShieldCheck } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { NavGroup } from '@/components/layout/nav-group'
import { TeamSwitcher } from '@/components/layout/team-switcher'
import { LayoutProvider, useLayout } from '@/context/layout-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GATE_NAV_ITEMS } from '@/features/gate/components/nav-data'
import { GateThemeSwitch } from '@/features/gate/components/gate-theme-switch'
import { GateLanguageSwitch } from '@/features/gate/components/gate-language-switch'
import { useGateSearch } from '@/features/gate/stores/gate-search'
import { useGateWindow, WINDOW_OPTIONS } from '@/features/gate/stores/gate-window'
import { useLang } from '@/lib/i18n'



/**
 * Merged app shell, modeled on the community-ecosystem monitor: shadcn
 * sidebar (inset variant, icon collapse) + topbar with theme & language
 * switches. The page heading is rendered by each page.
 */
export function GateShell() {
  return (
    <LayoutProvider>
      <SidebarProvider>
        <GateSidebar />
        <SidebarInset>
          <GateTopbar />
          <main className='mx-auto w-full max-w-7xl flex-1 px-6 py-6'>
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </LayoutProvider>
  )
}

/** Sidebar with the platform brand + the two monitor sections. */
function GateSidebar() {
  const { collapsible, variant } = useLayout()
  const { t } = useLang()

  const teams = [
    {
      name: 'Agent Dashboard',
      logo: ShieldCheck,
      plan: t('app.tagline'),
    },
  ]
  const items = GATE_NAV_ITEMS.map((item) => ({
    title: t(item.labelKey),
    url: item.to,
    icon: item.icon,
  }))

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavGroup title='' items={items} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

function GateTopbar() {
  const query = useGateSearch((s) => s.query)
  const setQuery = useGateSearch((s) => s.setQuery)
  const { t } = useLang()
  const windowDays = useGateWindow((s) => s.windowDays)
  const setWindowDays = useGateWindow((s) => s.setWindowDays)

  return (
    <header className='sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2.5 border-b border-gate-line/50 bg-gate-canvas/85 px-4 backdrop-blur'>
      <SidebarTrigger variant='outline' />
      <Separator orientation='vertical' className='!h-6' />

      <div className='relative mr-auto hidden md:block'>
        <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gate-faint' />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search.placeholder')}
          className='h-9 w-[280px] rounded-lg bg-gate-track pr-3 pl-9 text-[12px] text-gate-ink outline-none placeholder:text-gate-faint focus:ring-2 focus:ring-gate-accent/30'
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className='flex h-9 items-center gap-1.5 rounded-lg border border-gate-line bg-gate-card px-3 text-[12px] font-medium text-gate-ink outline-none focus-visible:ring-2 focus-visible:ring-gate-accent/30'>
          {t(
            WINDOW_OPTIONS.find((o) => o.days === windowDays)?.labelKey ??
              'timeRange.7d'
          )}
          <ChevronDown className='size-3.5 text-gate-faint' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='min-w-36'>
          {WINDOW_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.days}
              onClick={() => setWindowDays(option.days)}
              className='text-[12px]'
            >
              {t(option.labelKey)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <GateLanguageSwitch />
      <GateThemeSwitch />

      <button
        type='button'
        aria-label={t('notify.label')}
        className='relative flex size-9 items-center justify-center rounded-lg text-gate-dim hover:bg-gate-track'
      >
        <Bell className='size-[18px]' />
        <span className='absolute top-1.5 right-1.5 size-1.5 rounded-full bg-gate-fail' />
      </button>

      <div className='flex size-8 items-center justify-center rounded-full bg-gate-accent text-[13px] font-semibold text-white'>
        H
      </div>
    </header>
  )
}
