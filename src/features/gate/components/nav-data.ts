import { Globe, ShieldCheck, type LucideIcon } from 'lucide-react'
import type { I18nKey } from '@/lib/i18n'

export interface GateNavItem {
  to: string
  labelKey: I18nKey
  icon: LucideIcon
}

/** Merged platform navigation: community overview + CI gate monitor. */
export const GATE_NAV_ITEMS: GateNavItem[] = [
  { to: '/', labelKey: 'nav.community', icon: Globe },
  { to: '/gate', labelKey: 'nav.ciGate', icon: ShieldCheck },
]
