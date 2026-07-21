import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, BarChart3, ListChecks, PawPrint, TrendingUp, UserPlus, Users } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { TenantShell } from '../../components/layout/TenantShell'
import { getMyTenant } from '../tenant/api'
import { getDashboardStats, type AppointmentStatusCount, type DailyCashFlow, type ServiceCount } from './api'

type RangePreset = 'month' | '7' | '30' | '90'

const RANGE_PRESETS: { value: RangePreset; label: string }[] = [
  { value: 'month', label: 'Este mes' },
  { value: '7', label: 'Últimos 7 días' },
  { value: '30', label: 'Últimos 30 días' },
  { value: '90', label: 'Últimos 90 días' },
]

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

function rangeForPreset(preset: RangePreset): { fromDate: string; toDate: string } | undefined {
  if (preset === 'month') return undefined
  const days = Number(preset)
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - (days - 1))
  return { fromDate: toIsoDate(from), toDate: toIsoDate(to) }
}

const STATUS_LABELS: Record<string, string> = {
  PendingSchedule: 'Por agendar',
  Scheduled: 'Agendadas',
  Completed: 'Completadas',
  Cancelled: 'Canceladas',
}

// Validated categorical palette (dataviz skill, default order): fixed hue slots, never cycled.
const STATUS_ORDER = ['Scheduled', 'Completed', 'PendingSchedule', 'Cancelled']
const STATUS_VARS: Record<string, string> = {
  Scheduled: '--slot-blue',
  Completed: '--slot-green',
  PendingSchedule: '--slot-yellow',
  Cancelled: '--slot-magenta',
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function formatShortDate(iso: string) {
  return new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'short' }).format(new Date(iso))
}

