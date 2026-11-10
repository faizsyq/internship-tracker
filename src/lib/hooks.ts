import { useCallback, useEffect, useRef, useState } from 'react'
import { THEME_KEY, safeGet, safeSet } from './storage'

export type ThemePref = 'system' | 'light' | 'dark'

export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(() => {
    const v = safeGet(THEME_KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  })

  useEffect(() => {
    safeSet(THEME_KEY, pref)
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = pref === 'dark' || (pref === 'system' && mq.matches)
      document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [pref])

  return [pref, setPref] as const
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatches(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return matches
}

export interface Toast {
  id: number
  message: string
  tone?: 'default' | 'error'
  action?: { label: string; onClick: () => void }
}

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)
  const timers = useRef(new Map<number, number>())

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id))
    const timer = timers.current.get(id)
    if (timer) window.clearTimeout(timer)
    timers.current.delete(id)
  }, [])

  const push = useCallback(
    (message: string, opts: Omit<Toast, 'id' | 'message'> = {}) => {
      const id = nextId.current++
      // Keep at most three on screen.
      setToasts((t) => [...t.slice(-2), { id, message, ...opts }])
      const ms = opts.action ? 6000 : 3200
      timers.current.set(id, window.setTimeout(() => dismiss(id), ms))
    },
    [dismiss],
  )

  return { toasts, push, dismiss }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return ok
    } catch {
      return false
    }
  }
}
