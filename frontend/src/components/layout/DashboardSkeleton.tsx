function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800 ${className}`} />
}

export function DashboardSkeleton() {
  return (
    <div>
      <Pulse className="mb-2 h-7 w-56" />
      <Pulse className="mb-8 h-4 w-80" />
      <Pulse className="mb-8 h-24 w-full rounded-xl" />
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Pulse className="h-24 rounded-xl" />
        <Pulse className="h-24 rounded-xl" />
        <Pulse className="h-24 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Pulse className="h-40 rounded-xl lg:col-span-3" />
        <Pulse className="h-40 rounded-xl lg:col-span-2" />
      </div>
    </div>
  )
}
