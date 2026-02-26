import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import { formatDate } from 'date-fns/format'
import { cn } from '@/lib/utils'
import { Sheet, SheetTrigger } from '@/components/ui/sheet'
import { Link } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  UserAdd01Icon,
  Building01Icon,
  UserMultiple02Icon,
  ArrowLeftRight as ArrowMoveLeftRight02Icon,
  JusticeScale01Icon as JusticeHammerIcon,
  UserWarning01Icon as WarningDiamondIcon,
  UserShield01Icon,
  ArrowRight01Icon,
  AlertDiamondIcon,
  TrendingUp as TrendingUp01Icon,
  TrendingDown as TrendingDown01Icon,
} from '@hugeicons/core-free-icons'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { SheetApplication, type SheetCategory } from '@/components/management-forms'

export const Route = createFileRoute('/_management/')({
  component: RouteComponent,
})

// ─── Derived helpers ──────────────────────────────────────────────────────────

function groupByMonth<T extends { _creationTime: number }>(items: T[]) {
  const months: Record<string, number> = {}
  items.forEach((item) => {
    const key = formatDate(new Date(item._creationTime), 'MMM')
    months[key] = (months[key] ?? 0) + 1
  })
  const ordered = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentMonth = new Date().getMonth()
  return ordered
    .slice(Math.max(0, currentMonth - 5), currentMonth + 1)
    .map((m) => ({ month: m, count: months[m] ?? 0 }))
}

function groupByField<T>(items: T[], key: keyof T): { name: string; value: number }[] {
  const counts: Record<string, number> = {}
  items.forEach((item) => {
    const val = String(item[key] ?? 'unknown')
    counts[val] = (counts[val] ?? 0) + 1
  })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  remand: 'hsl(43 96% 56%)',
  convict: 'hsl(0 72% 51%)',
  at_court: 'hsl(217 91% 60%)',
  released: 'hsl(142 71% 45%)',
  transferred: 'hsl(270 67% 62%)',
  escaped: 'hsl(25 95% 53%)',
  deceased: 'hsl(220 9% 60%)',
}

const TYPE_COLORS: Record<string, string> = {
  remand: 'hsl(43 96% 56%)',
  convict: 'hsl(0 72% 51%)',
  civil: 'hsl(217 91% 60%)',
}

