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
import { Search, Building01Icon, Filter, MoreVertical, Trash2 as Trash01Icon, AlertCircle } from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import { SheetApplication } from '@/components/management-forms'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

export const Route = createFileRoute('/_management/prisons/')({
  component: RouteComponent,
})

type PrisonType = 'main' | 'remand' | 'open' | 'farm' | 'branch'

type Prison = {
  _id: Id<'prisons'>
  _creationTime: number
  name: string
  code: string
  type: PrisonType
  region?: string
  district?: string
  address?: string
  capacity?: number
  contactPhone?: string
  isActive?: boolean
}

const typeConfig: Record<PrisonType, { label: string; class: string }> = {
  main: { label: 'Main', class: 'bg-violet-50 text-violet-700 border-violet-200' },
  remand: { label: 'Remand', class: 'bg-amber-50 text-amber-700 border-amber-200' },
  open: { label: 'Open', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  farm: { label: 'Farm', class: 'bg-teal-50 text-teal-700 border-teal-200' },
  branch: { label: 'Branch', class: 'bg-blue-50 text-blue-700 border-blue-200' },
}

function RouteComponent() {
  const prisons = useQuery(api.prisons.getAll)
  const officers = useQuery(api.officers.getAll)
  const inmates = useQuery(api.inmate.getAll)
  const handleDelete = useMutation(api.prisons.remove)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [typeFilter, setTypeFilter] = useState('')

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [prisonToDelete, setPrisonToDelete] = useState<Prison | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const officerCount = (id: Id<'prisons'>) => officers?.filter((o) => o.prisonId === id).length ?? 0
  const inmateCount = (id: Id<'prisons'>) => inmates?.filter((i) => i.prisonId === id).length ?? 0

  const handleDeleteClick = (prison: Prison) => {
    setPrisonToDelete(prison)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!prisonToDelete) return

    setIsDeleting(true)
    try {
      await handleDelete({ id: prisonToDelete._id })
      setDeleteDialogOpen(false)
      setPrisonToDelete(null)
    } catch (error) {
      console.error('Failed to delete prison:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkDelete = async () => {
    const selectedRows = table.getSelectedRowModel().rows
    const selectedIds = selectedRows.map(row => row.original._id)

    setIsDeleting(true)
    try {
      // Delete sequentially or use a bulk delete mutation if available
      for (const id of selectedIds) {
        await handleDelete({ id })
      }
      setRowSelection({})
    } catch (error) {
      console.error('Failed to delete prisons:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const selectedCount = Object.keys(rowSelection).length

  const columns: ColumnDef<Prison>[] = [
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
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs rounded font-mono">{row.original.code}</Badge>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Prison',
      cell: ({ row }) => (
        <div>
          <p className="text-xs font-medium">{row.original.name}</p>
          {row.original.district && (
            <p className="text-xs text-muted-foreground">{row.original.district}{row.original.region ? `, ${row.original.region}` : ''}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const config = typeConfig[row.original.type]
        return (
          <span className={cn('inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium capitalize', config.class)}>
            {config.label}
          </span>
        )
      },
    },
    {
      id: 'inmates',
      header: 'Inmates',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-xs tabular-nums font-medium">{inmateCount(row.original._id)}</span>
          {row.original.capacity && (
            <span className="text-xs text-muted-foreground">/ {row.original.capacity}</span>
          )}
        </div>
      ),
    },
    {
      id: 'officers',
      header: 'Officers',
      cell: ({ row }) => (
        <span className="text-xs tabular-nums">{officerCount(row.original._id)}</span>
      ),
    },
    {
      accessorKey: 'contactPhone',
      header: 'Contact',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums">{row.original.contactPhone ?? '—'}</span>
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
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon-xs' }))}>
              <HugeiconsIcon icon={MoreVertical} className="dualTone" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleDeleteClick(row.original)} className="text-destructive focus:text-destructive">
                <HugeiconsIcon icon={Trash01Icon} className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: prisons ?? [],
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

  const totalCount = prisons?.length ?? 0
  const filteredCount = table.getFilteredRowModel().rows.length

  return (
    <article className="flex flex-col gap-5 py-5 md:max-w-5xl w-full mx-auto">
      <section className="flex items-center gap-5">
        <h1 className="text-2xl font-bold tracking-tight">Prisons</h1>

        <section className="flex items-center gap-1">
          <Sheet>
            <SheetTrigger className={cn(
              buttonVariants({
                size: "xs",
                className: "gap-2 shrink-0"
              })
            )}>
              <HugeiconsIcon icon={Building01Icon} className="dualTone" />
              Add Prison
            </SheetTrigger>
            <SheetApplication defaultCategory="prison" />
          </Sheet>

          {selectedCount > 0 && (
            <Button
              variant="destructive"
              size="xs"
              onClick={handleBulkDelete}
              disabled={isDeleting}
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
            value={typeFilter}
            onValueChange={(v) => {
              const next = v === typeFilter ? '' : v
              setTypeFilter(next!!)
              table.getColumn('type')?.setFilterValue(next || undefined)
            }}
          >
            <SelectTrigger className={cn(
              buttonVariants({ size: 'xs', variant: 'secondary' }),
              typeFilter && 'ring-1 ring-inset ring-primary/40 bg-primary/5 text-primary'
            )}>
              <HugeiconsIcon icon={Filter} className="dualTone" />
              {typeFilter ? typeConfig[typeFilter as PrisonType]?.label : 'Type'}
            </SelectTrigger>
            <SelectContent align="start">
              {Object.entries(typeConfig).map(([key, val]) => (
                <SelectItem key={key} value={key}>
                  <span className={cn('inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium capitalize', val.class)}>
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
                  No prisons found.
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
              Delete Prison
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{prisonToDelete?.name}</strong> ({prisonToDelete?.code})?
              This action cannot be undone.
              {(prisonToDelete && (inmateCount(prisonToDelete._id) > 0 || officerCount(prisonToDelete._id) > 0)) && (
                <span className="mt-2 block text-destructive font-medium">
                  Warning: This prison has {inmateCount(prisonToDelete._id)} inmates and {officerCount(prisonToDelete._id)} officers assigned.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  )
}