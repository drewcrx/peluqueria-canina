import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger'

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    'bg-ink text-cream hover:scale-[1.02] active:scale-[0.98] shadow-soft disabled:hover:scale-100',
  // bg-clay-dark, not bg-clay: cream text on plain clay clears only ~3.2:1 (fails WCAG AA for
  // text); clay-dark clears 4.5:1+ while staying visibly on-brand.
  accent:
    'bg-clay-dark text-cream hover:scale-[1.02] active:scale-[0.98] shadow-soft disabled:hover:scale-100',
  secondary:
    'border border-sand-dark bg-white text-ink hover:bg-sand/60',
  ghost: 'text-ink-soft hover:bg-sand/60 hover:text-ink',
  danger: 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASS[variant]} ${className}`}
      {...props}
    />
  )
}
