const base =
  'press inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap select-none disabled:opacity-50 disabled:pointer-events-none'

export const btn = {
  primary: `${base} h-11 sm:h-10 px-4 bg-ink text-inverse hover:bg-ink/85`,
  secondary: `${base} h-11 sm:h-10 px-4 border border-line-strong bg-surface text-ink hover:bg-surface-2`,
  ghost: `${base} h-11 sm:h-10 px-3 text-ink-2 hover:bg-surface-2 hover:text-ink`,
  danger: `${base} h-11 sm:h-9 px-3.5 bg-danger text-inverse hover:bg-danger/85`,
  small: `${base} h-11 sm:h-9 px-3 text-ink-2 hover:bg-surface-2 hover:text-ink`,
  icon: `${base} size-11 sm:size-10 text-ink-2 hover:bg-surface-2 hover:text-ink`,
}
