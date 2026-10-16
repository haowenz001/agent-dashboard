import { useEffect } from 'react'
import { Check, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-provider'
import { useLang } from '@/lib/i18n'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const OPTIONS = [
  { value: 'light', labelKey: 'theme.light' },
  { value: 'dark', labelKey: 'theme.dark' },
  { value: 'system', labelKey: 'theme.system' },
] as const

/**
 * Light / dark / system theme switch for the gate shell, modeled on the
 * community-ecosystem monitor's sun-moon dropdown.
 */
export function GateThemeSwitch() {
  const { theme, setTheme } = useTheme()
  const { t } = useLang()

  useEffect(() => {
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f1420' : '#fff')
    }
  }, [theme])

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={t('theme.switch')}
        title={t('theme.switch')}
        className='flex size-9 items-center justify-center rounded-lg text-gate-dim outline-none hover:bg-gate-track hover:text-gate-ink focus-visible:ring-2 focus-visible:ring-gate-accent/30'
      >
        <Sun className='size-[18px] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90' />
        <Moon className='absolute size-[18px] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0' />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='min-w-32'>
        {OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setTheme(option.value)}
            className='text-[12px] font-medium'
          >
            {t(option.labelKey)}
            <Check
              size={14}
              className={cn('ms-auto', theme !== option.value && 'hidden')}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
