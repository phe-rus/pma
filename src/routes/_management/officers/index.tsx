import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
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
import { Search, UserShield01Icon, Filter, MoreVertical, Trash2 as Trash01Icon, AlertCircle, Power as PowerSquareIcon, PowerOff as PowerOffSquareIcon } from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import { SheetApplication } from '@/components/management-forms'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export const Route = createFileRoute('/_management/officers/')({
  component: RouteComponent,
})

type Officer = {
  _id: Id<'officers'>
  _creationTime: number
  name: string
  badgeNumber: string
  rank?: string
  phone?: string
  prisonId: Id<'prisons'>
  isActive?: boolean
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

function avatarColor(id: string) {
  const colors = ['bg-teal-100 text-teal-700', 'bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700', 'bg-rose-100 text-rose-700', 'bg-amber-100 text-amber-700']
  return colors[id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length]
}

function RouteComponent() {
  const officers = useQuery(api.officers.getAll)
  const prisons = useQuery(api.prisons.getAll)
  const handleUpdate = useMutation(api.officers.update)
  const handleDelete = useMutation(api.officers.remove)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [prisonFilter, setPrisonFilter] = useState('')

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [officerToDelete, setOfficerToDelete] = useState<Officer | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const getPrisonName = (id: Id<'prisons'>) => prisons?.find((p) => p._id === id)?.name ?? '—'

  const handleToggleActive = async (officer: Officer) => {
    setIsProcessing(true)
    try {
      await handleUpdate({
        id: officer._id,
        patch: {
          isActive: !officer.isActive
        }
      })
    } catch (error) {
      console.error('Failed to update officer status:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteClick = (officer: Officer) => {
    setOfficerToDelete(officer)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!officerToDelete) return

    setIsProcessing(true)
    try {
      await handleDelete({ id: officerToDelete._id })
      setDeleteDialogOpen(false)
      setOfficerToDelete(null)
    } catch (error) {
      console.error('Failed to delete officer:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkDelete = async () => {
    const selectedRows = table.getSelectedRowModel().rows
    const selectedIds = selectedRows.map(row => row.original._id)

    setIsProcessing(true)
    try {
      for (const id of selectedIds) {
        await handleDelete({ id })
      }
      setRowSelection({})
    } catch (error) {
      console.error('Failed to delete officers:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const selectedCount = Object.keys(rowSelection).length

  const columns: ColumnDef<Officer>[] = [
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
      accessorKey: 'badgeNumber',
      header: 'Badge',
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs rounded font-mono">{row.original.badgeNumber}</Badge>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Officer',
      cell: ({ row }) => {
        const { name, _id } = row.original
        return (
          <div className="flex items-center gap-3">
            <span className={cn('inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold', avatarColor(_id))}>
              {getInitials(name)}
            </span>
            <p className="text-xs font-medium">{name}</p>
          </div>
        )
      },
    },
    {
      accessorKey: 'rank',
      header: 'Rank',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.rank ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'prisonId',
      header: 'Prison',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{getPrisonName(row.original.prisonId)}</span>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums">{row.original.phone ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <span className={cn(
          'inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium',
          row.original.isActive !== false
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-zinc-100 text-zinc-600 border-zinc-200'
        )}>
          {row.original.isActive !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const officer = row.original
        const isActive = officer.isActive !== false

        return (
          <div className="flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(
                buttonVariants({ size: 'icon-xs', variant: 'secondary' }),
                'rounded-full'
              )}>
                <HugeiconsIcon icon={MoreVertical} className="dualTone" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => handleToggleActive(officer)}
                  disabled={isProcessing}
                >
                  <HugeiconsIcon
                    icon={isActive ? PowerOffSquareIcon : PowerSquareIcon}
                    className="mr-2 h-4 w-4"
                  />
                  {isActive ? 'Deactivate' : 'Activate'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteClick(officer)}
                  disabled={isProcessing}
                  className="text-destructive focus:text-destructive"
                >
                  <HugeiconsIcon icon={Trash01Icon} className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: officers ?? [],
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

  const totalCount = officers?.length ?? 0
  const filteredCount = table.getFilteredRowModel().rows.length

  return (
    <article className="flex flex-col gap-5 py-5 md:max-w-5xl w-full mx-auto">
      <section className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Officers</h1>

        <section className="flex items-center gap-1">
          <Sheet>
            <SheetTrigger className={cn(
              buttonVariants({ size: 'xs' }),
              "gap-2 shrink-0"
            )}>
              <HugeiconsIcon icon={UserShield01Icon} className="dualTone" />
              Add Officer
            </SheetTrigger>
            <SheetApplication defaultCategory="officer" />
          </Sheet>

          {selectedCount > 0 && (
            <Button
              variant="destructive"
              size="xs"
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="gap-2"
            >
              <HugeiconsIcon icon={Trash01Icon} className="h-4 w-4" />
              Delete Selected ({selectedCount})
            </Button>
          )}
        </section>
      </section>

      <section className="flex flex-wrap items-center gap-2">
        <InputGroup className="relative w-full md:w-md">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search} className="h-4 w-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search by name…"
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(e) => table.getColumn('name')?.setFilterValue(e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <p className="text-sm text-muted-foreground mt-0.5">
              {filteredCount === totalCount ? `${totalCount} results` : `${filteredCount} of ${totalCount}`}
            </p>
          </InputGroupAddon>
        </InputGroup>

        <div className="flex items-center gap-px ml-auto">
          <Select
            value={prisonFilter}
            onValueChange={(v) => {
              const next = v === prisonFilter ? '' : v
              setPrisonFilter(next!!)
              table.getColumn('prisonId')?.setFilterValue(next || undefined)
            }}
          >
            <SelectTrigger className={cn(
              buttonVariants({ size: 'xs', variant: 'secondary' }),
              prisonFilter && 'ring-1 ring-inset ring-primary/40 bg-primary/5 text-primary'
            )}>
              <HugeiconsIcon icon={Filter} className="dualTone" />
              {prisonFilter ? (prisons?.find((p) => p._id === prisonFilter)?.name ?? 'Prison') : 'Prison'}
            </SelectTrigger>
            <SelectContent align="start">
              {(prisons ?? []).map((p) => (
                <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
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
                  No officers found.
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={AlertCircle} className="h-5 w-5 text-destructive" />
              Delete Officer
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{officerToDelete?.name}</strong> ({officerToDelete?.badgeNumber})?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isProcessing}
            >
              {isProcessing ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  )
}