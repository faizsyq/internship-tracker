import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Download, HardDrive, Monitor, Moon, Plus, Sun, Upload } from 'lucide-react'
import type { ThemePref } from '../lib/hooks'
import { btn } from './ui'

interface Props {
  theme: ThemePref
  onTheme: (t: ThemePref) => void
  onAdd: () => void
  onExport: () => void
  onImport: () => void
}

const THEMES: { value: ThemePref; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light theme', Icon: Sun },
  { value: 'dark', label: 'Dark theme', Icon: Moon },
  { value: 'system', label: 'Match system theme', Icon: Monitor },
]

export function Header({ theme, onTheme, onAdd, onExport, onImport }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur-md supports-[backdrop-filter]:bg-bg/80">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-2 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <Mark />
          <span className="truncate text-[15px] font-semibold tracking-[-0.01em]">
            <span className="sm:hidden">Internships</span>
            <span className="hidden sm:inline">Internship Tracker</span>
          </span>
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <div
            role="radiogroup"
            aria-label="Colour theme"
            className="hidden items-center rounded-lg border border-line bg-surface p-0.5 sm:flex"
          >
            {THEMES.map(({ value, label, Icon }) => (
              <button
                key={value}
                role="radio"
                aria-checked={theme === value}
                aria-label={label}
                title={label}
                onClick={() => onTheme(value)}
                className={`press grid size-8 place-items-center rounded-md ${
                  theme === value ? 'bg-surface-2 text-ink' : 'text-muted hover:text-ink'
                }`}
              >
                <Icon className="size-4" strokeWidth={1.75} />
              </button>
            ))}
          </div>

          <MobileThemeButton theme={theme} onTheme={onTheme} />
          <DataMenu onExport={onExport} onImport={onImport} />

          <button onClick={onAdd} className={`${btn.primary} pl-3 sm:pl-3.5`}>
            <Plus className="size-4" strokeWidth={2} />
            <span className="sm:hidden">Add</span>
            <span className="hidden sm:inline">Add application</span>
          </button>
        </div>
      </div>
    </header>
  )
}

function MobileThemeButton({ theme, onTheme }: { theme: ThemePref; onTheme: (t: ThemePref) => void }) {
  const i = THEMES.findIndex((t) => t.value === theme)
  const current = THEMES[i]
  const next = THEMES[(i + 1) % THEMES.length]
  return (
    <button
      onClick={() => onTheme(next.value)}
      aria-label={`${current.label}. Switch to ${next.label.toLowerCase()}`}
      className={`${btn.icon} sm:hidden`}
    >
      <current.Icon className="size-[18px]" strokeWidth={1.75} />
    </button>
  )
}

function DataMenu({ onExport, onImport }: { onExport: () => void; onImport: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const choose = (fn: () => void) => {
    setOpen(false)
    fn()
  }

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Backup and restore"
        title="Backup and restore"
        className={btn.icon}
      >
        <HardDrive className="size-[18px]" strokeWidth={1.75} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.1 } }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: 'top right' }}
            className="absolute right-0 top-[calc(100%+6px)] z-40 w-60 rounded-xl border border-line bg-surface p-1 shadow-[var(--shadow-pop)]"
          >
            <MenuItem icon={<Download className="size-4" strokeWidth={1.75} />} onClick={() => choose(onExport)}>
              Export backup (JSON)
            </MenuItem>
            <MenuItem icon={<Upload className="size-4" strokeWidth={1.75} />} onClick={() => choose(onImport)}>
              Import backup
            </MenuItem>
            <p className="px-3 pb-2 pt-1.5 text-xs leading-snug text-muted">
              Your data stays in this browser. Export to move it to another device.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MenuItem({ icon, children, onClick }: { icon: React.ReactNode; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      autoFocus={false}
      className="press flex h-11 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm text-ink hover:bg-surface-2 focus-visible:bg-surface-2 sm:h-10"
    >
      <span className="text-muted">{icon}</span>
      {children}
    </button>
  )
}

function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="size-7 shrink-0" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="var(--ink)" />
      <rect x="7" y="9" width="18" height="3" rx="1.5" fill="var(--bg)" />
      <rect x="7" y="14.5" width="12" height="3" rx="1.5" fill="var(--bg)" opacity=".7" />
      <rect x="7" y="20" width="7" height="3" rx="1.5" fill="var(--st-interview)" />
    </svg>
  )
}
