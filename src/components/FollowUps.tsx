import { CalendarCheck2, ChevronRight } from 'lucide-react'
import type { Application } from '../types'
import { formatDate, relativeDue } from '../lib/format'
import { STATUS_STYLE } from '../lib/status'

export interface DueItem {
  app: Application
  days: number
}

interface Props {
  items: DueItem[]
  onOpen: (app: Application) => void
}

export function FollowUps({ items, onOpen }: Props) {
  return (
    <section aria-labelledby="follow-h" className="rounded-xl border border-line bg-surface">
      <div className="flex items-baseline justify-between gap-3 px-4 pt-4 sm:px-5">
        <h2 id="follow-h" className="text-sm font-semibold">
          Follow up next
        </h2>
        <p className="text-xs text-muted">Next 7 days</p>
      </div>

      {items.length === 0 ? (
        <div className="flex items-start gap-3 px-4 pb-5 pt-3 sm:px-5">
          <CalendarCheck2 className="mt-0.5 size-5 shrink-0 text-muted" strokeWidth={1.5} />
          <p className="text-sm text-muted">
            Nothing due this week. Set a follow-up date on an application and it will show here.
          </p>
        </div>
      ) : (
        <ul className="px-2 pb-2 pt-2">
          {items.map(({ app, days }) => {
            const tone = days < 0 ? 'text-danger' : days === 0 ? 'text-warn' : 'text-muted'
            return (
              <li key={app.id}>
                <button
                  onClick={() => onOpen(app)}
                  className="press group flex min-h-[56px] w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-surface-2"
                  aria-label={`${app.company}, ${relativeDue(days)}. Edit`}
                >
                  <span className={`size-2 shrink-0 rounded-full ${STATUS_STYLE[app.status].dot}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{app.company}</span>
                    <span className="block truncate text-xs text-muted">
                      {app.status}
                      {app.role ? ` · ${app.role}` : ''}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className={`tnum block text-xs font-semibold ${tone}`}>{relativeDue(days)}</span>
                    <span className="tnum block text-xs text-muted">{formatDate(app.followUp)}</span>
                  </span>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted opacity-60 transition-transform duration-150 group-hover:translate-x-0.5"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
