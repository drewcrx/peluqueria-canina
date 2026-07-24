import { Lock } from 'lucide-react'

export function PlanUpgradePrompt({ feature }: { feature: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-sand-dark bg-white/50 py-16 text-center">
      <Lock className="mb-3 h-8 w-8 text-ink-soft/40" strokeWidth={1.5} />
      <p className="text-ink-soft">{feature} no está disponible en tu plan actual.</p>
      <p className="mt-1 text-sm text-ink-soft">Actualiza tu plan para desbloquearlo.</p>
    </div>
  )
}
