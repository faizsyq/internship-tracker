const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayISO(): string {
  return toISO(new Date())
}

export function parseISO(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}

export function addDays(iso: string, n: number): string {
  const d = parseISO(iso)
  if (!d) return iso
  d.setDate(d.getDate() + n)
  return toISO(d)
}

/** "10 Nov 2026" */
export function formatDate(iso: string): string {
  const d = parseISO(iso)
  if (!d) return ''
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** Whole days from today to the date. Negative means past. */
export function daysUntil(iso: string): number | null {
  const d = parseISO(iso)
  if (!d) return null
  const t = parseISO(todayISO())!
  return Math.round((d.getTime() - t.getTime()) / 86_400_000)
}

export function relativeDue(days: number): string {
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return 'Overdue by 1 day'
  if (days < 0) return `Overdue by ${-days} days`
  return `In ${days} days`
}

/** "RM 1,200/mo" */
export function formatAllowance(n: number | null): string {
  if (n === null || Number.isNaN(n)) return ''
  return `RM ${n.toLocaleString('en-MY', { maximumFractionDigits: 0 })}/mo`
}
