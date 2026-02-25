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
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Search, Add01Icon,
  Delete02Icon, Edit01Icon, ArrowUpDown,
} from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import { SheetApplication } from '@/components/management-forms'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

export const Route = createFileRoute('/_management/offenses/')({
  component: RouteComponent,
})

// ─── Types ────────────────────────────────────────────────────────────────────

type CategoryType = 'felony' | 'misdemeanor' | 'capital' | 'traffic'

type Offense = {
  _id: Id<'offenses'>
  _creationTime: number
  name: string
  act?: string
  section?: string
  chapter?: string
  category?: CategoryType
  amendedBy?: string
  description?: string
  maxSentenceYears?: number
}

// ─── Category config ──────────────────────────────────────────────────────────

const categoryConfig: Record<CategoryType, { label: string; dot: string; class: string; sentenceNote: string }> = {
  capital: {
    label: 'Capital',
    dot: 'bg-red-600',
    class: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900',
    sentenceNote: 'Death penalty',
  },
  felony: {
    label: 'Felony',
    dot: 'bg-orange-500',
    class: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900',
    sentenceNote: '> 1 year',
  },
  misdemeanor: {
    label: 'Misdemeanor',
    dot: 'bg-amber-500',
    class: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
    sentenceNote: '< 1 year',
  },
  traffic: {
    label: 'Traffic',
    dot: 'bg-blue-400',
    class: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900',
    sentenceNote: 'Road violation',
  },
}

