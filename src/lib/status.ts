import type { Status } from '../types'

// Full class strings so Tailwind can see them.
export const STATUS_STYLE: Record<Status, { dot: string; pill: string; bar: string }> = {
  Wishlist: {
    dot: 'bg-[var(--st-wishlist)]',
    bar: 'var(--st-wishlist)',
    pill: 'bg-[var(--st-wishlist-bg)] text-[var(--st-wishlist-fg)]',
  },
  Applied: {
    dot: 'bg-[var(--st-applied)]',
    bar: 'var(--st-applied)',
    pill: 'bg-[var(--st-applied-bg)] text-[var(--st-applied-fg)]',
  },
  Interview: {
    dot: 'bg-[var(--st-interview)]',
    bar: 'var(--st-interview)',
    pill: 'bg-[var(--st-interview-bg)] text-[var(--st-interview-fg)]',
  },
  Offer: {
    dot: 'bg-[var(--st-offer)]',
    bar: 'var(--st-offer)',
    pill: 'bg-[var(--st-offer-bg)] text-[var(--st-offer-fg)]',
  },
  Rejected: {
    dot: 'bg-[var(--st-rejected)]',
    bar: 'var(--st-rejected)',
    pill: 'bg-[var(--st-rejected-bg)] text-[var(--st-rejected-fg)]',
  },
  Ghosted: {
    dot: 'bg-[var(--st-ghosted)]',
    bar: 'var(--st-ghosted)',
    pill: 'bg-[var(--st-ghosted-bg)] text-[var(--st-ghosted-fg)]',
  },
}
