import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { APPLIED_VIA_OPTIONS, STATUSES, type Application, type Status } from '../types'
import { todayISO } from '../lib/format'
import { useMediaQuery } from '../lib/hooks'
import { btn } from './ui'

export type Draft = Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'example'>

interface Props {
  open: boolean
  editing: Application | null // null + open = new application
  onClose: () => void
  onSave: (draft: Draft) => void
}

function emptyDraft(): Draft {
  return {
    company: '',
    role: '',
    status: 'Applied',
    location: '',
    dateApplied: todayISO(),
    followUp: '',
    allowance: null,
    appliedVia: '',
    contact: { name: '', position: '', email: '', phone: '' },
    link: '',
    notes: '',
  }
}

function toDraft(a: Application): Draft {
  const { id: _i, createdAt: _c, updatedAt: _u, example: _e, ...rest } = a
  return { ...rest, contact: { ...rest.contact } }
}

export function EditDialog({ open, editing, onClose, onSave }: Props) {
  const isPhone = useMediaQuery('(max-width: 639px)')
  return createPortal(
    <AnimatePresence>
      {open && (
        <DialogBody key="dialog" editing={editing} onClose={onClose} onSave={onSave} isPhone={isPhone} />
      )}
    </AnimatePresence>,
    document.body,
  )
}