function CategoryBadge({ type }: { type: CategoryType }) {
  const cfg = categoryConfig[type]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', cfg.class)}>
      <span className={cn('size-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  )
}

// ─── Sortable header ──────────────────────────────────────────────────────────

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

// ─── Inline edit sheet ────────────────────────────────────────────────────────

function EditOffenseSheet({ offense, onClose }: { offense: Offense; onClose: () => void }) {
  const updateOffense = useMutation(api.offenses.update)
  const [name, setName] = useState(offense.name)
  const [act, setAct] = useState(offense.act ?? '')
  const [section, setSection] = useState(offense.section ?? '')
  const [chapter, setChapter] = useState(offense.chapter ?? '')
  const [category, setCategory] = useState<CategoryType | ''>(offense.category ?? '')
  const [description, setDescription] = useState(offense.description ?? '')
  const [maxSentenceYears, setMaxSentenceYears] = useState(offense.maxSentenceYears?.toString() ?? '')
  const [amendedBy, setAmendedBy] = useState(offense.amendedBy ?? '')
  const [busy, setBusy] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name is required'); return }
    setBusy(true)
    try {
      await updateOffense({
        id: offense._id,
        patch: {
          name: name.trim(),
          act: act.trim() || undefined,
          section: section.trim() || undefined,
          chapter: chapter.trim() || undefined,
          category: category || undefined,
          description: description.trim() || undefined,
          maxSentenceYears: maxSentenceYears ? Number(maxSentenceYears) : undefined,
          amendedBy: amendedBy.trim() || undefined,
        },
      })
      toast.success('Offense updated')
      onClose()
    } catch (e: any) { toast.error(e.message) }
    setBusy(false)
  }

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-5 pt-5 pb-4 border-b border-border/60">
        <SheetTitle className="text-base font-semibold">Edit Offense</SheetTitle>
        <p className="text-xs text-muted-foreground">{offense.name}</p>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Name */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Offense Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            placeholder="e.g. Aggravated Robbery"
          />
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Category</label>
          <Select value={category} onValueChange={(v) => setCategory(v as CategoryType)}>
            <SelectTrigger className="h-9 rounded-md text-sm">
              {category ? <CategoryBadge type={category} /> : <span className="text-muted-foreground">Select category</span>}
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(categoryConfig) as [CategoryType, any][]).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>
                  <span className="flex items-center gap-2">
                    <span className={cn('size-1.5 rounded-full', cfg.dot)} />
                    {cfg.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Act + Section */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Act</label>
            <Input
              value={act}
              onChange={(e) => setAct(e.target.value)}
              className="h-9 w-full rounded-md text-sm"
              placeholder="e.g. Penal Code Act"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Section</label>
            <Input
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="h-9 w-full rounded-md text-sm"
              placeholder="e.g. 285"
            />
          </div>
        </div>

        {/* Chapter + Max sentence */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Chapter</label>
            <Input
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className="h-9 w-full rounded-md text-sm"
              placeholder="e.g. Cap 120"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Max Sentence (yrs)</label>
            <Input
              type="number"
              min={0}
              value={maxSentenceYears}
              onChange={(e) => setMaxSentenceYears(e.target.value)}
              className="h-9 w-full rounded-md text-sm"
              placeholder="e.g. 10"
            />
          </div>
        </div>

        {/* Amended by */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Amended By</label>
          <Input
            value={amendedBy}
            onChange={(e) => setAmendedBy(e.target.value)}
            className="h-9 w-full rounded-md text-sm"
            placeholder="Amendment act or year"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none"
            placeholder="Optional description or notes"
          />
        </div>
      </div>

      <div className="px-5 py-4 border-t border-border/60 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={handleSave} disabled={busy}>
          {busy ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}

// ─── Row actions ──────────────────────────────────────────────────────────────

function OffenseRowActions({ offense, usageCount }: { offense: Offense; usageCount: number }) {
  const removeOffense = useMutation(api.offenses.remove)
  const [editOpen, setEditOpen] = useState(false)

  const handleDelete = async () => {
    if (usageCount > 0) {
      toast.error(`Cannot delete — ${usageCount} inmate${usageCount > 1 ? 's' : ''} reference this offense`)
      return
    }
    try {
      await removeOffense({ id: offense._id })
      toast.success('Offense deleted')
    } catch (e: any) { toast.error(e.message) }
  }

  return (
    <div className="flex items-center gap-1 justify-end">
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetTrigger title='editor' className={cn(buttonVariants({ variant: 'outline', size: 'icon-xs' }), 'rounded-full')}>
          <HugeiconsIcon icon={Edit01Icon} className="size-3.5 dualTone" />
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <EditOffenseSheet offense={offense} onClose={() => setEditOpen(false)} />
        </SheetContent>
      </Sheet>

      <Button
        variant="ghost"
        size="icon-xs"
        className={cn(
          'rounded-full',
          usageCount > 0
            ? 'opacity-30 cursor-not-allowed'
            : 'hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
        )}
        title={usageCount > 0 ? `Used by ${usageCount} inmate(s) — cannot delete` : 'Delete offense'}
        onClick={handleDelete}
      >
        <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
      </Button>
    </div>
  )
}

// ─── Main route ───────────────────────────────────────────────────────────────

function RouteComponent() {
  const offenses = useQuery(api.offenses.getAll)
  const inmates = useQuery(api.inmate.getAll)

  // Build usage map: offenseId → inmate count
  const usageMap = useMemo(() => {
    const map = new Map<string, number>()
    if (!inmates) return map
    for (const inmate of inmates) {
      const key = inmate.offenseId as string
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    return map
  }, [inmates])

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [categoryFilter, setCategoryFilter] = useState('')

  const columns: ColumnDef<Offense>[] = [
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
      header: ({ column }) => <SortableHeader label="Offense" column={column} />,
      cell: ({ row }) => {
        const o = row.original
        return (
          <div className="min-w-[160px]">
            <p className="text-sm font-medium leading-snug">{o.name}</p>
            {o.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-[240px]">{o.description}</p>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      filterFn: (row, _id, value) => row.original.category === value,
      cell: ({ row }) =>
        row.original.category
          ? <CategoryBadge type={row.original.category} />
          : <span className="text-xs text-muted-foreground italic">—</span>,
    },
    {
      id: 'legal',
      header: 'Legal Reference',
      cell: ({ row }) => {
        const o = row.original
        const parts = [o.act, o.section && `§${o.section}`, o.chapter].filter(Boolean)
        return parts.length ? (
          <div className="flex flex-wrap gap-1">
            {parts.map((p, i) => (
              <span key={i} className="inline-flex items-center rounded bg-muted/60 border border-border/60 px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground">
                {p}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground italic">—</span>
        )
      },
    },
    {
      accessorKey: 'maxSentenceYears',
      header: ({ column }) => <SortableHeader label="Max Sentence" column={column} />,
      cell: ({ row }) => {
        const years = row.original.maxSentenceYears
        const cat = row.original.category
        if (cat === 'capital') {
          return (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
              <span className="size-1.5 rounded-full bg-red-500" />
              Death penalty
            </span>
          )
        }
        return years != null ? (
          <span className="text-xs tabular-nums text-muted-foreground">
            <span className="font-medium text-foreground">{years}</span> yr{years !== 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground italic">—</span>
        )
      },
    },
    {
      id: 'usage',
      header: ({ column }) => <SortableHeader label="In Use" column={column} />,
      sortingFn: (a, b) =>
        (usageMap.get(a.original._id) ?? 0) - (usageMap.get(b.original._id) ?? 0),
      cell: ({ row }) => {
        const count = usageMap.get(row.original._id) ?? 0
        return count > 0 ? (
          <span className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium tabular-nums',
            count >= 10
              ? 'border-red-200 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
              : 'border-border/60 bg-muted/50 text-muted-foreground'
          )}>
            {count} inmate{count !== 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground italic">Unused</span>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <OffenseRowActions
          offense={row.original}
          usageCount={usageMap.get(row.original._id) ?? 0}
        />
      ),
    },
  ]

  const table = useReactTable({
    data: offenses ?? [],
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

  const totalCount = offenses?.length ?? 0
  const filteredCount = table.getFilteredRowModel().rows.length
  const unusedCount = offenses?.filter((o) => !(usageMap.get(o._id) ?? 0)).length ?? 0

  // Category distribution for stats
  const categoryStats = useMemo(() => {
    if (!offenses) return []
    const counts: Partial<Record<CategoryType, number>> = {}
    for (const o of offenses) {
      if (o.category) counts[o.category] = (counts[o.category] ?? 0) + 1
    }
    return (Object.entries(counts) as [CategoryType, number][])
      .sort((a, b) => b[1] - a[1])
  }, [offenses])

  return (
    <article className="flex flex-col gap-5 py-5 md:max-w-5xl w-full mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">Offenses</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalCount} offense{totalCount !== 1 ? 's' : ''} in the register
            {unusedCount > 0 && (
              <span className="ml-1.5 text-muted-foreground/60">· {unusedCount} unused</span>
            )}
          </p>
        </div>
        <Sheet>
          <SheetTrigger className={cn(buttonVariants({ size: 'sm' }), 'gap-2 shrink-0')}>
            <HugeiconsIcon icon={Add01Icon} className="dualTone" />
            Add Offense
          </SheetTrigger>
          <SheetApplication defaultCategory="offense" />
        </Sheet>
      </section>

      {/* ── Category stats strip ───────────────────────────────────────────── */}
      {categoryStats.length > 0 && (
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.entries(categoryConfig) as [CategoryType, any][]).map(([key, cfg]) => {
            const count = offenses?.filter((o) => o.category === key).length ?? 0
            const inmates = offenses
              ?.filter((o) => o.category === key)
              .reduce((sum, o) => sum + (usageMap.get(o._id) ?? 0), 0) ?? 0
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  const next = categoryFilter === key ? '' : key
                  setCategoryFilter(next)
                  table.getColumn('category')?.setFilterValue(next || undefined)
                }}
                className={cn(
                  'rounded-xl border px-4 py-3 text-left transition-all',
                  categoryFilter === key
                    ? cn('ring-1 ring-inset ring-primary/30', cfg.class)
                    : 'border-border/60 bg-sidebar/50 hover:bg-sidebar'
                )}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={cn('size-2 rounded-full', cfg.dot)} />
                  <span className="text-xs font-medium text-muted-foreground">{cfg.label}</span>
                </div>
                <p className="text-xl font-bold tabular-nums">{count}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{inmates} inmate{inmates !== 1 ? 's' : ''}</p>
              </button>
            )
          })}
        </section>
      )}

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <section className="flex flex-wrap items-center gap-2">
        <InputGroup className="relative w-full md:w-md">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search} className="h-4 w-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search by name, act, section…"
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(e) => table.getColumn('name')?.setFilterValue(e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <p className="text-sm text-muted-foreground">
              {filteredCount === totalCount ? `${totalCount}` : `${filteredCount} of ${totalCount}`}
            </p>
          </InputGroupAddon>
        </InputGroup>

        {/* Category filter toggle */}
        <div className="flex items-center gap-1 ml-auto">
          {(Object.entries(categoryConfig) as [CategoryType, any][]).map(([key, cfg]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                const next = categoryFilter === key ? '' : key
                setCategoryFilter(next)
                table.getColumn('category')?.setFilterValue(next || undefined)
              }}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
                categoryFilter === key
                  ? cfg.class
                  : 'border-border/60 text-muted-foreground hover:bg-muted'
              )}
            >
              <span className={cn('size-1.5 rounded-full', cfg.dot)} />
              {cfg.label}
            </button>
          ))}
          {categoryFilter && (
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('')
                table.getColumn('category')?.setFilterValue(undefined)
              }}
              className="text-xs text-muted-foreground hover:text-foreground ml-1 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden">
        <Table className="border-separate border-spacing-y-1 border-none no-scrollbar">
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-transparent hover:bg-transparent border-none">
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    className="text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                  >
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
                  className={cn(
                    'cursor-default transition-colors',
                    row.getIsSelected() ? 'bg-sidebar' : 'bg-sidebar/55 hover:bg-sidebar'
                  )}
                >
                  {row.getVisibleCells().map((cell, i) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'py-3',
                        i === 0 && 'rounded-l-xl',
                        i === row.getVisibleCells().length - 1 && 'rounded-r-xl'
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-sm text-muted-foreground">
                  {categoryFilter
                    ? `No ${categoryConfig[categoryFilter as CategoryType]?.label.toLowerCase()} offenses found.`
                    : 'No offenses registered yet.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground tabular-nums">
          Page{' '}
          <span className="font-medium text-foreground">{table.getState().pagination.pageIndex + 1}</span>
          {' '}of{' '}
          <span className="font-medium text-foreground">{table.getPageCount() || 1}</span>
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline" size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </article>
  )
}