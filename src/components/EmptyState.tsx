import { Plus, SearchX, Upload } from 'lucide-react'
import { btn } from './ui'

export function EmptyState({ onAdd, onImport }: { onAdd: () => void; onImport: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center sm:py-16">
      <EmptyGraphic />
      <h2 className="mt-5 text-lg font-semibold">Start your internship list</h2>
      <p className="mx-auto mt-1.5 max-w-[42ch] text-sm text-muted">
        Add each company you apply to. Give it a follow-up date and it will appear under Follow up next when
        it is due.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
        <button onClick={onAdd} className={btn.primary}>
          <Plus className="size-4" strokeWidth={2} />
          Add your first application
        </button>
        <button onClick={onImport} className={btn.ghost}>
          <Upload className="size-4" strokeWidth={1.75} />
          Import a backup
        </button>
      </div>
    </div>
  )
}

export function NoResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-6 py-10 text-center">
      <SearchX className="mx-auto size-6 text-muted" strokeWidth={1.5} />
      <p className="mt-3 text-sm font-medium">
        {query ? `No applications match “${query}”` : 'No applications with this status'}
      </p>
      <button onClick={onClear} className={`${btn.secondary} mt-4`}>
        Clear search and filter
      </button>
    </div>
  )
}

/** Three stacked cards, the top one with a status pill: echoes what the list will look like. */
function EmptyGraphic() {
  return (
    <svg viewBox="0 0 120 72" className="mx-auto h-[72px] w-[120px]" aria-hidden="true">
      <rect x="22" y="4" width="76" height="20" rx="5" fill="var(--surface-2)" />
      <rect x="14" y="14" width="92" height="24" rx="6" fill="var(--surface-2)" stroke="var(--line-strong)" />
      <rect x="6" y="26" width="108" height="42" rx="7" fill="var(--surface)" stroke="var(--line-strong)" />
      <rect x="16" y="37" width="44" height="6" rx="3" fill="var(--ink)" opacity=".8" />
      <rect x="16" y="49" width="28" height="5" rx="2.5" fill="var(--muted)" opacity=".5" />
      <rect x="78" y="35" width="26" height="10" rx="5" fill="var(--st-applied-bg)" />
      <circle cx="84" cy="40" r="2" fill="var(--st-applied)" />
    </svg>
  )
}