const MOVEMENT_COLORS: Record<string, string> = {
  transfer: 'hsl(270 67% 62%)',
  hospital: 'hsl(0 72% 51%)',
  court: 'hsl(217 91% 60%)',
  work_party: 'hsl(43 96% 56%)',
  release: 'hsl(142 71% 45%)',
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon, iconClass, bgClass, trend, trendLabel,
}: {
  label: string
  value: number | string
  sub?: string
  icon: any
  iconClass: string
  bgClass: string
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
}) {
  return (
    <div className="relative rounded-xl min-w-52 border border-border/60 bg-sidebar p-4 flex flex-col gap-3">
      <div className="pointer-events-none absolute inset-0 opacity-[0.025] rounded-xl bg-[repeating-linear-gradient(0deg,currentColor_0px,currentColor_1px,transparent_1px,transparent_12px),repeating-linear-gradient(90deg,currentColor_0px,currentColor_1px,transparent_1px,transparent_12px)]" />
      <div className="flex items-start justify-between gap-2">
        <span className={cn('rounded-lg p-2 shrink-0', bgClass)}>
          <HugeiconsIcon icon={icon} className={cn('size-4', iconClass)} />
        </span>
        {trend && trendLabel && (
          <span className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            trend === 'up' && 'bg-emerald-500/10 text-emerald-600',
            trend === 'down' && 'bg-red-500/10 text-red-600',
            trend === 'neutral' && 'bg-muted text-muted-foreground',
          )}>
            <HugeiconsIcon
              icon={trend === 'down' ? TrendingDown01Icon : TrendingUp01Icon}
              className="size-3"
            />
            {trendLabel}
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold tabular-nums tracking-tight leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
        {sub && <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Chart card ───────────────────────────────────────────────────────────────
// NOTE: no overflow-hidden — that's what collapses ResponsiveContainer to -1px

function ChartCard({ title, sub, children, className }: {
  title: string
  sub?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('rounded-xl border border-border/60 bg-sidebar', className)}>
      <div className="px-5 pt-5 pb-3">
        <p className="text-sm font-semibold tracking-tight">{title}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  )
}

// ─── List card ────────────────────────────────────────────────────────────────

function ListCard({ title, viewHref, children }: {
  title: string
  viewHref: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-sidebar flex flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <p className="text-sm font-semibold tracking-tight">{title}</p>
        <Link
          to={viewHref}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        >
          View all
        </Link>
      </div>
      <div className="divide-y divide-border/50 flex-1">
        {children}
      </div>
    </div>
  )
}

// ─── Quick action ─────────────────────────────────────────────────────────────

function QuickAction({ label, icon, iconClass, bgClass, category }: {
  label: string
  icon: any
  iconClass: string
  bgClass: string
  category: SheetCategory
}) {
  return (
    <Sheet>
      <SheetTrigger className={'"group flex items-center gap-3 rounded-lg border border-border/60 bg-sidebar/50 px-3 py-2.5 hover:bg-sidebar hover:border-border transition-all text-left w-full"'}>
        <span className={cn('rounded-md p-1.5 shrink-0', bgClass)}>
          <HugeiconsIcon icon={icon} className={cn('size-3.5', iconClass)} />
        </span>
        <span className="text-xs font-medium flex-1">{label}</span>
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          className="size-3.5 text-muted-foreground/50 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all"
        />
      </SheetTrigger>
      <SheetApplication defaultCategory={category} />
    </Sheet>
  )
}

// ─── Custom tooltips ──────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="size-1.5 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name.replace('_', ' ')}</span>
          <span className="font-mono font-medium ml-auto pl-4">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
      <div className="flex items-center gap-2">
        <span className="size-1.5 rounded-full shrink-0" style={{ background: item.payload.fill }} />
        <span className="font-medium capitalize">{item.name.replace('_', ' ')}</span>
        <span className="font-mono font-medium ml-4">{item.value}</span>
      </div>
    </div>
  )
}

function LegendStrip({ items }: { items: { name: string; color: string; value: number }[] }) {
  const total = items.reduce((s, i) => s + i.value, 0)
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-5 pb-4">
      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-1.5">
          <span className="size-2 rounded-sm shrink-0" style={{ background: item.color }} />
          <span className="text-xs text-muted-foreground capitalize">{item.name.replace('_', ' ')}</span>
          <span className="text-xs font-mono font-medium">{item.value}</span>
          <span className="text-xs text-muted-foreground/60">
            ({total ? Math.round((item.value / total) * 100) : 0}%)
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Status pill ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  remand: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400',
  convict: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400',
  at_court: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400',
  released: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400',
  transferred: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400',
  escaped: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400',
  deceased: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400',
  scheduled: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400',
  checked_in: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  transfer: 'bg-violet-50 text-violet-700 border-violet-200',
  hospital: 'bg-red-50 text-red-700 border-red-200',
  court: 'bg-blue-50 text-blue-700 border-blue-200',
  work_party: 'bg-amber-50 text-amber-700 border-amber-200',
  release: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium capitalize shrink-0',
      STATUS_STYLES[status] ?? 'bg-muted text-muted-foreground border-border',
    )}>
      {status.replace('_', ' ')}
    </span>
  )
}

// ─── Capacity bar ─────────────────────────────────────────────────────────────