export function StatsPage() {
  const [preset, setPreset] = useState<RangePreset>('month')
  const [showTable, setShowTable] = useState(false)
  const { data: tenant } = useQuery({ queryKey: ['my-tenant'], queryFn: getMyTenant, staleTime: 60_000 })
  const hasAdvancedDashboard = tenant?.features.includes('AdvancedDashboard') ?? false

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboard-stats', preset],
    queryFn: () => getDashboardStats(rangeForPreset(preset)),
  })

  const periodLabel = RANGE_PRESETS.find((p) => p.value === preset)?.label ?? 'Este mes'

  return (
    <TenantShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Estadísticas</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">El pulso de tu negocio — {periodLabel.toLowerCase()}.</p>
        </div>

        {hasAdvancedDashboard && (
          <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
            {RANGE_PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPreset(p.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  preset === p.value
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading && <p className="text-slate-500 dark:text-slate-400">Cargando…</p>}
      {isError && <p className="text-red-500">No se pudieron cargar las estadísticas.</p>}

      {stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatTile icon={Users} label="Clientes totales" value={stats.totalClients.toLocaleString('es-EC')} />
            <StatTile icon={UserPlus} label="Nuevos" value={stats.newClientsInRange.toLocaleString('es-EC')} />
            <StatTile
              icon={PawPrint}
              label="Citas completadas"
              value={stats.appointmentsCompletedInRange.toLocaleString('es-EC')}
            />
            <StatTile
              icon={TrendingUp}
              label="Caja neta"
              value={formatCurrency(stats.netCashInRange)}
              tone={stats.netCashInRange >= 0 ? 'good' : 'warning'}
            />
            <StatTile
              icon={AlertTriangle}
              label="Stock bajo"
              value={stats.lowStockProductsCount.toLocaleString('es-EC')}
              tone={stats.lowStockProductsCount > 0 ? 'warning' : 'default'}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard icon={ListChecks} title="Estado de las citas" subtitle={periodLabel}>
              <StatusBarChart data={stats.appointmentsByStatus} />
            </ChartCard>
            <ChartCard icon={BarChart3} title="Servicios más solicitados" subtitle="Citas completadas">
              <ServiceBarChart data={stats.topServices} />
            </ChartCard>
          </div>

          <ChartCard icon={TrendingUp} title="Flujo de caja" subtitle={periodLabel}>
            <CashFlowChart data={stats.cashFlowByDay} />
          </ChartCard>

          <div>
            <button
              onClick={() => setShowTable((v) => !v)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              {showTable ? 'Ocultar tabla de datos' : 'Ver datos en tabla'}
            </button>
            {showTable && <StatsTable stats={stats} />}
          </div>
        </div>
      )}
    </TenantShell>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
  tone = 'default',
}: {
  icon: typeof Users
  label: string
  value: string
  tone?: 'default' | 'good' | 'warning'
}) {
  const toneClass =
    tone === 'good'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'warning'
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-slate-900 dark:text-slate-50'

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
        {label}
      </div>
      <div className={`mt-1.5 text-xl font-semibold ${toneClass}`}>{value}</div>
    </div>
  )
}

function ChartCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: typeof Users
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-sm font-medium text-slate-900 dark:text-slate-50">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-600">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

const VIZ_VARS =
  '[--slot-blue:#2a78d6] [--slot-green:#008300] [--slot-magenta:#e87ba4] [--slot-yellow:#eda100] ' +
  'dark:[--slot-blue:#3987e5] dark:[--slot-green:#008300] dark:[--slot-magenta:#d55181] dark:[--slot-yellow:#c98500] ' +
  '[--grid:#e1e0d9] dark:[--grid:#2c2c2a]'

function StatusBarChart({ data }: { data: AppointmentStatusCount[] }) {
  const byStatus = Object.fromEntries(data.map((d) => [d.status, d.count]))
  const rows = STATUS_ORDER.map((status) => ({ status, count: byStatus[status] ?? 0 }))
  const max = Math.max(1, ...rows.map((r) => r.count))
  const barH = 22
  const gap = 16
  const chartH = rows.length * (barH + gap)

  if (rows.every((r) => r.count === 0)) {
    return <EmptyState text="Todavía no hay citas registradas." />
  }

  return (
    <div className={VIZ_VARS}>
      <svg
        viewBox={`0 0 320 ${chartH}`}
        width="100%"
        style={{ aspectRatio: `320 / ${chartH}` }}
        role="img"
        aria-label="Citas por estado"
      >
        {rows.map((row, i) => {
          const width = (row.count / max) * 220
          const y = i * (barH + gap)
          return (
            <g key={row.status}>
              <text x={0} y={y - 4} className="fill-slate-500 text-[11px] dark:fill-slate-400">
                {STATUS_LABELS[row.status] ?? row.status}
              </text>
              <rect x={0} y={y} width={220} height={barH} rx={4} className="fill-slate-100 dark:fill-slate-800" />
              <rect x={0} y={y} width={Math.max(width, row.count > 0 ? 6 : 0)} height={barH} rx={4} fill={`var(${STATUS_VARS[row.status]})`} />
              <text
                x={width + 8}
                y={y + barH / 2 + 4}
                className="fill-slate-700 text-[12px] font-medium tabular-nums dark:fill-slate-200"
              >
                {row.count}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function ServiceBarChart({ data }: { data: ServiceCount[] }) {
  if (data.length === 0) {
    return <EmptyState text="Aún no hay servicios completados para comparar." />
  }

  const max = Math.max(1, ...data.map((d) => d.count))
  const barH = 22
  const gap = 16
  const chartH = data.length * (barH + gap)

  return (
    <div className={VIZ_VARS}>
      <svg
        viewBox={`0 0 320 ${chartH}`}
        width="100%"
        style={{ aspectRatio: `320 / ${chartH}` }}
        role="img"
        aria-label="Servicios más solicitados"
      >
        {data.map((row, i) => {
          const width = (row.count / max) * 200
          const y = i * (barH + gap)
          return (
            <g key={row.serviceName}>
              <text x={0} y={y - 4} className="fill-slate-500 text-[11px] dark:fill-slate-400">
                {row.serviceName}
              </text>
              <rect x={0} y={y} width={200} height={barH} rx={4} className="fill-slate-100 dark:fill-slate-800" />
              <rect x={0} y={y} width={Math.max(width, 6)} height={barH} rx={4} fill="var(--slot-blue)" />
              <text
                x={width + 8}
                y={y + barH / 2 + 4}
                className="fill-slate-700 text-[12px] font-medium tabular-nums dark:fill-slate-200"
              >
                {row.count}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function CashFlowChart({ data }: { data: DailyCashFlow[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  if (data.length === 0) {
    return <EmptyState text="Todavía no hay movimientos de caja registrados." />
  }

  const width = 640
  const height = 220
  const padLeft = 44
  const padBottom = 24
  const padTop = 12
  const plotW = width - padLeft - 12
  const plotH = height - padTop - padBottom

  const maxValue = Math.max(1, ...data.map((d) => Math.max(d.income, d.expense)))
  const niceMax = Math.ceil(maxValue / 4) * 4 || 4
  const yTicks = [0, niceMax / 4, niceMax / 2, (niceMax * 3) / 4, niceMax]

  const x = (i: number) => padLeft + (i / Math.max(1, data.length - 1)) * plotW
  const y = (v: number) => padTop + plotH - (v / niceMax) * plotH

  const linePath = (key: 'income' | 'expense') =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d[key])}`).join(' ')

  const hovered = hoverIndex !== null ? data[hoverIndex] : null

  return (
    <div className={VIZ_VARS}>
      <div className="mb-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded-full" style={{ backgroundColor: 'var(--slot-blue)' }} />
          Ingresos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded-full" style={{ backgroundColor: 'var(--slot-green)' }} />
          Egresos
        </span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          style={{ aspectRatio: `${width} / ${height}` }}
          role="img"
          aria-label="Flujo de caja diario"
        >
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={padLeft} x2={width - 12} y1={y(t)} y2={y(t)} className="stroke-[var(--grid)]" strokeWidth={1} />
              <text x={padLeft - 8} y={y(t) + 3} textAnchor="end" className="fill-slate-400 text-[10px] tabular-nums dark:fill-slate-600">
                {t >= 1000 ? `${(t / 1000).toFixed(1)}K` : t}
              </text>
            </g>
          ))}

          <path d={linePath('income')} fill="none" stroke="var(--slot-blue)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          <path d={linePath('expense')} fill="none" stroke="var(--slot-green)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {hoverIndex !== null && (
            <line x1={x(hoverIndex)} x2={x(hoverIndex)} y1={padTop} y2={padTop + plotH} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
          )}

          {hovered && (
            <>
              <circle cx={x(hoverIndex!)} cy={y(hovered.income)} r={6} className="fill-white dark:fill-slate-900" />
              <circle cx={x(hoverIndex!)} cy={y(hovered.income)} r={4} fill="var(--slot-blue)" />
              <circle cx={x(hoverIndex!)} cy={y(hovered.expense)} r={6} className="fill-white dark:fill-slate-900" />
              <circle cx={x(hoverIndex!)} cy={y(hovered.expense)} r={4} fill="var(--slot-green)" />
            </>
          )}

          <text x={x(0)} y={height - 4} textAnchor="start" className="fill-slate-400 text-[10px] dark:fill-slate-600">
            {formatShortDate(data[0].date)}
          </text>
          <text x={x(data.length - 1)} y={height - 4} textAnchor="end" className="fill-slate-400 text-[10px] dark:fill-slate-600">
            {formatShortDate(data[data.length - 1].date)}
          </text>

          {data.map((d, i) => (
            <rect
              key={d.date}
              x={padLeft + (i / data.length) * plotW}
              y={padTop}
              width={plotW / data.length}
              height={plotH}
              fill="transparent"
              onPointerEnter={() => setHoverIndex(i)}
              onPointerLeave={() => setHoverIndex((cur) => (cur === i ? null : cur))}
            />
          ))}
        </svg>

        {hovered && hoverIndex !== null && (
          <div
            className="pointer-events-none absolute top-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md dark:border-slate-700 dark:bg-slate-800"
            style={{
              left: `${Math.min(85, Math.max(2, (x(hoverIndex) / width) * 100))}%`,
              transform: hoverIndex > data.length / 2 ? 'translateX(-100%)' : undefined,
            }}
          >
            <p className="mb-1 font-medium text-slate-700 dark:text-slate-200">{formatShortDate(hovered.date)}</p>
            <p className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="inline-block h-0.5 w-3 rounded-full" style={{ backgroundColor: 'var(--slot-blue)' }} />
              Ingresos <span className="ml-auto font-semibold tabular-nums text-slate-900 dark:text-slate-50">{formatCurrency(hovered.income)}</span>
            </p>
            <p className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="inline-block h-0.5 w-3 rounded-full" style={{ backgroundColor: 'var(--slot-green)' }} />
              Egresos <span className="ml-auto font-semibold tabular-nums text-slate-900 dark:text-slate-50">{formatCurrency(hovered.expense)}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-600">{text}</p>
}

function StatsTable({
  stats,
}: {
  stats: { appointmentsByStatus: AppointmentStatusCount[]; topServices: ServiceCount[]; cashFlowByDay: DailyCashFlow[] }
}) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="mb-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Citas por estado</caption>
          <thead>
            <tr className="text-xs text-slate-400 dark:text-slate-600">
              <th className="pb-2 font-normal">Estado</th>
              <th className="pb-2 text-right font-normal">Citas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats.appointmentsByStatus.map((row) => (
              <tr key={row.status}>
                <td className="py-1.5 text-slate-700 dark:text-slate-300">{STATUS_LABELS[row.status] ?? row.status}</td>
                <td className="py-1.5 text-right tabular-nums text-slate-900 dark:text-slate-50">{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="mb-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Servicios más solicitados</caption>
          <thead>
            <tr className="text-xs text-slate-400 dark:text-slate-600">
              <th className="pb-2 font-normal">Servicio</th>
              <th className="pb-2 text-right font-normal">Citas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats.topServices.map((row) => (
              <tr key={row.serviceName}>
                <td className="py-1.5 text-slate-700 dark:text-slate-300">{row.serviceName}</td>
                <td className="py-1.5 text-right tabular-nums text-slate-900 dark:text-slate-50">{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto lg:col-span-2">
        <table className="w-full text-left text-sm">
          <caption className="mb-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Flujo de caja diario</caption>
          <thead>
            <tr className="text-xs text-slate-400 dark:text-slate-600">
              <th className="pb-2 font-normal">Fecha</th>
              <th className="pb-2 text-right font-normal">Ingresos</th>
              <th className="pb-2 text-right font-normal">Egresos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats.cashFlowByDay.map((row) => (
              <tr key={row.date}>
                <td className="py-1.5 text-slate-700 dark:text-slate-300">{formatShortDate(row.date)}</td>
                <td className="py-1.5 text-right tabular-nums text-slate-900 dark:text-slate-50">{formatCurrency(row.income)}</td>
                <td className="py-1.5 text-right tabular-nums text-slate-900 dark:text-slate-50">{formatCurrency(row.expense)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
