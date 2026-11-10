import { forwardRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Check, Copy, MapPin, Pencil, Phone, Trash2 } from 'lucide-react'
import { ACTIVE_STATUSES, type Application, type Status } from '../types'
import { daysUntil, formatAllowance, formatDate, relativeDue } from '../lib/format'
import { copyText } from '../lib/hooks'
import { StatusMenu } from './StatusMenu'
import { btn } from './ui'

interface Props {
  app: Application
  onEdit: (app: Application) => void
  onDelete: (app: Application) => void
  onStatus: (app: Application, s: Status) => void
}

const ease = [0.23, 1, 0.32, 1] as const

export const AppCard = forwardRef<HTMLElement, Props>(function AppCard({ app, onEdit, onDelete, onStatus }, ref) {
  const [confirming, setConfirming] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const days = app.followUp ? daysUntil(app.followUp) : null
  const active = ACTIVE_STATUSES.includes(app.status)
  const overdue = active && days !== null && days < 0
  const dueToday = active && days === 0

  const edge = overdue
    ? 'shadow-[inset_3px_0_0_var(--danger)]'
    : dueToday
      ? 'shadow-[inset_3px_0_0_var(--warn-edge)]'
      : ''

  const contactLine = [app.contact.name, app.contact.position].filter(Boolean).join(', ')
  const subtitle = app.role || 'Role not set'

  return (
    <motion.article
      ref={ref}
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15, ease } }}
      transition={{ duration: 0.22, ease }}
      className={`hover-lift relative flex flex-col rounded-xl border border-line bg-surface ${edge} ${
        menuOpen ? 'z-20' : 'z-0'
      }`}
      style={{ transition: 'border-color 150ms ease' }}
      aria-label={app.company}
    >
      <div className="flex items-start gap-3 px-4 pt-4 sm:px-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-[15px] font-semibold leading-snug [overflow-wrap:anywhere]">{app.company}</h3>
            {app.example && (
              <span className="rounded-[5px] border border-line-strong px-1.5 py-px text-[11px] font-medium text-muted">
                Example
              </span>
            )}
          </div>
          <p className={`mt-0.5 text-sm ${app.role ? 'text-ink-2' : 'text-muted'}`}>{subtitle}</p>
          {app.location && (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted">
              <MapPin className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span className="truncate">{app.location}</span>
            </p>
          )}
        </div>
        <StatusMenu
          value={app.status}
          company={app.company}
          onChange={(s) => onStatus(app, s)}
          onOpenChange={setMenuOpen}
        />
      </div>

      <dl className="mx-4 mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-3.5 text-sm sm:mx-5">
        <Field label="Applied">
          {app.dateApplied ? formatDate(app.dateApplied) : <Empty>Not yet</Empty>}
        </Field>
        <Field label="Follow up">
          {app.followUp ? (
            <>
              <span className="block">{formatDate(app.followUp)}</span>
              {active && days !== null && days <= 7 && (
                <span
                  className={`block text-xs font-semibold ${
                    overdue ? 'text-danger' : dueToday ? 'text-warn' : 'text-muted'
                  }`}
                >
                  {relativeDue(days)}
                </span>
              )}
            </>
          ) : (
            <Empty>Not set</Empty>
          )}
        </Field>
        <Field label="Allowance">
          {app.allowance !== null ? formatAllowance(app.allowance) : <Empty>Not stated</Empty>}
        </Field>
        <Field label="Applied via">{app.appliedVia || <Empty>Not set</Empty>}</Field>
      </dl>

      {(contactLine || app.contact.email || app.contact.phone) && (
        <div className="mx-4 mt-3.5 border-t border-line pt-3 text-sm sm:mx-5">
          <p className="text-xs text-muted">Contact</p>
          {contactLine && <p className="mt-0.5 text-ink">{contactLine}</p>}
          {app.contact.email && <EmailRow email={app.contact.email} />}
          {app.contact.phone && (
            <a
              href={`tel:${app.contact.phone.replace(/[^\d+]/g, '')}`}
              className="tnum mt-0.5 inline-flex min-h-8 items-center gap-1.5 text-ink-2 underline-offset-4 hover:underline"
            >
              <Phone className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
              {app.contact.phone}
            </a>
          )}
        </div>
      )}

      {app.notes && (
        <p className="mx-4 mt-3.5 line-clamp-3 whitespace-pre-line border-t border-line pt-3 text-sm text-ink-2 sm:mx-5">
          {app.notes}
        </p>
      )}

      <div className="mt-auto px-2 pb-2 pt-3 sm:px-3">
        <AnimatePresence mode="wait" initial={false}>
          {confirming ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.08 } }}
              transition={{ duration: 0.16, ease }}
              className="flex flex-wrap items-center gap-2 rounded-lg bg-danger-soft py-1.5 pl-3 pr-1.5"
              role="group"
              aria-label={`Confirm delete ${app.company}`}
            >
              <p className="min-w-0 flex-1 text-sm font-medium text-ink">
                Delete <span className="[overflow-wrap:anywhere]">{app.company}</span>?
              </p>
              <div className="flex gap-1.5">
                <button autoFocus onClick={() => setConfirming(false)} className={`${btn.secondary} sm:h-9`}>
                  Keep
                </button>
                <button onClick={() => onDelete(app)} className={btn.danger}>
                  Delete
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.08 } }}
              transition={{ duration: 0.14 }}
              className="flex items-center gap-1"
            >
              {app.link && (
                <a
                  href={app.link}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={`${btn.small} group`}
                >
                  Job posting
                  <ArrowUpRight
                    className="size-3.5 transition-transform duration-150 group-hover:-translate-y-px group-hover:translate-x-px"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </a>
              )}
              <div className="ml-auto flex items-center gap-1">
                <button onClick={() => onEdit(app)} className={btn.small} aria-label={`Edit ${app.company}`}>
                  <Pencil className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                  Edit
                </button>
                <button
                  onClick={() => setConfirming(true)}
                  className={`${btn.small} hover:text-danger`}
                  aria-label={`Delete ${app.company}`}
                >
                  <Trash2 className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                  Delete
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  )
})

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="tnum mt-0.5 text-ink [overflow-wrap:anywhere]">{children}</dd>
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <span className="text-muted">{children}</span>
}

function EmailRow({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    if (await copyText(email)) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    }
  }
  return (
    <div className="mt-0.5 flex items-center gap-1">
      <a
        href={`mailto:${email}`}
        className="min-w-0 truncate text-ink-2 underline decoration-line-strong underline-offset-4 hover:text-ink hover:decoration-current"
      >
        {email}
      </a>
      <button
        onClick={copy}
        aria-label={copied ? 'Email copied' : `Copy email ${email}`}
        title={copied ? 'Copied' : 'Copy email'}
        className="press relative -my-1.5 grid size-11 shrink-0 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-ink sm:my-0 sm:size-9"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={copied ? 'done' : 'copy'}
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(2px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.8, filter: 'blur(2px)' }}
            transition={{ duration: 0.15, ease }}
            className="grid place-items-center"
          >
            {copied ? (
              <Check className="size-3.5 text-[var(--st-offer)]" strokeWidth={2.25} />
            ) : (
              <Copy className="size-3.5" strokeWidth={1.75} />
            )}
          </motion.span>
        </AnimatePresence>
        <span className="sr-only" aria-live="polite">
          {copied ? 'Copied' : ''}
        </span>
      </button>
    </div>
  )
}
