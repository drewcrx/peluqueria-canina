import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cardClass } from './styles'

export function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className={`p-6 ${cardClass}`}>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-clay/15 text-clay-dark">
          <Icon className="h-4.5 w-4.5" strokeWidth={2} />
        </div>
        <div>
          <h2 className="font-display font-medium text-ink">{title}</h2>
          <p className="text-sm text-ink-soft">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}
