import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { Search, X } from 'lucide-react'
import { ACTIVE_STATUSES, SORT_LABELS, STATUSES, type Application, type SortKey, type Status } from './types'
import { daysUntil, todayISO } from './lib/format'
import { hasSeeded, loadApplications, markSeeded, newId, normalize, saveApplications } from './lib/storage'
import { sampleApplications } from './lib/sample'
import { useTheme, useToasts } from './lib/hooks'
import { Header } from './components/Header'
import { Pipeline } from './components/Pipeline'
import { FollowUps, type DueItem } from './components/FollowUps'
import { AppCard } from './components/AppCard'
import { EditDialog, type Draft } from './components/EditDialog'
import { Toasts } from './components/Toasts'
import { EmptyState, NoResults } from './components/EmptyState'
import { btn } from './components/ui'

function initialApps(): { apps: Application[]; seeded: boolean } {
  const saved = loadApplications()
  if (saved !== null) return { apps: saved, seeded: false }
  if (hasSeeded()) return { apps: [], seeded: false }
  return { apps: sampleApplications(), seeded: true }
}

export default function App() {
  const [init] = useState(initialApps)
  const [apps, setApps] = useState<Application[]>(init.apps)
  const [filter, setFilter] = useState<Status | null>(null)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('followUp')
  const [dialog, setDialog] = useState<{ open: boolean; editing: Application | null }>({ open: false, editing: null })
  const [theme, setTheme] = useTheme()
  const { toasts, push, dismiss } = useToasts()
  const fileRef = useRef<HTMLInputElement>(null)
  const saveWarned = useRef(false)

  useEffect(() => {
    if (init.seeded) markSeeded()
  }, [init.seeded])

  useEffect(() => {
    const ok = saveApplications(apps)
    if (!ok && !saveWarned.current) {
      saveWarned.current = true
      push('Could not save to this browser. Storage may be full or blocked. Export a backup.', { tone: 'error' })
    }
    if (ok) saveWarned.current = false
  }, [apps, push])

  // ---------- Derived ----------
  const counts = useMemo(() => {
    const c = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<Status, number>
    for (const a of apps) c[a.status]++
    return c
  }, [apps])

  const due: DueItem[] = useMemo(
    () =>
      apps
        .filter((a) => ACTIVE_STATUSES.includes(a.status) && a.followUp)
        .map((a) => ({ app: a, days: daysUntil(a.followUp)! }))
        .filter((d) => d.days !== null && d.days <= 7)
        .sort((a, b) => a.days - b.days || a.app.company.localeCompare(b.app.company)),
    [apps],
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = apps.filter((a) => {
      if (filter && a.status !== filter) return false
      if (!q) return true
      return [a.company, a.role, a.location, a.contact.name, a.contact.position, a.contact.email, a.notes]
        .join(' \u0000 ')
        .toLowerCase()
        .includes(q)
    })
    const byText = (a: Application, b: Application) => a.company.localeCompare(b.company, 'en', { sensitivity: 'base' })
    const emptyLast = (x: string, y: string) => (x && !y ? -1 : !x && y ? 1 : 0)
    return list.sort((a, b) => {
      switch (sort) {
        case 'followUp': {
          const ia = ACTIVE_STATUSES.includes(a.status) ? 0 : 1
          const ib = ACTIVE_STATUSES.includes(b.status) ? 0 : 1
          return ia - ib || emptyLast(a.followUp, b.followUp) || a.followUp.localeCompare(b.followUp) || byText(a, b)
        }
        case 'applied':
          return emptyLast(a.dateApplied, b.dateApplied) || b.dateApplied.localeCompare(a.dateApplied) || byText(a, b)
        case 'company':
          return byText(a, b)
        case 'allowance':
          return (b.allowance ?? -1) - (a.allowance ?? -1) || byText(a, b)
      }
    })
  }, [apps, filter, query, sort])

  const exampleCount = apps.filter((a) => a.example).length

  // ---------- Actions ----------
  const openNew = useCallback(() => setDialog({ open: true, editing: null }), [])
  const openEdit = useCallback((a: Application) => setDialog({ open: true, editing: a }), [])
  const closeDialog = useCallback(() => setDialog((d) => ({ ...d, open: false })), [])

  const save = (draft: Draft) => {
    const now = Date.now()
    if (dialog.editing) {
      const id = dialog.editing.id
      setApps((list) => list.map((a) => (a.id === id ? { ...a, ...draft, example: undefined, updatedAt: now } : a)))
      push(`Saved ${draft.company}`)
    } else {
      setApps((list) => [{ ...draft, id: newId(), createdAt: now, updatedAt: now }, ...list])
      push(`Added ${draft.company}`)
    }
    closeDialog()
  }

  const changeStatus = (app: Application, status: Status) => {
    setApps((list) =>
      list.map((a) =>
        a.id === app.id
          ? {
              ...a,
              status,
              // Moving off the wishlist means it was just sent.
              dateApplied: a.dateApplied || (a.status === 'Wishlist' && status !== 'Wishlist' ? todayISO() : ''),
              updatedAt: Date.now(),
            }
          : a,
      ),
    )
    push(`Moved ${app.company} to ${status}`)
  }

  const remove = (app: Application) => {
    let index = -1
    setApps((list) => {
      index = list.findIndex((a) => a.id === app.id)
      return list.filter((a) => a.id !== app.id)
    })
    push(`Deleted ${app.company}`, {
      action: {
        label: 'Undo',
        onClick: () =>
          setApps((list) => {
            if (list.some((a) => a.id === app.id)) return list
            const next = [...list]
            next.splice(index < 0 ? 0 : Math.min(index, next.length), 0, app)
            return next
          }),
      },
    })
  }

  const removeExamples = () => {
    const examples = apps.filter((a) => a.example)
    setApps((list) => list.filter((a) => !a.example))
    push(`Removed ${examples.length} ${examples.length === 1 ? 'example' : 'examples'}`, {
      action: { label: 'Undo', onClick: () => setApps((list) => [...list, ...examples]) },
    })
  }

  const exportData = () => {
    try {
      const payload = { app: 'internship-tracker', version: 1, exportedAt: new Date().toISOString(), applications: apps }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `internship-tracker-${todayISO()}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      push(`Exported ${apps.length} ${apps.length === 1 ? 'application' : 'applications'}`)
    } catch {
      push('Export failed. Try again in another browser.', { tone: 'error' })
    }
  }

  const importFile = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text())
      const raw = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === 'object' && Array.isArray((parsed as { applications?: unknown }).applications)
          ? (parsed as { applications: unknown[] }).applications
          : null
      if (!raw) throw new Error('shape')
      const incoming = raw.map(normalize).filter((a): a is Application => a !== null)
      if (incoming.length === 0) {
        push('That file has no applications in it.', { tone: 'error' })
        return
      }
      setApps((list) => {
        const map = new Map(list.map((a) => [a.id, a]))
        for (const a of incoming) map.set(a.id, a)
        return Array.from(map.values())
      })
      setFilter(null)
      setQuery('')
      push(`Imported ${incoming.length} ${incoming.length === 1 ? 'application' : 'applications'}`)
    } catch {
      push('That file is not a tracker backup. Choose a .json file exported from this app.', { tone: 'error' })
    }
  }

  const clearAll = () => {
    setQuery('')
    setFilter(null)
  }

  const filtered = filter !== null || query.trim() !== ''

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#applications"
        className="sr-only z-[70] rounded-lg bg-ink px-4 py-2 text-inverse focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
      >
        Skip to applications
      </a>

      <Header theme={theme} onTheme={setTheme} onAdd={openNew} onExport={exportData} onImport={() => fileRef.current?.click()} />

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) importFile(f)
          e.target.value = ''
        }}
      />

      <main className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)] gap-4 px-4 pb-28 pt-5 sm:gap-5 sm:px-6 sm:pt-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
        <div className="lg:col-start-1 lg:row-start-1">
          <Pipeline counts={counts} total={apps.length} filter={filter} onFilter={setFilter} />
        </div>

        <aside className="lg:sticky lg:top-[88px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <FollowUps items={due} onOpen={openEdit} />
        </aside>

        <section id="applications" aria-labelledby="apps-h" className="min-w-0 scroll-mt-24 lg:col-start-1 lg:row-start-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-baseline gap-3">
              <h2 id="apps-h" className="text-lg font-semibold">
                Applications
              </h2>
              {apps.length > 0 && (
                <p className="tnum text-sm text-muted">
                  {filtered ? `${visible.length} of ${apps.length}` : apps.length}
                </p>
              )}
            </div>
          </div>

          {apps.length > 0 && (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search company, role, location, contact, notes"
                  aria-label="Search applications"
                  className="field pl-9 pr-10 [&::-webkit-search-cancel-button]:hidden"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="press absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-ink"
                  >
                    <X className="size-4" strokeWidth={1.75} />
                  </button>
                )}
              </div>
              <label className="relative flex items-center sm:w-[232px]">
                <span className="sr-only">Sort by</span>
                <span className="pointer-events-none absolute left-3 text-sm text-muted" aria-hidden="true">
                  Sort:
                </span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="field pl-[52px] text-[15px]"
                >
                  {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                    <option key={k} value={k}>
                      {SORT_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <AnimatePresence initial={false}>
            {(filter || exampleCount > 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-2 pt-3">
                  {filter && (
                    <button
                      onClick={() => setFilter(null)}
                      className="press inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong bg-surface pl-3 pr-2 text-sm text-ink hover:bg-surface-2"
                      aria-label={`Showing ${filter} only. Clear filter`}
                    >
                      Status: <span className="font-semibold">{filter}</span>
                      <X className="size-3.5 text-muted" strokeWidth={2} />
                    </button>
                  )}
                  {exampleCount > 0 && (
                    <div className="flex min-h-9 flex-1 items-center justify-between gap-3 rounded-lg bg-surface-2 py-1 pl-3 pr-1">
                      <p className="text-sm text-ink-2">
                        Showing {exampleCount} {exampleCount === 1 ? 'example' : 'examples'}
                      </p>
                      <button onClick={removeExamples} className={`${btn.small} text-ink sm:h-8`}>
                        Remove examples
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-4">
            {apps.length === 0 ? (
              <EmptyState onAdd={openNew} onImport={() => fileRef.current?.click()} />
            ) : visible.length === 0 ? (
              <NoResults query={query.trim()} onClear={clearAll} />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                <AnimatePresence mode="popLayout" initial={false}>
                  {visible.map((a) => (
                    <AppCard key={a.id} app={a} onEdit={openEdit} onDelete={remove} onStatus={changeStatus} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </section>
      </main>

      <EditDialog open={dialog.open} editing={dialog.editing} onClose={closeDialog} onSave={save} />
      <Toasts toasts={toasts} onDismiss={dismiss} />
    </MotionConfig>
  )
}
