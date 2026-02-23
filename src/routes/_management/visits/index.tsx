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
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Sheet, SheetTrigger } from '@/components/ui/sheet'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search, UserPlus, StatusIcon, MoreVertical, Login01Icon, Logout01Icon } from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import { formatDate } from 'date-fns/format'
import { toast } from 'sonner'
import { SheetApplication } from '@/components/management-forms'

export const Route = createFileRoute('/_management/visits/')({
  component: RouteComponent,
})

type VisitStatus = 'scheduled' | 'checked_in' | 'completed' | 'denied' | 'cancelled'

type Visit = {
  _id: Id<'inmateVisits'>
  _creationTime: number
  inmateId: Id<'inmates'>
  prisonId: Id<'prisons'>
  fullName: string
  idNumber: string
  relationship: string
  phone: string
  status: VisitStatus
  scheduledDate?: string
  checkInTime?: string
  checkOutTime?: string
  flagged?: boolean
}

const statusConfig: Record<VisitStatus, { label: string; dot: string; class: string }> = {
  scheduled: { label: 'Scheduled', dot: 'bg-sky-500', class: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800' },
  checked_in: { label: 'Inside', dot: 'bg-emerald-500', class: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400' },
  completed: { label: 'Completed', dot: 'bg-zinc-400', class: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400' },
  denied: { label: 'Denied', dot: 'bg-red-500', class: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400' },
  cancelled: { label: 'Cancelled', dot: 'bg-orange-500', class: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400' },
}

function StatusBadge({ status }: { status?: VisitStatus }) {
  const config = status ? statusConfig[status] : null
  if (!config) return <Badge variant="outline" className="text-xs">Unknown</Badge>
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', config.class)}>
      <span className={cn('size-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}

function RouteComponent() {
  const visits = useQuery(api.inmateVisits.getAll)
  const inmates = useQuery(api.inmate.getAll)
  const checkIn = useMutation(api.inmateVisits.checkIn)
  const checkOut = useMutation(api.inmateVisits.checkOut)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [statusFilter, setStatusFilter] = useState('')

  const getInmateName = (id: Id<'inmates'>) => {
    const i = inmates?.find((x) => x._id === id)
    return i ? `${i.firstName} ${i.lastName}` : '—'
  }

  const columns: ColumnDef<Visit>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all" className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" className="translate-y-0.5" />
      ),
      enableSorting: false, enableHiding: false,
    },
    {
      accessorKey: 'fullName',
      header: 'Visitor',
      cell: ({ row }) => (
        <div>
          <p className="text-xs font-medium">{row.original.fullName}</p>
          <p className="text-xs text-muted-foreground">{row.original.relationship}</p>
        </div>
      ),
    },
    {
      accessorKey: 'inmateId',
      header: 'Inmate',
      cell: ({ row }) => (
        <span className="text-xs">{getInmateName(row.original.inmateId)}</span>
      ),
    },
    {
      accessorKey: 'idNumber',
      header: 'ID Number',
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs rounded">{row.original.idNumber}</Badge>
      ),
    },
    {
      accessorKey: 'scheduledDate',
      header: 'Scheduled',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {row.original.scheduledDate
            ? formatDate(row.original.scheduledDate, 'MMM dd, yyyy')
            : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'checkInTime',
      header: 'Check-in',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {row.original.checkInTime ?? '—'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'flagged',
      header: 'Flag',
      cell: ({ row }) => row.original.flagged
        ? <Badge variant="destructive" className="text-xs rounded">Flagged</Badge>
        : null,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const v = row.original
        const now = new Date().toTimeString().slice(0, 5)
        return (
          <div className="flex items-center gap-1 justify-end">
            {v.status === 'scheduled' && (
              <Button
                size="xs"
                variant="outline"
                className="gap-1 rounded text-xs"
                onClick={async () => {
                  await checkIn({ id: v._id, checkInTime: now })
                  toast.success("Visitor checked in")
                }}
              >
                <HugeiconsIcon icon={Login01Icon} className="size-3.5" />
                Check In
              </Button>
            )}
            {v.status === 'checked_in' && (
              <Button
                size="xs"
                variant="outline"
                className="gap-1 rounded text-xs"
                onClick={async () => {
                  await checkOut({ id: v._id, checkOutTime: now })
                  toast.success("Visitor checked out")
                }}
              >
                <HugeiconsIcon icon={Logout01Icon} className="size-3.5" />
                Check Out
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
    data: visits ?? [],
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

  const totalCount = visits?.length ?? 0
  const filteredCount = table.getFilteredRowModel().rows.length
  const insideCount = visits?.filter((v) => v.status === 'checked_in').length ?? 0

  return (
    <article className="flex flex-col gap-5 py-5 md:max-w-5xl w-full mx-auto">
      <section className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Visits</h1>
          {insideCount > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">
              <span className="font-medium text-emerald-600">{insideCount}</span> visitor{insideCount > 1 ? 's' : ''} currently inside
            </p>
          )}
        </div>
        <Sheet>
          <SheetTrigger>
            <Button size="sm" className="gap-2 shrink-0 ml-auto">
              <HugeiconsIcon icon={UserPlus} className="dualTone" />
              Schedule Visit
            </Button>
          </SheetTrigger>
          <SheetApplication defaultCategory="visitor" />
        </Sheet>
      </section>

      <section className="flex flex-wrap items-center gap-2">
        <InputGroup className="relative w-full md:w-md">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search} className="h-4 w-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search by visitor name…"
            value={(table.getColumn('fullName')?.getFilterValue() as string) ?? ''}
            onChange={(e) => table.getColumn('fullName')?.setFilterValue(e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <p className="text-sm text-muted-foreground mt-0.5">
              {filteredCount === totalCount ? `${totalCount} results` : `${filteredCount} of ${totalCount}`}
            </p>
          </InputGroupAddon>
        </InputGroup>

        <div className="flex items-center gap-px ml-auto">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              const next = v === statusFilter ? '' : v
              setStatusFilter(next!!)
              table.getColumn('status')?.setFilterValue(next || undefined)
            }}
          >
            <SelectTrigger className={cn(
              buttonVariants({ size: 'xs', variant: 'secondary' }),
              statusFilter && 'ring-1 ring-inset ring-primary/40 bg-primary/5 text-primary'
            )}>
              <HugeiconsIcon icon={StatusIcon} className="dualTone" />
              {statusFilter ? statusConfig[statusFilter as VisitStatus]?.label : 'Status'}
            </SelectTrigger>
            <SelectContent align="start">
              {Object.entries(statusConfig).map(([key, val]) => (
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(
                    'cursor-pointer transition-colors border border-dashed border-primary',
                    row.getIsSelected() ? 'bg-sidebar' : 'bg-sidebar/55 hover:bg-sidebar'
                  )}
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
                  No visits match the current filters.
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