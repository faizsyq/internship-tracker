import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronDown } from 'lucide-react'
import { STATUSES, type Status } from '../types'
import { STATUS_STYLE } from '../lib/status'

interface Props {
  value: Status
  company: string
  onChange: (s: Status) => void
  onOpenChange?: (open: boolean) => void
}

export function StatusMenu({ value, company, onChange, onOpenChange }: Props) {
  const [open, setOpenState] = useState(false)
  const [focusIdx, setFocusIdx] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const setOpen = (o: boolean) => {
    setOpenState(o)
    onOpenChange?.(o)
    if (o) setFocusIdx(STATUSES.indexOf(value))
  }

  useEffect(() => {
    if (!open) return
    itemRefs.current[focusIdx]?.focus()
  }, [open, focusIdx])

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const pick = (s: Status) => {
    setOpen(false)
    triggerRef.current?.focus()
    if (s !== value) onChange(s)
  }

  const onMenuKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusIdx((i) => (i + 1) % STATUSES.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusIdx((i) => (i - 1 + STATUSES.length) % STATUSES.length)
    } else if (e.key === 'Home') {
      e.preventDefault()
      setFocusIdx(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setFocusIdx(STATUSES.length - 1)
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault()
            setOpen(true)
          }
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Status: ${value}. Change status for ${company}`}
        className={`press inline-flex h-8 items-center gap-1.5 rounded-full pl-2.5 pr-2 text-xs font-semibold ${STATUS_STYLE[value].pill} hover:brightness-[0.97] dark:hover:brightness-110`}
      >
        <span className={`size-1.5 rounded-full ${STATUS_STYLE[value].dot}`} aria-hidden="true" />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ opacity: 0, y: 6, filter: 'blur(2px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
        <ChevronDown
          className={`size-3.5 opacity-70 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label={`Status for ${company}`}
            onKeyDown={onMenuKey}
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.1 } }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: 'top right' }}
            className="absolute right-0 top-[calc(100%+6px)] z-20 w-48 rounded-xl border border-line bg-surface p-1 shadow-[var(--shadow-pop)]"
          >
            {STATUSES.map((s, i) => (
              <button
                key={s}
                ref={(el) => {
                  itemRefs.current[i] = el
                }}
                role="menuitemradio"
                aria-checked={s === value}
                tabIndex={i === focusIdx ? 0 : -1}
                onClick={() => pick(s)}
                onMouseEnter={() => setFocusIdx(i)}
                className="flex h-11 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm text-ink outline-none focus-visible:bg-surface-2 hover:bg-surface-2 sm:h-9"
              >
                <span className={`size-2 rounded-full ${STATUS_STYLE[s].dot}`} aria-hidden="true" />
                <span className="flex-1">{s}</span>
                {s === value && <Check className="size-4 text-ink-2" strokeWidth={2} aria-hidden="true" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
