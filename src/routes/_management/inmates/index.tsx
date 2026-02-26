import { useState, useMemo } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
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
import {
    Search, UserAdd01Icon, Filter, UserSearch01Icon,
    ArrowUpDown, Download01Icon, SortByDown01Icon,
} from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { SheetApplication } from '@/components/management-forms'
import { toast } from 'sonner'
import { exportInmatesPDF } from '@/lib/exportInmatesPDF'

export const Route = createFileRoute('/_management/inmates/')({
    component: RouteComponent,
})

// ─── Types ────────────────────────────────────────────────────────────────────

type InmateStatus = 'remand' | 'convict' | 'at_court' | 'released' | 'transferred' | 'escaped' | 'deceased'
type InmateType = 'remand' | 'convict' | 'civil'
type RiskLevel = 'low' | 'medium' | 'high' | 'maximum'

type Inmate = {
    _id: Id<'inmates'>; _creationTime: number
    firstName: string; lastName: string; otherNames?: string
    prisonNumber: string; nationalId?: string
    dob: string; gender: 'male' | 'female'
    inmateType: InmateType; status: InmateStatus; riskLevel?: RiskLevel
    prisonId: Id<'prisons'>; offenseId: Id<'offenses'>
    caseNumber: string; admissionDate: string
    cellBlock?: string; cellNumber?: string; notes?: string
}

// ─── Config ───────────────────────────────────────────────────────────────────

