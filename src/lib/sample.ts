import type { Application } from '../types'
import { addDays, todayISO } from './format'
import { newId } from './storage'

/** Made-up companies. Dates are relative to today so the follow-up panel has something to show. */
export function sampleApplications(): Application[] {
  const t = todayISO()
  const now = Date.now()
  const base = { example: true as const, createdAt: now, updatedAt: now, link: '' }
  return [
    {
      ...base,
      id: newId(),
      company: 'Nexora Tech Sdn Bhd',
      role: 'Software Engineering Intern',
      status: 'Interview',
      location: 'Cyberjaya, Selangor',
      dateApplied: addDays(t, -12),
      followUp: t,
      allowance: 1200,
      appliedVia: 'LinkedIn',
      contact: { name: 'Aisyah Rahman', position: 'Talent Acquisition', email: 'aisyah.rahman@nexora.example', phone: '' },
      notes: 'Technical interview passed. Send a thank-you email and ask about the start date.',
    },
    {
      ...base,
      id: newId(),
      company: 'Teras Cloud Solutions',
      role: 'IT Support Intern',
      status: 'Applied',
      location: 'Petaling Jaya, Selangor',
      dateApplied: addDays(t, -9),
      followUp: addDays(t, -2),
      allowance: 800,
      appliedVia: 'Jobstreet',
      contact: { name: 'Daniel Tan', position: 'IT Manager', email: 'hr@terascloud.example', phone: '' },
      notes: 'No reply yet. Follow up by email and attach the resume again.',
    },
    {
      ...base,
      id: newId(),
      company: 'Lumio Digital',
      role: 'Web Developer Intern',
      status: 'Wishlist',
      location: 'Bangsar South, Kuala Lumpur',
      dateApplied: '',
      followUp: addDays(t, 3),
      allowance: 1000,
      appliedVia: 'Career fair',
      contact: { name: '', position: '', email: 'careers@lumio.example', phone: '' },
      notes: 'Met them at the UiTM career fair. Tailor the cover letter to React projects.',
    },
  ]
}
