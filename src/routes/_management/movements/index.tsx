import { useState } from 'react'
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
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Sheet, SheetTrigger } from '@/components/ui/sheet'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search, ArrowLeftRightIcon as ArrowMoveLeftRight02Icon, Filter, MoreVertical, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import { formatDate } from 'date-fns/format'
import { SheetApplication } from '@/components/management-forms'
import { toast } from 'sonner'

export const Route = createFileRoute('/_management/movements/')({
  component: RouteComponent,
})

type MovementType = 'transfer' | 'hospital' | 'court' | 'work_party' | 'release'

type Movement = {
  _id: Id<'recordMovements'>
  _creationTime: number
  inmateId: Id<'inmates'>
  movementType: MovementType
  departureDate: string
  returnDate?: string
  destination?: string
  reason: string
  fromPrisonId?: Id<'prisons'>
  toPrisonId?: Id<'prisons'>
  officerId?: Id<'officers'>
  notes?: string
}

const typeConfig: Record<MovementType, { label: string; dot: string; class: string }> = {
  transfer: { label: 'Transfer', dot: 'bg-violet-500', class: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400' },
  hospital: { label: 'Hospital', dot: 'bg-red-500', class: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400' },
  court: { label: 'Court', dot: 'bg-blue-500', class: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400' },
  work_party: { label: 'Work Party', dot: 'bg-amber-500', class: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400' },
  release: { label: 'Release', dot: 'bg-emerald-500', class: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400' },
}

function TypeBadge({ type }: { type: MovementType }) {
  const config = typeConfig[type]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', config.class)}>
      <span className={cn('size-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}

function RouteComponent() {
  const movements = useQuery(api.recordMovements.getAll)
  const inmates = useQuery(api.inmate.getAll)
  const prisons = useQuery(api.prisons.getAll)
  const recordReturn = useMutation(api.recordMovements.recordReturn)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [typeFilter, setTypeFilter] = useState('')

  const getInmateName = (id: Id<'inmates'>) => {
    const i = inmates?.find((x) => x._id === id)
    return i ? `${i.firstName} ${i.lastName}` : '—'
  }

  const getPrisonName = (id?: Id<'prisons'>) => {
    if (!id) return null
    return prisons?.find((p) => p._id === id)?.name ?? '—'
  }

  const columns: ColumnDef<Movement>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox checked={table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" className="translate-y-0.5" />
      ),
      cell: ({ row }) => (
        <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" className="translate-y-0.5" />
      ),
      enableSorting: false, enableHiding: false,
    },
    {
      accessorKey: 'inmateId',
      header: 'Inmate',
      cell: ({ row }) => (
        <span className="text-xs font-medium">{getInmateName(row.original.inmateId)}</span>
      ),
    },
    {
      accessorKey: 'movementType',
      header: 'Type',
      cell: ({ row }) => <TypeBadge type={row.original.movementType} />,
    },
    {
      accessorKey: 'departureDate',
      header: 'Departed',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatDate(row.original.departureDate, 'MMM dd, yyyy')}
        </span>
      ),
    },
    {
      accessorKey: 'returnDate',
      header: 'Returned',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {row.original.returnDate
            ? formatDate(row.original.returnDate, 'MMM dd, yyyy')
            : <span className="italic">Still out</span>}
        </span>
      ),
    },
    {
      id: 'route',
      header: 'Route / Destination',
      cell: ({ row }) => {
        const m = row.original
        if (m.movementType === 'transfer') {
          return (
            <span className="text-xs text-muted-foreground">
              {getPrisonName(m.fromPrisonId) ?? '—'} → {getPrisonName(m.toPrisonId) ?? '—'}
            </span>
          )
        }
        return <span className="text-xs text-muted-foreground">{m.destination ?? '—'}</span>
      },
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => (
        <span className="max-w-[200px] truncate block text-xs text-muted-foreground" title={row.original.reason}>
          {row.original.reason}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const m = row.original
        const isOpen = !m.returnDate && m.movementType !== 'release'
        return (
          <div className="flex items-center gap-1 justify-end">
            {isOpen && (
              <Button
                size="xs"
                variant="outline"
                className="gap-1 rounded text-xs"
                onClick={async () => {
                  const today = new Date().toISOString().split('T')[0]
                  await recordReturn({ id: m._id, returnDate: today })
                  toast.success("Return recorded")
                }}
              >
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5" />
                Record Return
              </Button>
            )}
            <Button variant="secondary" size="icon-xs" className="rounded-full">
              <HugeiconsIcon icon={MoreVertical} className="dualTone" />
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: movements ?? [],
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
  })

  const totalCount = movements?.length ?? 0
  const filteredCount = table.getFilteredRowModel().rows.length
  const openCount = movements?.filter((m) => !m.returnDate && m.movementType !== 'release').length ?? 0

  return (
    <article className="flex flex-col gap-5 py-5 md:max-w-5xl w-full mx-auto">
      <section className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Movements</h1>
          {openCount > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">
              <span className="font-medium text-indigo-600">{openCount}</span> open movement{openCount > 1 ? 's' : ''} — not yet returned
            </p>
          )}
        </div>
        <Sheet>
          <SheetTrigger className={cn(
            buttonVariants({ size: 'sm' }),
            "gap-2 shrink-0 ml-auto"
          )}>
            <HugeiconsIcon icon={ArrowMoveLeftRight02Icon} className="dualTone" />
            Record Movement
          </SheetTrigger>
          <SheetApplication defaultCategory="movement" />
        </Sheet>
      </section>

      <section className="flex flex-wrap items-center gap-2">
        <InputGroup className="relative w-full md:w-md">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search} className="h-4 w-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search by reason…"
            value={(table.getColumn('reason')?.getFilterValue() as string) ?? ''}
            onChange={(e) => table.getColumn('reason')?.setFilterValue(e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <p className="text-sm text-muted-foreground mt-0.5">
              {filteredCount === totalCount ? `${totalCount} results` : `${filteredCount} of ${totalCount}`}
            </p>
          </InputGroupAddon>
        </InputGroup>

        <div className="flex items-center gap-px ml-auto">
          <Select
            value={typeFilter}
            onValueChange={(v) => {
              const next = v === typeFilter ? '' : v
              setTypeFilter(next!!)
              table.getColumn('movementType')?.setFilterValue(next || undefined)
            }}
          >
            <SelectTrigger className={cn(
              buttonVariants({ size: 'xs', variant: 'secondary' }),
              typeFilter && 'ring-1 ring-inset ring-primary/40 bg-primary/5 text-primary'
            )}>
              <HugeiconsIcon icon={Filter} className="dualTone" />
              {typeFilter ? typeConfig[typeFilter as MovementType]?.label : 'Type'}
            </SelectTrigger>
            <SelectContent align="start">
              {Object.entries(typeConfig).map(([key, val]) => (
                <SelectItem key={key} value={key}>
                  <span className="flex items-center gap-2">
                    <span className={cn('size-1.5 rounded-full', val.dot)} />
                    {val.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

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
          <TableBody className="border-none">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}
                  className={cn('cursor-pointer transition-colors border border-dashed border-primary', row.getIsSelected() ? 'bg-sidebar' : 'bg-sidebar/55 hover:bg-sidebar')}
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
                  No movements match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
    </article>
  )
}