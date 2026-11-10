import { STATUSES, type Application, type Status } from '../types'

const KEY = 'it.applications.v1'
const SEEDED_KEY = 'it.seeded'
export const THEME_KEY = 'it.theme'

export function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function safeSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

/** null means nothing has ever been saved on this device. */
export function loadApplications(): Application[] | null {
  const raw = safeGet(KEY)
  if (raw === null) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(normalize).filter((a): a is Application => a !== null) : []
  } catch {
    return []
  }
}

export function saveApplications(apps: Application[]): boolean {
  return safeSet(KEY, JSON.stringify(apps))
}

export function hasSeeded(): boolean {
  return safeGet(SEEDED_KEY) === '1'
}

export function markSeeded() {
  safeSet(SEEDED_KEY, '1')
}

export function newId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  } catch {
    /* randomUUID needs a secure context; fall through */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const date = (v: unknown) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '')

/** Coerce anything (old saves, imported files) into a valid Application, or null. */
export function normalize(input: unknown): Application | null {
  if (!input || typeof input !== 'object') return null
  const o = input as Record<string, unknown>
  const company = str(o.company).trim()
  if (!company) return null
  const c = (o.contact && typeof o.contact === 'object' ? o.contact : {}) as Record<string, unknown>
  const allowanceNum =
    typeof o.allowance === 'number' ? o.allowance : o.allowance != null && o.allowance !== '' ? Number(o.allowance) : NaN
  const now = Date.now()
  return {
    id: str(o.id) || newId(),
    company,
    role: str(o.role),
    status: (STATUSES as readonly string[]).includes(str(o.status)) ? (o.status as Status) : 'Applied',
    location: str(o.location),
    dateApplied: date(o.dateApplied),
    followUp: date(o.followUp),
    allowance: Number.isFinite(allowanceNum) && allowanceNum >= 0 ? allowanceNum : null,
    appliedVia: str(o.appliedVia),
    contact: { name: str(c.name), position: str(c.position), email: str(c.email), phone: str(c.phone) },
    link: str(o.link),
    notes: str(o.notes),
    example: o.example === true ? true : undefined,
    createdAt: typeof o.createdAt === 'number' ? o.createdAt : now,
    updatedAt: typeof o.updatedAt === 'number' ? o.updatedAt : now,
  }
}
