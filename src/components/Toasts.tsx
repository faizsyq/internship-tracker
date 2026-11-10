import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import type { Toast } from '../lib/hooks'

export function Toasts({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex min-h-11 w-full max-w-[420px] items-center gap-2 rounded-xl py-1.5 pl-4 pr-1.5 text-sm shadow-[var(--shadow-pop)] ${
              t.tone === 'error' ? 'bg-danger text-inverse' : 'bg-ink text-inverse'
            }`}
          >
            <span className="min-w-0 flex-1 py-1.5 font-medium [overflow-wrap:anywhere]">{t.message}</span>
            {t.action && (
              <button
                onClick={() => {
                  t.action!.onClick()
                  onDismiss(t.id)
                }}
                className="press h-9 shrink-0 rounded-lg px-3 font-semibold underline-offset-4 hover:bg-inverse/10 hover:underline"
              >
                {t.action.label}
              </button>
            )}
            <button
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss"
              className="press grid size-9 shrink-0 place-items-center rounded-lg opacity-70 hover:bg-inverse/10 hover:opacity-100"
            >
              <X className="size-4" strokeWidth={1.75} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