function DialogBody({
  editing,
  onClose,
  onSave,
  isPhone,
}: {
  editing: Application | null
  onClose: () => void
  onSave: (d: Draft) => void
  isPhone: boolean
}) {
  const [draft, setDraft] = useState<Draft>(() => (editing ? toDraft(editing) : emptyDraft()))
  const [allowanceText, setAllowanceText] = useState(editing?.allowance != null ? String(editing.allowance) : '')
  const [error, setError] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const companyRef = useRef<HTMLInputElement>(null)
  const titleId = useId()
  const uid = useId()

  // Focus, scroll lock, focus restore.
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    const t = window.setTimeout(() => companyRef.current?.focus({ preventScroll: true }), 30)
    return () => {
      window.clearTimeout(t)
      document.body.style.overflow = overflow
      prev?.focus?.({ preventScroll: true })
    }
  }, [])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
      return
    }
    if (e.key !== 'Tab' || !panelRef.current) return
    const focusables = panelRef.current.querySelectorAll<HTMLElement>(
      'input, select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])',
    )
    const list = Array.from(focusables).filter((el) => !el.hasAttribute('disabled'))
    if (list.length === 0) return
    const first = list[0]
    const last = list[list.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }))
  const setContact = (key: keyof Draft['contact'], value: string) =>
    setDraft((d) => ({ ...d, contact: { ...d.contact, [key]: value } }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.company.trim()) {
      setError('Enter the company name. It is the one field you need to save.')
      companyRef.current?.focus()
      return
    }
    const cleaned = allowanceText.replace(/[^\d.]/g, '')
    const allowance = cleaned === '' ? null : Math.round(Number(cleaned))
    let link = draft.link.trim()
    if (link && !/^https?:\/\//i.test(link)) link = `https://${link}`
    onSave({
      ...draft,
      company: draft.company.trim(),
      role: draft.role.trim(),
      location: draft.location.trim(),
      appliedVia: draft.appliedVia.trim(),
      link,
      notes: draft.notes.trim(),
      allowance: Number.isFinite(allowance) ? allowance : null,
      contact: {
        name: draft.contact.name.trim(),
        position: draft.contact.position.trim(),
        email: draft.contact.email.trim(),
        phone: draft.contact.phone.trim(),
      },
    })
  }

  const ease = [0.23, 1, 0.32, 1] as const
  const panelMotion = isPhone
    ? {
        initial: { y: '100%' },
        animate: { y: 0, transition: { duration: 0.32, ease: [0.32, 0.72, 0, 1] as const } },
        exit: { y: '100%', transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] as const } },
      }
    : {
        initial: { opacity: 0, scale: 0.97 },
        animate: { opacity: 1, scale: 1, transition: { duration: 0.2, ease } },
        exit: { opacity: 0, scale: 0.98, transition: { duration: 0.14, ease } },
      }

  const id = (name: string) => `${uid}-${name}`

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" onKeyDown={onKeyDown}>
      <motion.div
        className="absolute inset-0 bg-[rgb(20_19_17/0.45)] dark:bg-[rgb(0_0_0/0.6)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.2 } }}
        exit={{ opacity: 0, transition: { duration: 0.16 } }}
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        {...panelMotion}
        className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-surface shadow-[var(--shadow-dialog)] sm:max-h-[min(860px,calc(100dvh-48px))] sm:max-w-[640px] sm:rounded-2xl"
      >
        {isPhone && <div className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-line-strong" aria-hidden="true" />}
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-6 sm:py-4">
          <h2 id={titleId} className="text-base font-semibold">
            {editing ? `Edit ${editing.company}` : 'Add application'}
          </h2>
          <button onClick={onClose} aria-label="Close" className={`${btn.icon} -mr-2`}>
            <X className="size-[18px]" strokeWidth={1.75} />
          </button>
        </div>

        <form id={id('form')} onSubmit={submit} noValidate className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
          <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
            <Label htmlFor={id('company')} text="Company" required className="sm:col-span-2">
              <input
                ref={companyRef}
                id={id('company')}
                className="field"
                value={draft.company}
                onChange={(e) => {
                  set('company', e.target.value)
                  if (error) setError(null)
                }}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? id('company-err') : undefined}
                autoComplete="organization"
                placeholder="e.g. Nexora Tech Sdn Bhd"
              />
              <AnimatePresence initial={false}>
                {error && (
                  <motion.p
                    id={id('company-err')}
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.16, ease }}
                    className="mt-1.5 text-sm font-medium text-danger"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </Label>

            <Label htmlFor={id('role')} text="Role">
              <input
                id={id('role')}
                className="field"
                value={draft.role}
                onChange={(e) => set('role', e.target.value)}
                placeholder="e.g. Software Engineering Intern"
              />
            </Label>
            <Label htmlFor={id('status')} text="Status">
              <select
                id={id('status')}
                className="field"
                value={draft.status}
                onChange={(e) => set('status', e.target.value as Status)}
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Label>

            <Label htmlFor={id('location')} text="Location">
              <input
                id={id('location')}
                className="field"
                value={draft.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="e.g. Petaling Jaya, Selangor"
              />
            </Label>
            <Label htmlFor={id('allowance')} text="Allowance (RM per month)">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">RM</span>
                <input
                  id={id('allowance')}
                  className="field tnum pl-11"
                  inputMode="numeric"
                  value={allowanceText}
                  onChange={(e) => setAllowanceText(e.target.value.replace(/[^\d,.]/g, ''))}
                  placeholder="1,000"
                />
              </div>
            </Label>

            <Label htmlFor={id('applied')} text="Date applied">
              <input
                id={id('applied')}
                type="date"
                className="field tnum"
                value={draft.dateApplied}
                onChange={(e) => set('dateApplied', e.target.value)}
              />
            </Label>
            <Label htmlFor={id('follow')} text="Follow-up date">
              <input
                id={id('follow')}
                type="date"
                className="field tnum"
                value={draft.followUp}
                onChange={(e) => set('followUp', e.target.value)}
              />
            </Label>

            <Label htmlFor={id('via')} text="Applied via">
              <input
                id={id('via')}
                className="field"
                list={id('via-list')}
                value={draft.appliedVia}
                onChange={(e) => set('appliedVia', e.target.value)}
                placeholder="LinkedIn, Jobstreet, email…"
              />
              <datalist id={id('via-list')}>
                {APPLIED_VIA_OPTIONS.map((o) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
            </Label>
            <Label htmlFor={id('link')} text="Job posting link">
              <input
                id={id('link')}
                type="url"
                inputMode="url"
                className="field"
                value={draft.link}
                onChange={(e) => set('link', e.target.value)}
                placeholder="https://"
              />
            </Label>
          </div>

          <fieldset className="mt-6 border-t border-line pt-5">
            <legend className="sr-only">Contact person</legend>
            <p className="mb-3 text-sm font-semibold" aria-hidden="true">
              Contact person
            </p>
            <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
              <Label htmlFor={id('cname')} text="Name">
                <input
                  id={id('cname')}
                  className="field"
                  value={draft.contact.name}
                  onChange={(e) => setContact('name', e.target.value)}
                  autoComplete="off"
                />
              </Label>
              <Label htmlFor={id('cpos')} text="Position">
                <input
                  id={id('cpos')}
                  className="field"
                  value={draft.contact.position}
                  onChange={(e) => setContact('position', e.target.value)}
                  placeholder="e.g. HR Executive"
                />
              </Label>
              <Label htmlFor={id('cemail')} text="Email">
                <input
                  id={id('cemail')}
                  type="email"
                  inputMode="email"
                  className="field"
                  value={draft.contact.email}
                  onChange={(e) => setContact('email', e.target.value)}
                  autoComplete="off"
                />
              </Label>
              <Label htmlFor={id('cphone')} text="Phone">
                <input
                  id={id('cphone')}
                  type="tel"
                  inputMode="tel"
                  className="field tnum"
                  value={draft.contact.phone}
                  onChange={(e) => setContact('phone', e.target.value)}
                  autoComplete="off"
                />
              </Label>
            </div>
          </fieldset>

          <div className="mt-6 border-t border-line pt-5">
            <Label htmlFor={id('notes')} text="Notes">
              <textarea
                id={id('notes')}
                className="field"
                rows={4}
                value={draft.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Interview questions, next steps, things to mention…"
              />
            </Label>
          </div>
        </form>

        <div className="flex items-center justify-end gap-2 border-t border-line bg-surface px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
          <button type="button" onClick={onClose} className={`${btn.ghost} flex-1 sm:flex-none`}>
            Cancel
          </button>
          <button type="submit" form={id('form')} className={`${btn.primary} flex-1 sm:flex-none`}>
            {editing ? 'Save changes' : 'Add application'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function Label({
  htmlFor,
  text,
  required,
  className = '',
  children,
}: {
  htmlFor: string
  text: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink-2">
        {text}
        {required && (
          <span className="ml-1 font-normal text-muted">
            (required)
          </span>
        )}
      </label>
      {children}
    </div>
  )
}