function CapacityBar({ used, total }: { used: number; total: number }) {
  const pct = total ? Math.min(100, Math.round((used / total) * 100)) : 0
  const color = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 rounded-full bg-muted">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground shrink-0">{pct}%</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function RouteComponent() {
  const inmates = useQuery(api.inmate.getAll)
  const visits = useQuery(api.inmateVisits.getAll)
  const movements = useQuery(api.recordMovements.getAll)
  const prisons = useQuery(api.prisons.getAll)
  const officers = useQuery(api.officers.getAll)
  const appearances = useQuery(api.courtAppearances.getAll)

  const loading = !inmates || !visits || !movements || !prisons || !officers || !appearances

  // ── Counts ──
  const totalInmates = inmates?.length ?? 0
  const onRemand = inmates?.filter((i) => i.inmateType === 'remand').length ?? 0
  const convicted = inmates?.filter((i) => i.inmateType === 'convict').length ?? 0
  const escaped = inmates?.filter((i) => i.status === 'escaped').length ?? 0
  const atCourt = inmates?.filter((i) => i.status === 'at_court').length ?? 0
  const visitorsInside = visits?.filter((v) => v.status === 'checked_in').length ?? 0
  const scheduledVisits = visits?.filter((v) => v.status === 'scheduled').length ?? 0
  const openMovements = movements?.filter((m) => !m.returnDate).length ?? 0
  const activePrisons = prisons?.filter((p) => p.isActive !== false).length ?? 0

  // ── Chart data ──
  const admissionsOverTime = groupByMonth(inmates ?? [])
  const visitsTrend = groupByMonth(visits ?? [])

  const statusDist = groupByField(inmates ?? [], 'status').map((d) => ({
    ...d, fill: STATUS_COLORS[d.name] ?? 'hsl(220 9% 60%)',
  }))

  const typeDist = groupByField(inmates ?? [], 'inmateType').map((d) => ({
    ...d, fill: TYPE_COLORS[d.name] ?? 'hsl(220 9% 60%)',
  }))

  const movementDist = groupByField(movements ?? [], 'movementType').map((d) => ({
    ...d, fill: MOVEMENT_COLORS[d.name] ?? 'hsl(220 9% 60%)',
  }))

  const prisonOccupancy = (prisons ?? [])
    .filter((p) => p.capacity)
    .map((p) => ({
      name: p.code,
      fullName: p.name,
      inmates: (inmates ?? []).filter((i) => i.prisonId === p._id).length,
      capacity: p.capacity!,
    }))
    .sort((a, b) => b.inmates - a.inmates)
    .slice(0, 6)

  const recentInmates = [...(inmates ?? [])]
    .sort((a, b) => b._creationTime - a._creationTime)
    .slice(0, 6)

  const today = new Date().toISOString().split('T')[0]
  const upcomingAppearances = (appearances ?? [])
    .filter((a) => a.scheduledDate >= today && !a.outcome)
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
    .slice(0, 5)

  const activeVisits = (visits ?? []).filter((v) => v.status === 'checked_in').slice(0, 5)

  return (
    <article className="flex flex-col gap-5 py-5 md:max-w-5xl w-full mx-auto">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatDate(new Date(), 'EEEE, MMMM d yyyy')}
          </p>
        </div>
        <span className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs',
          loading
            ? 'border-border text-muted-foreground'
            : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400',
        )}>
          <span className={cn(
            'size-1.5 rounded-full',
            loading ? 'bg-muted-foreground animate-pulse' : 'bg-emerald-500',
          )} />
          {loading ? 'Loading…' : 'Live'}
        </span>
      </header>

      {/* ── Escaped alert ── */}
      {escaped > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 dark:border-orange-800 dark:bg-orange-950/20">
          <HugeiconsIcon icon={AlertDiamondIcon} className="size-4 text-orange-600 shrink-0" />
          <p className="text-sm font-medium text-orange-800 dark:text-orange-400 flex-1">
            {escaped} escaped inmate{escaped > 1 ? 's' : ''} on record — immediate review required
          </p>
          <Link to="/inmates" className="text-xs text-orange-700 underline underline-offset-2 shrink-0">
            Review →
          </Link>
        </div>
      )}

      {/* ── Stat cards ── */}
      <section className="flex flex-wrap items-center gap-3">
        <StatCard
          label="Total Inmates"
          value={totalInmates}
          sub={`${onRemand} remand · ${convicted} convicted`}
          icon={UserAdd01Icon}
          iconClass="text-rose-600"
          bgClass="bg-rose-500/10"
          trend="up"
          trendLabel="+3 this week"
        />
        <StatCard
          label="Visitors Inside"
          value={visitorsInside}
          sub={`${scheduledVisits} scheduled`}
          icon={UserMultiple02Icon}
          iconClass="text-sky-600"
          bgClass="bg-sky-500/10"
        />
        <StatCard
          label="Open Movements"
          value={openMovements}
          sub={`${atCourt} currently at court`}
          icon={ArrowMoveLeftRight02Icon}
          iconClass="text-indigo-600"
          bgClass="bg-indigo-500/10"
        />
        <StatCard
          label="Active Facilities"
          value={activePrisons}
          sub={`${officers?.length ?? 0} officers · ${prisons?.length ?? 0} total`}
          icon={Building01Icon}
          iconClass="text-violet-600"
          bgClass="bg-violet-500/10"
        />
      </section>

      {/* ── Admissions + Status donut ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ChartCard title="Admissions" sub="New inmates — past 6 months" className="md:col-span-2">
          {/* key fix: explicit min-h, no overflow-hidden on parent */}
          <div style={{ minHeight: 208 }} className="px-2 pb-4 w-full">
            <ResponsiveContainer width="100%" height={208}>
              <AreaChart data={admissionsOverTime}
                margin={{
                  top: 4,
                  right: 16,
                  left: -20,
                  bottom: 0
                }}>
                <defs>
                  <linearGradient id="admGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0 72% 51%)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(0 72% 51%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.4} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="admissions" stroke="hsl(0 72% 51%)" strokeWidth={2} fill="url(#admGrad)" dot={{ fill: 'hsl(0 72% 51%)', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Status Split" sub="Current inmate distribution">
          <div style={{ minHeight: 176 }} className="px-2 w-full">
            <ResponsiveContainer width="100%" height={176}>
              <PieChart>
                <Pie data={statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="55%" outerRadius="78%" paddingAngle={2} strokeWidth={0}>
                  {statusDist.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <LegendStrip items={statusDist.map((d) => ({ name: d.name, color: d.fill, value: d.value }))} />
        </ChartCard>
      </section>

      {/* ── Prison occupancy + Movement breakdown ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ChartCard title="Prison Occupancy" sub="Inmates vs capacity per facility">
          <div className="px-5 pb-5 space-y-3">
            {prisonOccupancy.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">No facilities with capacity set</p>
            ) : (
              prisonOccupancy.map((p) => (
                <div key={p.name} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-mono font-medium bg-muted rounded px-1.5 py-0.5 shrink-0">{p.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{p.fullName}</span>
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground shrink-0">{p.inmates}/{p.capacity}</span>
                  </div>
                  <CapacityBar used={p.inmates} total={p.capacity} />
                </div>
              ))
            )}
          </div>
        </ChartCard>

        <ChartCard title="Movement Breakdown" sub="All recorded movements by type">
          <div style={{ minHeight: 208 }} className="px-2 pb-2 w-full">
            <ResponsiveContainer width="100%" height={208}>
              <BarChart data={movementDist} margin={{ top: 4, right: 16, left: -20, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.4} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v) => v.replace('_', ' ')} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="movements" radius={[4, 4, 0, 0]}>
                  {movementDist.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>

      {/* ── Inmate types donut + Visits trend ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ChartCard title="Inmate Types" sub="Remand vs convict vs civil">
          <div style={{ minHeight: 160 }} className="px-2 w-full">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={typeDist} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="50%" outerRadius="72%" paddingAngle={2} strokeWidth={0}>
                  {typeDist.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <LegendStrip items={typeDist.map((d) => ({ name: d.name, color: d.fill, value: d.value }))} />
        </ChartCard>

        <ChartCard title="Visit Activity" sub="Scheduled visits per month" className="md:col-span-2">
          <div style={{ minHeight: 176 }} className="px-2 pb-4 w-full">
            <ResponsiveContainer width="100%" height={176}>
              <AreaChart data={visitsTrend} margin={{
                top: 4,
                right: 16,
                left: -20,
                bottom: 0
              }}>
                <defs>
                  <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.4} />
                <XAxis dataKey="month" tick={{
                  fontSize: 11,
                  fill: 'hsl(var(--muted-foreground))',
                  color: 'hsl(var(--primary))'
                }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: 'hsl(var(--muted-foreground))'
                  }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="visits" stroke="hsl(217 91% 60%)" strokeWidth={2} fill="url(#visitGrad)" dot={{ fill: 'hsl(217 91% 60%)', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>

      {/* ── Lists + Quick actions ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold tracking-tight">Quick Actions</p>
          <div className="flex flex-col gap-1.5">
            <QuickAction label="Add Inmate" icon={UserAdd01Icon} iconClass="text-rose-600" bgClass="bg-rose-500/10" category="inmate" />
            <QuickAction label="Schedule Visit" icon={UserMultiple02Icon} iconClass="text-sky-600" bgClass="bg-sky-500/10" category="visitor" />
            <QuickAction label="Record Movement" icon={ArrowMoveLeftRight02Icon} iconClass="text-indigo-600" bgClass="bg-indigo-500/10" category="movement" />
            <QuickAction label="Add Officer" icon={UserShield01Icon} iconClass="text-teal-600" bgClass="bg-teal-500/10" category="officer" />
            <QuickAction label="Add Prison" icon={Building01Icon} iconClass="text-violet-600" bgClass="bg-violet-500/10" category="prison" />
            <QuickAction label="Add Offense" icon={WarningDiamondIcon} iconClass="text-amber-600" bgClass="bg-amber-500/10" category="offense" />
          </div>
        </div>

        <ListCard title="Upcoming Appearances" viewHref="/court-appearances">
          {upcomingAppearances.length === 0 ? (
            <div className="h-20 flex items-center justify-center text-xs text-muted-foreground">
              No upcoming appearances
            </div>
          ) : (
            upcomingAppearances.map((a) => {
              const inmate = inmates?.find((i) => i._id === a.inmateId)
              return (
                <div key={a._id} className="flex items-center gap-3 px-4 py-3">
                  <HugeiconsIcon icon={JusticeHammerIcon} className="size-3.5 text-blue-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">
                      {inmate ? `${inmate.firstName} ${inmate.lastName}` : 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground tabular-nums">{a.scheduledDate}</p>
                  </div>
                </div>
              )
            })
          )}
        </ListCard>

        <ListCard title="Visitors Inside Now" viewHref="/visits">
          {activeVisits.length === 0 ? (
            <div className="h-20 flex items-center justify-center text-xs text-muted-foreground">
              No visitors currently inside
            </div>
          ) : (
            activeVisits.map((visit) => {
              const inmate = inmates?.find((i) => i._id === visit.inmateId)
              return (
                <div key={visit._id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{visit.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      → {inmate ? `${inmate.firstName} ${inmate.lastName}` : '—'}
                    </p>
                  </div>
                  <StatusPill status="checked_in" />
                </div>
              )
            })
          )}
        </ListCard>
      </section>

      {/* ── Recent admissions ── */}
      <section>
        <ListCard title="Recent Admissions" viewHref="/inmates">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {recentInmates.length === 0 ? (
              <div className="h-20 col-span-2 flex items-center justify-center text-xs text-muted-foreground">
                No inmates yet
              </div>
            ) : (
              recentInmates.map((inmate) => (
                <div key={inmate._id} className="flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-b-0">
                  <div className="size-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                    {inmate.firstName[0]}{inmate.lastName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{inmate.firstName} {inmate.lastName}</p>
                    <p className="font-mono text-xs text-muted-foreground">{inmate.prisonNumber}</p>
                  </div>
                  <StatusPill status={inmate.status} />
                </div>
              ))
            )}
          </div>
        </ListCard>
      </section>

    </article>
  )
}