export const statusConfig: Record<InmateStatus, { label: string; class: string; dot: string }> = {
    remand: { label: 'Remand', dot: 'bg-amber-500', class: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' },
    convict: { label: 'Convict', dot: 'bg-red-500', class: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800' },
    at_court: { label: 'At Court', dot: 'bg-blue-500', class: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800' },
    released: { label: 'Released', dot: 'bg-emerald-500', class: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' },
    transferred: { label: 'Transferred', dot: 'bg-violet-500', class: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800' },
    escaped: { label: 'Escaped', dot: 'bg-orange-500', class: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800' },
    deceased: { label: 'Deceased', dot: 'bg-zinc-400', class: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700' },
}

export const riskConfig: Record<RiskLevel, { label: string; class: string; dot: string }> = {
    low: { label: 'Low', dot: 'bg-emerald-500', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    medium: { label: 'Medium', dot: 'bg-amber-500', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    high: { label: 'High', dot: 'bg-orange-500', class: 'bg-orange-50 text-orange-700 border-orange-200' },
    maximum: { label: 'Maximum', dot: 'bg-red-600', class: 'bg-red-50 text-red-700 border-red-200' },
}

export function getInitials(f: string, l: string) { return `${f[0] ?? ''}${l[0] ?? ''}`.toUpperCase() }
export function avatarColor(id: string) {
    const colors = ['bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700', 'bg-rose-100 text-rose-700', 'bg-teal-100 text-teal-700', 'bg-orange-100 text-orange-700', 'bg-indigo-100 text-indigo-700']
    return colors[id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length]
}

export function StatusBadge({ status }: { status?: InmateStatus }) {
    const cfg = status ? statusConfig[status] : null
    if (!cfg) return null
    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', cfg.class)}>
            <span className={cn('size-1.5 rounded-full', cfg.dot)} />{cfg.label}
        </span>
    )
}

export function RiskBadge({ level }: { level?: RiskLevel }) {
    if (!level) return null
    const cfg = riskConfig[level]
    return (
        <span className={cn('inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium', cfg.class)}>
            <span className={cn('size-1.5 rounded-full', cfg.dot)} />{cfg.label}
        </span>
    )
}

function RouteComponent() {
    const listInmates = useQuery(api.inmate.getAll)

    const [sorting, setSorting] = useState<SortingState>([{ id: '_creationTime', desc: true }])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ _creationTime: false })
    const [rowSelection, setRowSelection] = useState({})
    const [statusFilter, setStatusFilter] = useState('')
    const [genderFilter, setGenderFilter] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [riskFilter, setRiskFilter] = useState('')

    const statusCounts = useMemo(() => {
        if (!listInmates) return {} as Record<InmateStatus, number>
        const c = {} as Record<InmateStatus, number>
        for (const i of listInmates) c[i.status] = (c[i.status] ?? 0) + 1
        return c
    }, [listInmates])

    const columns: ColumnDef<Inmate>[] = [
        {
            id: 'select',
            header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected())} onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" className="translate-y-0.5" />,
            cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={v => row.toggleSelected(!!v)} aria-label="Select row" className="translate-y-0.5" />,
            enableSorting: false, enableHiding: false,
        },
        {
            accessorKey: 'prisonNumber',
            header: 'Prison No.',
            cell: ({ row }) => (
                <Badge render={<Link to='/inmates/$uid' params={{ uid: row.original._id }} />} variant="secondary" className="text-xs rounded font-mono cursor-pointer hover:bg-primary/10 transition-colors">
                    {row.original.prisonNumber}
                </Badge>
            ),
        },
        {
            accessorKey: 'firstName',
            header: 'Full Name',
            cell: ({ row }) => {
                const { firstName, lastName, otherNames, _id } = row.original
                return (
                    <Link to='/inmates/$uid' params={{ uid: _id }} className="flex items-center gap-2.5 min-w-0 group">
                        <span className={cn('inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold', avatarColor(_id))}>
                            {getInitials(firstName, lastName)}
                        </span>
                        <div className="min-w-0">
                            <p className="font-medium text-xs truncate group-hover:text-primary transition-colors">
                                {firstName}{otherNames ? ` ${otherNames}` : ''} {lastName}
                            </p>
                            {row.original.nationalId && <p className="text-[11px] text-muted-foreground truncate">{row.original.nationalId}</p>}
                        </div>
                    </Link>
                )
            },
        },
        {
            accessorKey: 'gender',
            header: 'Sex',
            cell: ({ row }) => (
                <span className={cn('text-xs font-medium capitalize px-1.5 py-0.5 rounded', row.original.gender === 'male' ? 'text-blue-700 bg-blue-50' : 'text-pink-700 bg-pink-50')}>
                    {row.original.gender === 'male' ? 'M' : 'F'}
                </span>
            ),
        },
        {
            accessorKey: 'dob',
            header: 'Age',
            cell: ({ row }) => {
                const age = row.original.dob ? Math.floor((Date.now() - new Date(row.original.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : null
                return <span className="text-xs tabular-nums text-muted-foreground">{age != null ? `${age} yrs` : '—'}</span>
            },
        },
        {
            accessorKey: 'inmateType',
            header: 'Type',
            cell: ({ row }) => <span className="capitalize text-xs text-muted-foreground font-medium">{row.original.inmateType}</span>,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        {
            accessorKey: 'riskLevel',
            header: 'Risk',
            cell: ({ row }) => <RiskBadge level={row.original.riskLevel} />,
        },
        {
            accessorKey: 'caseNumber',
            header: 'Case No.',
            cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.caseNumber}</span>,
        },
        {
            accessorKey: 'admissionDate',
            header: ({ column }) => (
                <button className="flex items-center gap-1 hover:text-foreground transition-colors text-xs font-medium uppercase tracking-wider" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Admitted <HugeiconsIcon icon={ArrowUpDown} className="size-3 opacity-60" />
                </button>
            ),
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                    {row.original.admissionDate ? format(new Date(row.original.admissionDate), 'MMM dd, yyyy') : '—'}
                </span>
            ),
        },
        { accessorKey: '_creationTime', header: 'Added', enableHiding: true },
    ]

    const table = useReactTable({
        data: listInmates ?? [],
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
        initialState: { pagination: { pageSize: 25 } },
    })

    const totalCount = listInmates?.length ?? 0
    const filteredCount = table.getFilteredRowModel().rows.length
    const hasFilters = !!(statusFilter || genderFilter || typeFilter || riskFilter)
    const selectedCount = Object.keys(rowSelection).length
    const filterLabel = [statusFilter && `Status:${statusConfig[statusFilter as InmateStatus]?.label}`, genderFilter && `Sex:${genderFilter}`, typeFilter && `Type:${typeFilter}`, riskFilter && `Risk:${riskFilter}`].filter(Boolean).join(', ')

    function clearFilters() {
        setStatusFilter(''); setGenderFilter(''); setTypeFilter(''); setRiskFilter('')
        table.getColumn('status')?.setFilterValue(undefined)
        table.getColumn('gender')?.setFilterValue(undefined)
        table.getColumn('inmateType')?.setFilterValue(undefined)
        table.getColumn('riskLevel')?.setFilterValue(undefined)
    }

    const isNewest = sorting[0]?.id === '_creationTime' && sorting[0]?.desc !== false

    return (
        <article className="flex flex-col gap-5 py-5 md:max-w-5xl w-full mx-auto">

            {/* ── Header ── */}
            <section className="flex items-start gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Inmates</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {totalCount} registered
                        {hasFilters && filteredCount !== totalCount && (
                            <span className="ml-1.5 text-primary font-medium">· {filteredCount} shown</span>
                        )}
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-2 shrink-0">
                    <Button
                        variant="outline" size="sm" className="gap-2"
                        onClick={() => exportInmatesPDF(table.getFilteredRowModel().rows.map(r => r.original), filterLabel)}
                        disabled={filteredCount === 0}
                    >
                        <HugeiconsIcon icon={Download01Icon} className="size-4" />
                        Export PDF
                        {hasFilters && filteredCount !== totalCount && (
                            <span className="rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-semibold">{filteredCount}</span>
                        )}
                    </Button>
                    <Sheet>
                        <SheetTrigger className={cn(buttonVariants({ size: 'sm' }), 'gap-2')}>
                            <HugeiconsIcon icon={UserAdd01Icon} className="dualTone" />
                            Add Inmate
                        </SheetTrigger>
                        <SheetApplication defaultCategory="inmate" />
                    </Sheet>
                </div>
            </section>

            {/* ── Status stat strip ── */}
            {totalCount > 0 && (
                <section className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                    {(Object.entries(statusConfig) as [InmateStatus, any][]).map(([key, cfg]) => {
                        const count = statusCounts[key] ?? 0
                        const active = statusFilter === key
                        return (
                            <button key={key} type="button"
                                onClick={() => { const n = active ? '' : key; setStatusFilter(n); table.getColumn('status')?.setFilterValue(n || undefined) }}
                                className={cn('rounded-xl border px-3 py-2.5 text-left transition-all',
                                    active ? cn('ring-1 ring-inset ring-current/20', cfg.class) : 'border-border/60 bg-sidebar/50 hover:bg-sidebar')}
                            >
                                <p className="text-lg font-bold tabular-nums leading-none">{count}</p>
                                <div className="flex items-center gap-1 mt-1.5">
                                    <span className={cn('size-1.5 rounded-full shrink-0', cfg.dot)} />
                                    <p className="text-[10px] text-muted-foreground leading-tight truncate">{cfg.label}</p>
                                </div>
                            </button>
                        )
                    })}
                </section>
            )}

            {/* ── Filters row ── */}
            <section className="flex flex-wrap items-center gap-2">
                <InputGroup className="w-full md:w-[340px]">
                    <InputGroupAddon><HugeiconsIcon icon={Search} className="h-4 w-4 text-muted-foreground" /></InputGroupAddon>
                    <InputGroupInput
                        placeholder="Search name, prison no., case…"
                        value={(table.getColumn('firstName')?.getFilterValue() as string) ?? ''}
                        onChange={e => table.getColumn('firstName')?.setFilterValue(e.target.value)}
                    />
                    <InputGroupAddon align="inline-end">
                        <p className="text-xs text-muted-foreground tabular-nums">{filteredCount === totalCount ? totalCount : `${filteredCount}/${totalCount}`}</p>
                    </InputGroupAddon>
                </InputGroup>

                <div className="flex items-center gap-1 ml-auto flex-wrap">
                    {/* Sort toggle */}
                    <Button variant="secondary" size="xs" className="gap-1.5 h-8"
                        onClick={() => setSorting(isNewest ? [{ id: '_creationTime', desc: false }] : [{ id: '_creationTime', desc: true }])}>
                        <HugeiconsIcon icon={SortByDown01Icon} className="size-3.5" />
                        {isNewest ? 'Newest first' : 'Oldest first'}
                    </Button>

                    {/* Sex */}
                    <Select value={genderFilter} onValueChange={v => { const n = v === genderFilter ? '' : v; setGenderFilter(n!!); table.getColumn('gender')?.setFilterValue(n || undefined) }}>
                        <SelectTrigger className={cn(buttonVariants({ size: 'xs', variant: 'secondary' }), 'h-8', genderFilter && 'ring-1 ring-inset ring-primary/40 bg-primary/5 text-primary')}>
                            <HugeiconsIcon icon={UserSearch01Icon} className="size-3.5" />
                            {genderFilter ? (genderFilter === 'male' ? 'Male' : 'Female') : 'Gender'}
                        </SelectTrigger>
                        <SelectContent>
                            {[{ v: 'male', l: 'Male', d: 'bg-blue-500' }, { v: 'female', l: 'Female', d: 'bg-pink-500' }].map(g => (
                                <SelectItem key={g.v} value={g.v}><span className="flex items-center gap-2"><span className={cn('size-1.5 rounded-full', g.d)} />{g.l}</span></SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Type */}
                    <Select value={typeFilter} onValueChange={v => { const n = v === typeFilter ? '' : v; setTypeFilter(n!!); table.getColumn('inmateType')?.setFilterValue(n || undefined) }}>
                        <SelectTrigger className={cn(buttonVariants({ size: 'xs', variant: 'secondary' }), 'h-8', typeFilter && 'ring-1 ring-inset ring-primary/40 bg-primary/5 text-primary')}>
                            <HugeiconsIcon icon={Filter} className="size-3.5" />
                            {typeFilter ? typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1) : 'Type'}
                        </SelectTrigger>
                        <SelectContent>
                            {(['remand', 'convict', 'civil'] as const).map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    {/* Risk */}
                    <Select value={riskFilter} onValueChange={v => { const n = v === riskFilter ? '' : v; setRiskFilter(n!!); table.getColumn('riskLevel')?.setFilterValue(n || undefined) }}>
                        <SelectTrigger className={cn(buttonVariants({ size: 'xs', variant: 'secondary' }), 'h-8', riskFilter && 'ring-1 ring-inset ring-primary/40 bg-primary/5 text-primary')}>
                            {riskFilter ? riskConfig[riskFilter as RiskLevel]?.label + ' Risk' : 'Risk'}
                        </SelectTrigger>
                        <SelectContent>
                            {(Object.entries(riskConfig) as [RiskLevel, any][]).map(([k, v]) => (
                                <SelectItem key={k} value={k}><span className="flex items-center gap-2"><span className={cn('size-1.5 rounded-full', v.dot)} />{v.label}</span></SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {hasFilters && <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">Clear</button>}
                </div>
            </section>

            {/* ── Selection toolbar ── */}
            {selectedCount > 0 && (
                <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
                    <span className="text-sm font-medium">{selectedCount} selected</span>
                    <Button size="xs" variant="outline" className="gap-1.5 ml-auto"
                        onClick={() => exportInmatesPDF(table.getSelectedRowModel().rows.map(r => r.original), 'Selected rows')}>
                        <HugeiconsIcon icon={Download01Icon} className="size-3.5" /> Export selected
                    </Button>
                    <Button size="xs" variant="ghost" onClick={() => setRowSelection({})}>Deselect all</Button>
                </div>
            )}

            {/* ── Table ── */}
            <div className="overflow-hidden">
                <Table className="border-separate border-spacing-y-1 border-none no-scrollbar">
                    <TableHeader>
                        {table.getHeaderGroups().map(hg => (
                            <TableRow key={hg.id} className="bg-transparent hover:bg-transparent border-none">
                                {hg.headers.map(h => (
                                    <TableHead key={h.id} className="text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                                        {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? table.getRowModel().rows.map(row => (
                            <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}
                                className={cn('cursor-pointer transition-colors',
                                    row.getIsSelected() ? 'bg-sidebar'
                                        : row.original.status === 'escaped' ? 'bg-orange-50/60 hover:bg-orange-50 dark:bg-orange-950/10'
                                            : row.original.riskLevel === 'maximum' ? 'bg-red-50/40 hover:bg-red-50/80 dark:bg-red-950/10'
                                                : 'bg-sidebar/55 hover:bg-sidebar'
                                )}
                            >
                                {row.getVisibleCells().map((cell, i) => (
                                    <TableCell key={cell.id} className={cn('py-2.5', i === 0 && 'rounded-l-xl', i === row.getVisibleCells().length - 1 && 'rounded-r-xl')}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-sm text-muted-foreground">No inmates match the current filters.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* ── Pagination ── */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <p className="text-sm text-muted-foreground tabular-nums">
                        Page <span className="font-medium text-foreground">{table.getState().pagination.pageIndex + 1}</span>{' '}
                        of <span className="font-medium text-foreground">{table.getPageCount() || 1}</span>
                    </p>
                    <Select value={String(table.getState().pagination.pageSize)} onValueChange={v => table.setPageSize(Number(v))}>
                        <SelectTrigger className="h-7 w-auto text-xs gap-1 border-border/60">{table.getState().pagination.pageSize}/page</SelectTrigger>
                        <SelectContent>{[10, 25, 50, 100].map(n => <SelectItem key={n} value={String(n)} className="text-xs">{n} per page</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
                </div>
            </div>
        </article>
    )
}