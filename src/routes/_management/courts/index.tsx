import { useState, useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from 'convex/_generated/api'
import { Id } from 'convex/_generated/dataModel'
import {
  ColumnDef, ColumnFiltersState, SortingState, VisibilityState,
  flexRender, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel, useReactTable,
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Search, Add01Icon, Delete02Icon, Edit01Icon,
  ArrowUpDown, Calendar03Icon, Building04Icon,
  CheckmarkCircle02Icon, Clock01Icon, AlertCircleIcon,
} from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import { SheetApplication } from '@/components/management-forms'
import { toast } from 'sonner'
import { format, isPast, isToday, isFuture } from 'date-fns'

export const Route = createFileRoute('/_management/courts/')({
  component: RouteComponent,
})

// ─── Types ────────────────────────────────────────────────────────────────────

type CourtType = 'magistrate' | 'high' | 'chief_magistrate' | 'industrial_court'
type CourtOutcome = 'adjourned' | 'convicted' | 'acquitted' | 'bail_granted' | 'remanded'

type Court = {
  _id: Id<'courts'>
  _creationTime: number
  name: string
  type?: CourtType
  district?: string
  address?: string
}

type Appearance = {
  _id: Id<'courtAppearances'>
  _creationTime: number
  inmateId: Id<'inmates'>
  courtId: Id<'courts'>
  officerId?: Id<'officers'>
  scheduledDate: string
  departureTime?: string
  returnTime?: string
  outcome?: CourtOutcome
  nextDate?: string
  notes?: string
}

// ─── Config ───────────────────────────────────────────────────────────────────

const courtTypeConfig: Record<CourtType, { label: string; color: string; badge: string }> = {
  magistrate: {
    label: 'Magistrate',
    color: 'bg-blue-400',
    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900',
  },
  chief_magistrate: {
    label: 'Chief Magistrate',
    color: 'bg-blue-500',
    badge: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  },
  high: {
    label: 'High Court',
    color: 'bg-blue-700',
    badge: 'bg-blue-100 text-blue-900 border-blue-400 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-700',
  },
  industrial_court: {
    label: 'Industrial Court',
    color: 'bg-indigo-500',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900',
  },
}

const outcomeConfig: Record<CourtOutcome, { label: string; class: string; dot: string }> = {
  adjourned: { label: 'Adjourned', dot: 'bg-amber-400', class: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400' },
  convicted: { label: 'Convicted', dot: 'bg-red-500', class: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400' },
  acquitted: { label: 'Acquitted', dot: 'bg-emerald-500', class: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400' },
  bail_granted: { label: 'Bail Granted', dot: 'bg-sky-400', class: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400' },
  remanded: { label: 'Remanded', dot: 'bg-orange-500', class: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400' },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CourtTypeBadge({ type }: { type: CourtType }) {
  const cfg = courtTypeConfig[type]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', cfg.badge)}>
      <span className={cn('size-1.5 rounded-full', cfg.color)} />
      {cfg.label}
    </span>
  )
}

function OutcomeBadge({ outcome }: { outcome: CourtOutcome }) {
  const cfg = outcomeConfig[outcome]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', cfg.class)}>
      <span className={cn('size-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  )
}

function SortableHeader({ label, column }: { label: string; column: any }) {
  return (
    <button
      type="button"
      className="flex items-center gap-1 hover:text-foreground transition-colors"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {label}
      <HugeiconsIcon icon={ArrowUpDown} className="size-3 opacity-60" />
    </button>
  )
}

// ─── Edit Court Sheet ─────────────────────────────────────────────────────────

function EditCourtSheet({ court, onClose }: { court: Court; onClose: () => void }) {
  const updateCourt = useMutation(api.courtAppearances.updateCourt)
  const [name, setName] = useState(court.name)
  const [type, setType] = useState<CourtType | ''>(court.type ?? '')
  const [district, setDistrict] = useState(court.district ?? '')
  const [address, setAddress] = useState(court.address ?? '')
  const [busy, setBusy] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name is required'); return }
    setBusy(true)
    try {
      await updateCourt({
        id: court._id,
        patch: {
          name: name.trim(),
          type: type || undefined,
          district: district.trim() || undefined,
          address: address.trim() || undefined,
        },
      })
      toast.success('Court updated')
      onClose()
    } catch (e: any) { toast.error(e.message) }
    setBusy(false)
  }

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-5 pt-5 pb-4 border-b border-border/60">
        <SheetTitle className="text-base font-semibold">Edit Court</SheetTitle>
        <p className="text-xs text-muted-foreground">{court.name}</p>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Court Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            placeholder="e.g. Kampala High Court"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Court Type</label>
          <Select value={type} onValueChange={(v) => setType(v as CourtType)}>
            <SelectTrigger className="h-9 rounded-md text-sm">
              {type ? <CourtTypeBadge type={type} /> : <span className="text-muted-foreground">Select type</span>}
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(courtTypeConfig) as [CourtType, any][]).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>
                  <span className="flex items-center gap-2">
                    <span className={cn('size-1.5 rounded-full', cfg.color)} />
                    {cfg.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">District</label>
            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
              placeholder="e.g. Kampala"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
              placeholder="Street / area"
            />
          </div>
        </div>
      </div>
      <div className="px-5 py-4 border-t border-border/60 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button className="flex-1" onClick={handleSave} disabled={busy}>
          {busy ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}

// ─── Record Outcome Sheet ─────────────────────────────────────────────────────

function RecordOutcomeSheet({
  appearance,
  inmateName,
  courtName,
  onClose,
}: {
  appearance: Appearance
  inmateName: string
  courtName: string
  onClose: () => void
}) {
  const recordOutcome = useMutation(api.courtAppearances.recordOutcome)
  const [outcome, setOutcome] = useState<CourtOutcome | ''>('')
  const [returnTime, setReturnTime] = useState('')
  const [nextDate, setNextDate] = useState('')
  const [notes, setNotes] = useState(appearance.notes ?? '')
  const [busy, setBusy] = useState(false)

  const handleSave = async () => {
    if (!outcome) { toast.error('Select an outcome'); return }
    setBusy(true)
    try {
      await recordOutcome({
        id: appearance._id,
        outcome,
        returnTime: returnTime || undefined,
        nextDate: nextDate || undefined,
        notes: notes.trim() || undefined,
      })
      toast.success('Outcome recorded')
      onClose()
    } catch (e: any) { toast.error(e.message) }
    setBusy(false)
  }

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-5 pt-5 pb-4 border-b border-border/60">
        <SheetTitle className="text-base font-semibold">Record Court Outcome</SheetTitle>
        <p className="text-xs text-muted-foreground">{inmateName} · {courtName}</p>
        <p className="text-xs text-muted-foreground">
          Scheduled: {format(new Date(appearance.scheduledDate), 'MMM dd, yyyy')}
        </p>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Outcome pills */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Outcome *</label>
          <div className="flex flex-wrap gap-1.5">
            {(Object.entries(outcomeConfig) as [CourtOutcome, any][]).map(([key, cfg]) => (
              <button
                key={key}
                type="button"
                onClick={() => setOutcome(key)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                  outcome === key ? cfg.class : 'border-border/60 text-muted-foreground hover:bg-muted'
                )}
              >
                <span className={cn('size-1.5 rounded-full', cfg.dot)} />
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Return time */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Return time</label>
          <input
            type="time"
            value={returnTime}
            onChange={(e) => setReturnTime(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
          />
        </div>

        {/* Next date (if adjourned or remanded) */}
        {(outcome === 'adjourned' || outcome === 'remanded') && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Next hearing date</label>
            <input
              type="date"
              value={nextDate}
              onChange={(e) => setNextDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="h-9 rounded-md border border-border bg-background px-3 text-sm"
            />
          </div>
        )}

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none"
            placeholder="Judge's remarks, bail conditions, etc."
          />
        </div>

        {outcome && (
          <div className={cn(
            'rounded-lg border px-3 py-2.5 text-xs',
            outcome === 'convicted' ? 'border-red-200 bg-red-50 text-red-800 dark:bg-red-950/30'
              : outcome === 'acquitted' ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30'
                : 'border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-950/30'
          )}>
            {outcome === 'convicted' && '⚠ Inmate status will be updated to Convict.'}
            {outcome === 'acquitted' && '✓ Inmate status will be updated to Released.'}
            {outcome === 'adjourned' && 'Inmate status will be set to Remand. Next court date will be updated.'}
            {outcome === 'remanded' && 'Inmate remains in custody. Status set to Remand.'}
            {outcome === 'bail_granted' && 'Record the bail conditions in the notes field.'}
          </div>
        )}
      </div>
      <div className="px-5 py-4 border-t border-border/60 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button className="flex-1" onClick={handleSave} disabled={busy || !outcome}>
          {busy ? 'Recording…' : 'Record Outcome'}
        </Button>
      </div>
    </div>
  )
}

// ─── Courts tab ───────────────────────────────────────────────────────────────

function CourtsTab() {
  const courts = useQuery(api.courtAppearances.getAllCourts)
  const appearances = useQuery(api.courtAppearances.getAll)

  const removeCourt = useMutation(api.courtAppearances.remove ?? (() => { }))

  // Appearance count per court
  const appearanceMap = useMemo(() => {
    const map = new Map<string, number>()
    if (!appearances) return map
    for (const a of appearances) {
      const key = a.courtId as string
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    return map
  }, [appearances])

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [typeFilter, setTypeFilter] = useState('')
  const [editCourt, setEditCourt] = useState<Court | null>(null)

  const columns: ColumnDef<Court>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableHeader label="Court Name" column={column} />,
      cell: ({ row }) => (
        <div className="min-w-[180px]">
          <p className="text-sm font-medium">{row.original.name}</p>
          {row.original.address && (
            <p className="text-xs text-muted-foreground mt-0.5">{row.original.address}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      filterFn: (row, _id, value) => row.original.type === value,
      cell: ({ row }) =>
        row.original.type
          ? <CourtTypeBadge type={row.original.type} />
          : <span className="text-xs text-muted-foreground italic">—</span>,
    },
    {
      accessorKey: 'district',
      header: ({ column }) => <SortableHeader label="District" column={column} />,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.district ?? '—'}</span>
      ),
    },
    {
      id: 'appearances',
      header: ({ column }) => <SortableHeader label="Appearances" column={column} />,
      sortingFn: (a, b) =>
        (appearanceMap.get(a.original._id) ?? 0) - (appearanceMap.get(b.original._id) ?? 0),
      cell: ({ row }) => {
        const count = appearanceMap.get(row.original._id) ?? 0
        return count > 0 ? (
          <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
            {count} appearance{count !== 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground italic">None yet</span>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const court = row.original
        const count = appearanceMap.get(court._id) ?? 0
        return (
          <div className="flex items-center gap-1 justify-end">
            <Button
              variant="outline"
              size="icon-xs"
              className="rounded-full"
              title="Edit"
              onClick={() => setEditCourt(court)}
            >
              <HugeiconsIcon icon={Edit01Icon} className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className={cn(
                'rounded-full',
                count > 0
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
              )}
              title={count > 0 ? `Used in ${count} appearance(s)` : 'Delete court'}
              onClick={async () => {
                if (count > 0) { toast.error(`Cannot delete — ${count} appearance(s) reference this court`); return }
                try {
                  await removeCourt({ id: court._id as any })
                  toast.success('Court deleted')
                } catch (e: any) { toast.error(e.message) }
              }}
            >
              <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: courts ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    initialState: { pagination: { pageSize: 20 } },
  })

  const totalCount = courts?.length ?? 0
  const filteredCount = table.getFilteredRowModel().rows.length

  return (
    <>
      {/* Stats strip */}
      {courts && courts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.entries(courtTypeConfig) as [CourtType, any][]).map(([key, cfg]) => {
            const count = courts.filter((c) => c.type === key).length
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  const next = typeFilter === key ? '' : key
                  setTypeFilter(next)
                  table.getColumn('type')?.setFilterValue(next || undefined)
                }}
                className={cn(
                  'rounded-xl border px-4 py-3 text-left transition-all',
                  typeFilter === key
                    ? cn('ring-1 ring-inset ring-primary/30', cfg.badge)
                    : 'border-border/60 bg-sidebar/50 hover:bg-sidebar'
                )}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={cn('size-2 rounded-full', cfg.color)} />
                  <span className="text-xs font-medium text-muted-foreground">{cfg.label}</span>
                </div>
                <p className="text-2xl font-bold tabular-nums">{count}</p>
              </button>
            )
          })}
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full md:w-md">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search} className="h-4 w-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search courts…"
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(e) => table.getColumn('name')?.setFilterValue(e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <p className="text-sm text-muted-foreground">
              {filteredCount === totalCount ? `${totalCount}` : `${filteredCount} of ${totalCount}`}
            </p>
          </InputGroupAddon>
        </InputGroup>

        <div className="flex items-center gap-1 ml-auto">
          {(Object.entries(courtTypeConfig) as [CourtType, any][]).map(([key, cfg]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                const next = typeFilter === key ? '' : key
                setTypeFilter(next)
                table.getColumn('type')?.setFilterValue(next || undefined)
              }}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
                typeFilter === key ? cfg.badge : 'border-border/60 text-muted-foreground hover:bg-muted'
              )}
            >
              <span className={cn('size-1.5 rounded-full', cfg.color)} />
              {cfg.label}
            </button>
          ))}
          {typeFilter && (
            <button
              type="button"
              onClick={() => { setTypeFilter(''); table.getColumn('type')?.setFilterValue(undefined) }}
              className="text-xs text-muted-foreground hover:text-foreground ml-1 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden">
        <Table className="border-separate border-spacing-y-1 border-none no-scrollbar">
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-transparent hover:bg-transparent border-none">
                {hg.headers.map((h) => (
                  <TableHead key={h.id} className="text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn('cursor-default transition-colors', row.getIsSelected() ? 'bg-sidebar' : 'bg-sidebar/55 hover:bg-sidebar')}
                >
                  {row.getVisibleCells().map((cell, i) => (
                    <TableCell key={cell.id} className={cn('py-3', i === 0 && 'rounded-l-xl', i === row.getVisibleCells().length - 1 && 'rounded-r-xl')}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-sm text-muted-foreground">
                  {typeFilter ? `No ${courtTypeConfig[typeFilter as CourtType]?.label} courts found.` : 'No courts registered yet.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground tabular-nums">
          Page <span className="font-medium text-foreground">{table.getState().pagination.pageIndex + 1}</span> of{' '}
          <span className="font-medium text-foreground">{table.getPageCount() || 1}</span>
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
        </div>
      </div>

      {/* Edit sheet */}
      <Sheet open={!!editCourt} onOpenChange={(o) => !o && setEditCourt(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          {editCourt && <EditCourtSheet court={editCourt} onClose={() => setEditCourt(null)} />}
        </SheetContent>
      </Sheet>
    </>
  )
}

// ─── Appearances tab ──────────────────────────────────────────────────────────

function AppearancesTab() {
  const appearances = useQuery(api.courtAppearances.getAll)
  const courts = useQuery(api.courtAppearances.getAllCourts)
  const inmates = useQuery(api.inmate.getAll)
  const officers = useQuery(api.officers.getAll)

  const [sorting, setSorting] = useState<SortingState>([{ id: 'scheduledDate', desc: false }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [statusFilter, setStatusFilter] = useState<'upcoming' | 'past' | 'pending' | ''>('')
  const [outcomeSheetData, setOutcomeSheetData] = useState<Appearance | null>(null)

  const courtMap = useMemo(() => new Map(courts?.map((c) => [c._id as string, c]) ?? []), [courts])
  const inmateMap = useMemo(() => new Map(inmates?.map((i) => [i._id as string, i]) ?? []), [inmates])
  const officerMap = useMemo(() => new Map(officers?.map((o) => [o._id as string, o]) ?? []), [officers])

  const getInmateName = (id: string) => {
    const i = inmateMap.get(id)
    return i ? `${i.firstName} ${i.lastName}` : '—'
  }

  const getCourtName = (id: string) => courtMap.get(id)?.name ?? '—'

  // Status-aware data filtered before table
  const filteredData = useMemo(() => {
    if (!appearances) return []
    const today = new Date().toISOString().split('T')[0]
    return appearances.filter((a) => {
      if (statusFilter === 'upcoming') return a.scheduledDate >= today && !a.outcome
      if (statusFilter === 'past') return a.scheduledDate < today
      if (statusFilter === 'pending') return !a.outcome
      return true
    })
  }, [appearances, statusFilter])

  const pendingCount = appearances?.filter((a) => !a.outcome).length ?? 0
  const upcomingCount = appearances?.filter((a) => {
    const today = new Date().toISOString().split('T')[0]
    return a.scheduledDate >= today && !a.outcome
  }).length ?? 0
  const todayCount = appearances?.filter((a) =>
    isToday(new Date(a.scheduledDate))
  ).length ?? 0

  const columns: ColumnDef<Appearance>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'scheduledDate',
      id: 'scheduledDate',
      header: ({ column }) => <SortableHeader label="Date" column={column} />,
      cell: ({ row }) => {
        const dateStr = row.original.scheduledDate
        const date = new Date(dateStr)
        const today_ = isToday(date)
        const past_ = isPast(date) && !today_
        return (
          <div className="min-w-[100px]">
            <p className={cn(
              'text-sm font-medium tabular-nums',
              today_ && 'text-primary font-semibold',
              past_ && !row.original.outcome && 'text-red-600'
            )}>
              {format(date, 'MMM dd, yyyy')}
            </p>
            {today_ && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary mt-0.5">
                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                Today
              </span>
            )}
            {past_ && !row.original.outcome && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-500 mt-0.5">
                <HugeiconsIcon icon={AlertCircleIcon} className="size-3" />
                Overdue
              </span>
            )}
          </div>
        )
      },
    },
    {
      id: 'inmate',
      header: 'Inmate',
      cell: ({ row }) => (
        <p className="text-sm font-medium">{getInmateName(row.original.inmateId as string)}</p>
      ),
    },
    {
      accessorKey: 'courtId',
      header: 'Court',
      cell: ({ row }) => {
        const court = courtMap.get(row.original.courtId as string)
        return (
          <div>
            <p className="text-sm">{court?.name ?? '—'}</p>
            {court?.type && (
              <div className="mt-0.5">
                <CourtTypeBadge type={court.type} />
              </div>
            )}
          </div>
        )
      },
    },
    {
      id: 'timing',
      header: 'Departure / Return',
      cell: ({ row }) => {
        const a = row.original
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
            {a.departureTime
              ? <span>{format(new Date(a.departureTime), 'HH:mm')}</span>
              : <span className="italic">—</span>}
            {a.returnTime && (
              <>
                <span className="opacity-40">→</span>
                <span>{format(new Date(a.returnTime), 'HH:mm')}</span>
              </>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'outcome',
      header: 'Outcome',
      cell: ({ row }) => {
        const outcome = row.original.outcome
        return outcome
          ? <OutcomeBadge outcome={outcome} />
          : (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <HugeiconsIcon icon={Clock01Icon} className="size-3.5" />
              Pending
            </span>
          )
      },
    },
    {
      id: 'nextDate',
      header: 'Next Hearing',
      cell: ({ row }) => {
        const nd = row.original.nextDate
        if (!nd) return <span className="text-xs text-muted-foreground italic">—</span>
        return (
          <span className={cn(
            'text-xs tabular-nums',
            isFuture(new Date(nd)) ? 'text-foreground' : 'text-muted-foreground line-through'
          )}>
            {format(new Date(nd), 'MMM dd, yyyy')}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const a = row.original
        const needsOutcome = !a.outcome
        return (
          <div className="flex items-center gap-1 justify-end">
            {needsOutcome && (
              <Button
                size="xs"
                variant="outline"
                className="gap-1 rounded text-xs whitespace-nowrap"
                onClick={() => setOutcomeSheetData(a)}
              >
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5" />
                Record Outcome
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    initialState: { pagination: { pageSize: 20 } },
  })

  const totalCount = filteredData.length
  const filteredCount = table.getFilteredRowModel().rows.length

  return (
    <>
      {/* Alert strip — today's appearances */}
      {todayCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <span className="size-2 rounded-full bg-primary animate-pulse shrink-0" />
          <p className="text-sm font-medium">
            {todayCount} court appearance{todayCount > 1 ? 's' : ''} scheduled for today
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full md:w-md">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search} className="h-4 w-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search by inmate name…"
            value={(table.getColumn('inmate')?.getFilterValue() as string) ?? ''}
            onChange={(e) => table.getColumn('inmate')?.setFilterValue(e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <p className="text-sm text-muted-foreground">
              {filteredCount === totalCount ? `${totalCount}` : `${filteredCount} of ${totalCount}`}
            </p>
          </InputGroupAddon>
        </InputGroup>

        <div className="flex items-center gap-1 ml-auto">
          {([
            { key: 'upcoming', label: 'Upcoming', count: upcomingCount },
            { key: 'pending', label: 'Pending outcome', count: pendingCount },
            { key: 'past', label: 'Past', count: null },
          ] as const).map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
                statusFilter === key
                  ? 'border-primary/30 bg-primary/5 text-primary'
                  : 'border-border/60 text-muted-foreground hover:bg-muted'
              )}
            >
              {label}
              {count != null && count > 0 && (
                <span className={cn(
                  'flex items-center justify-center size-4 rounded-full text-[10px] font-bold',
                  statusFilter === key ? 'bg-primary/20 text-primary' : 'bg-muted-foreground/20 text-muted-foreground'
                )}>
                  {count}
                </span>
              )}
            </button>
          ))}
          {statusFilter && (
            <button
              type="button"
              onClick={() => setStatusFilter('')}
              className="text-xs text-muted-foreground hover:text-foreground ml-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden">
        <Table className="border-separate border-spacing-y-1 border-none no-scrollbar">
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-transparent hover:bg-transparent border-none">
                {hg.headers.map((h) => (
                  <TableHead key={h.id} className="text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                const a = row.original
                const date = new Date(a.scheduledDate)
                const today_ = isToday(date)
                const overdue = isPast(date) && !today_ && !a.outcome
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={cn(
                      'cursor-default transition-colors',
                      today_ ? 'bg-primary/5 hover:bg-primary/8'
                        : overdue ? 'bg-red-50/50 hover:bg-red-50 dark:bg-red-950/10 dark:hover:bg-red-950/20'
                          : row.getIsSelected() ? 'bg-sidebar' : 'bg-sidebar/55 hover:bg-sidebar'
                    )}
                  >
                    {row.getVisibleCells().map((cell, i) => (
                      <TableCell key={cell.id} className={cn('py-3', i === 0 && 'rounded-l-xl', i === row.getVisibleCells().length - 1 && 'rounded-r-xl')}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-sm text-muted-foreground">
                  {statusFilter ? 'No appearances match this filter.' : 'No court appearances recorded yet.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground tabular-nums">
          Page <span className="font-medium text-foreground">{table.getState().pagination.pageIndex + 1}</span> of{' '}
          <span className="font-medium text-foreground">{table.getPageCount() || 1}</span>
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
        </div>
      </div>

      {/* Outcome sheet */}
      <Sheet open={!!outcomeSheetData} onOpenChange={(o) => !o && setOutcomeSheetData(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          {outcomeSheetData && (
            <RecordOutcomeSheet
              appearance={outcomeSheetData}
              inmateName={getInmateName(outcomeSheetData.inmateId as string)}
              courtName={getCourtName(outcomeSheetData.courtId as string)}
              onClose={() => setOutcomeSheetData(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

// ─── Route component ──────────────────────────────────────────────────────────

function RouteComponent() {
  const courts = useQuery(api.courtAppearances.getAllCourts)
  const appearances = useQuery(api.courtAppearances.getAll)

  const totalCourts = courts?.length ?? 0
  const totalAppearances = appearances?.length ?? 0
  const pendingOutcomes = appearances?.filter((a) => !a.outcome).length ?? 0

  return (
    <article className="flex flex-col gap-5 py-5 md:max-w-5xl w-full mx-auto">

      {/* Header */}
      <section className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">Courts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalCourts} court{totalCourts !== 1 ? 's' : ''} · {totalAppearances} appearance{totalAppearances !== 1 ? 's' : ''}
            {pendingOutcomes > 0 && (
              <span className="ml-1.5">
                · <span className="font-medium text-amber-600">{pendingOutcomes} pending outcome{pendingOutcomes > 1 ? 's' : ''}</span>
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Sheet>
            <SheetTrigger className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'gap-2')}>
              <HugeiconsIcon icon={Building04Icon} className="dualTone" />
              Add Court
            </SheetTrigger>
            <SheetApplication defaultCategory="court" />
          </Sheet>
          <Sheet>
            <SheetTrigger className={cn(buttonVariants({ size: 'sm' }), 'gap-2')}>
              <HugeiconsIcon icon={Calendar03Icon} className="dualTone" />
              Schedule Appearance
            </SheetTrigger>
            <SheetApplication defaultCategory="court-appearance" />
          </Sheet>
        </div>
      </section>

      {/* Two-tab layout */}
      <Tabs defaultValue="courts">
        <TabsList className="w-full">
          <TabsTrigger value="courts" className="flex-1 gap-2">
            <HugeiconsIcon icon={Building04Icon} className="size-4" />
            Courts
            {totalCourts > 0 && (
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {totalCourts}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="appearances" className="flex-1 gap-2">
            <HugeiconsIcon icon={Calendar03Icon} className="size-4" />
            Appearances
            {pendingOutcomes > 0 && (
              <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                {pendingOutcomes}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courts" className="mt-5 flex flex-col gap-5">
          <CourtsTab />
        </TabsContent>
        <TabsContent value="appearances" className="mt-5 flex flex-col gap-5">
          <AppearancesTab />
        </TabsContent>
      </Tabs>

    </article>
  )
}