import type { ReactNode } from 'react'

type Tone = 'sage' | 'clay' | 'gold' | 'neutral' | 'red'

const TONE_CLASS: Record<Tone, string> = {
  sage: 'bg-sage-light text-sage-dark',
  clay: 'bg-clay/15 text-clay-dark',
  gold: 'bg-gold/20 text-ink-soft',
  neutral: 'bg-sand text-ink-soft',
  red: 'bg-red-50 text-red-700',
}

export function Badge({
  tone = 'neutral',
  className = '',
  children,
}: {
  tone?: Tone
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${TONE_CLASS[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
