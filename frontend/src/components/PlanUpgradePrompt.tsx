import { Lock } from 'lucide-react'

export function PlanUpgradePrompt({ feature }: { feature: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
      <Lock className="mb-3 h-8 w-8 text-slate-300 dark:text-slate-700" strokeWidth={1.5} />
      <p className="text-slate-600 dark:text-slate-300">{feature} no está disponible en tu plan actual.</p>
      <p className="mt-1 text-sm text-slate-400 dark:text-slate-600">Actualiza tu plan para desbloquearlo.</p>
    </div>
  )
}
