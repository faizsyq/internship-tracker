import { STATUSES, type Status } from '../types'
import { STATUS_STYLE } from '../lib/status'

interface Props {
  counts: Record<Status, number>
  total: number
  filter: Status | null
  onFilter: (s: Status | null) => void
}

export function Pipeline({ counts, total, filter, onFilter }: Props) {
  return (
    <section aria-labelledby="pipeline-h" className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="pipeline-h" className="text-sm font-semibold">
          Pipeline
        </h2>
        <p className="tnum text-sm text-muted">
          {total} {total === 1 ? 'application' : 'applications'}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1 sm:grid-cols-6">
        {STATUSES.map((s) => {
          const active = filter === s
          const dimmed = filter !== null && !active
          return (
            <button
              key={s}
              onClick={() => onFilter(active ? null : s)}
              aria-pressed={active}
              aria-label={`${s}: ${counts[s]}. ${active ? 'Clear filter' : 'Show only ' + s}`}
              className={`press group relative flex min-h-[64px] flex-col items-start justify-between rounded-lg px-2.5 py-2 text-left ${
                active ? 'bg-surface-2 ring-1 ring-line-strong ring-inset' : 'hover:bg-surface-2'
              } ${dimmed ? 'opacity-50 hover:opacity-100' : ''}`}
            >
              <span className="flex items-center gap-1.5 text-xs font-medium text-ink-2">
                <span className={`size-2 rounded-full ${STATUS_STYLE[s].dot}`} aria-hidden="true" />
                {s}
              </span>
              <span className="tnum text-2xl font-semibold leading-none tracking-[-0.02em]">{counts[s]}</span>
            </button>
          )
        })}
      </div>

      <div
        className="mt-3 flex h-1.5 gap-[2px] overflow-hidden rounded-full bg-surface-2"
        role="img"
        aria-label={STATUSES.map((s) => `${s} ${counts[s]}`).join(', ')}
      >
        {STATUSES.filter((s) => counts[s] > 0).map((s) => (
          <span
            key={s}
            className="h-full"
            style={{
              flexGrow: counts[s],
              flexBasis: 0,
              background: STATUS_STYLE[s].bar,
              opacity: filter && filter !== s ? 0.3 : 1,
              transition: 'flex-grow 320ms var(--ease-in-out), opacity 200ms ease',
            }}
          />
        ))}
      </div>
    </section>
  )
}
