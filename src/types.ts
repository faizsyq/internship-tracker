export const STATUSES = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted'] as const
export type Status = (typeof STATUSES)[number]

export const ACTIVE_STATUSES: Status[] = ['Wishlist', 'Applied', 'Interview', 'Offer']

export interface Contact {
  name: string
  position: string
  email: string
  phone: string
}

export interface Application {
  id: string
  company: string
  role: string
  status: Status
  location: string
  dateApplied: string // yyyy-mm-dd or ''
  followUp: string // yyyy-mm-dd or ''
  allowance: number | null // RM per month
  appliedVia: string
  contact: Contact
  link: string
  notes: string
  example?: boolean
  createdAt: number
  updatedAt: number
}

export type SortKey = 'followUp' | 'applied' | 'company' | 'allowance'

export const SORT_LABELS: Record<SortKey, string> = {
  followUp: 'Follow-up date',
  applied: 'Date applied (newest)',
  company: 'Company A–Z',
  allowance: 'Allowance (highest)',
}

export const APPLIED_VIA_OPTIONS = [
  'LinkedIn',
  'Jobstreet',
  'Hiredly',
  'Company website',
  'Email',
  'Career fair',
  'Referral',
  'UiTM placement unit',
]
