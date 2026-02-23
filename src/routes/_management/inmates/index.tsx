import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import { Id } from 'convex/_generated/dataModel'
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from '@/components/ui/select'
import { Sheet, SheetTrigger } from '@/components/ui/sheet'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    Search,
    UserPlus,
    Filter,
    UserSearch01Icon,
    StatusIcon,
    MoreVertical,
} from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import { formatDate } from 'date-fns/format'
import { SheetApplication } from '@/components/management-forms'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_management/inmates/')({
    component: RouteComponent,
})

// ─── Types ────────────────────────────────────────────────────────────────────

type InmateStatus =
    | 'remand' | 'convict' | 'at_court'
    | 'released' | 'transferred' | 'escaped' | 'deceased'

type InmateType = 'remand' | 'convict' | 'civil'
type RiskLevel = 'low' | 'medium' | 'high' | 'maximum'

type Inmate = {
    _id: Id<'inmates'>
    _creationTime: number
    firstName: string
    lastName: string
    otherNames?: string
    prisonNumber: string
    nationalId?: string
    dob: string
    gender: 'male' | 'female'
    inmateType: InmateType
    status: InmateStatus
    riskLevel?: RiskLevel
    prisonId: Id<'prisons'>
    offenseId: Id<'offenses'>
    caseNumber: string
    admissionDate: string
    cellBlock?: string
    cellNumber?: string
    notes?: string
}

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<InmateStatus, { label: string; class: string; dot: string }> = {
    remand: {
        label: 'Remand',
        class: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
        dot: 'bg-amber-500',
    },
    convict: {
        label: 'Convict',
        class: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
        dot: 'bg-red-500',
    },
    at_court: {
        label: 'At Court',
        class: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
        dot: 'bg-blue-500',
    },
    released: {
        label: 'Released',
        class: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
        dot: 'bg-emerald-500',
    },
    transferred: {
        label: 'Transferred',
        class: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800',
        dot: 'bg-violet-500',
    },
    escaped: {
        label: 'Escaped',
        class: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800',
        dot: 'bg-orange-500',
    },
    deceased: {
        label: 'Deceased',
        class: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700',
        dot: 'bg-zinc-400',
    },
}

const riskConfig: Record<RiskLevel, { label: string; class: string }> = {
    low: { label: 'Low', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    medium: { label: 'Medium', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    high: { label: 'High', class: 'bg-orange-50 text-orange-700 border-orange-200' },
    maximum: { label: 'Maximum', class: 'bg-red-50 text-red-700 border-red-200' },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: InmateStatus }) {
    const config = status ? statusConfig[status] : null
    if (!config) return <Badge variant="outline" className="text-xs">Unknown</Badge>
    return (
        <span className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
            config.class
        )}>
            <span className={cn('size-1.5 rounded-full', config.dot)} />
            {config.label}
        </span>
    )
}

function RiskBadge({ level }: { level?: RiskLevel }) {
    if (!level) return null
    const config = riskConfig[level]
    return (
        <span className={cn(
            'inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium capitalize',
            config.class
        )}>
            {config.label}
        </span>
    )
}

function getInitials(first: string, last: string) {
    return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

function avatarColor(id: string) {
    const colors = [
        'bg-blue-100 text-blue-700',
        'bg-violet-100 text-violet-700',
        'bg-rose-100 text-rose-700',
        'bg-teal-100 text-teal-700',
        'bg-orange-100 text-orange-700',
    ]
    return colors[id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length]
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const columns: ColumnDef<Inmate>[] = [
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
        accessorKey: 'prisonNumber',
        header: 'Prison No.',
        cell: ({ row }) => (
            <Badge
                render={<Link to='/inmates/$uid' params={{ uid: row.original._id }} />}
                variant="secondary" className="text-xs rounded font-mono cursor-pointer"
            >
                {row.original.prisonNumber}
            </Badge>
        ),
    },
    {
        accessorKey: 'firstName',
        header: 'Full Name',
        cell: ({ row }) => {
            const { firstName, lastName, _id } = row.original
            return (
                <div className="flex items-center gap-3 min-w-0">
                    <span className={cn(
                        'inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                        avatarColor(_id)
                    )}>
                        {getInitials(firstName, lastName)}
                    </span>
                    <div className="min-w-0">
                        <p className="font-medium text-xs truncate">
                            {firstName} {row.original.otherNames ? `${row.original.otherNames} ` : ''}{lastName}
                        </p>
                        {row.original.nationalId && (
                            <p className="text-xs text-muted-foreground truncate">{row.original.nationalId}</p>
                        )}
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: 'gender',
        header: 'Gender',
        cell: ({ row }) => (
            <span className="capitalize text-xs text-muted-foreground">
                {row.getValue('gender') as string}
            </span>
        ),
    },
    {
        accessorKey: 'dob',
        header: 'Date of Birth',
        cell: ({ row }) => (
            <span className="text-xs text-muted-foreground tabular-nums">
                {formatDate(row.getValue('dob') as string, 'MMM dd, yyyy')}
            </span>
        ),
    },
    {
        accessorKey: 'inmateType',
        header: 'Type',
        cell: ({ row }) => (
            <span className="capitalize text-xs text-muted-foreground">
                {(row.getValue('inmateType') as string)}
            </span>
        ),
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
        cell: ({ row }) => (
            <span className="font-mono text-xs text-muted-foreground">
                {row.original.caseNumber}
            </span>
        ),
    },
    {
        id: 'actions',
        header: '',
        cell: () => (
            <div className="flex items-center justify-center">
                <Button variant="secondary" size="icon-xs" className="rounded-full">
                    <HugeiconsIcon icon={MoreVertical} className="dualTone" />
                </Button>
            </div>
        ),
    },
]

function RouteComponent() {
    const listInmates = useQuery(api.inmate.getAll)

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [genderFilter, setGenderFilter] = useState<string>('')
    const [statusFilter, setStatusFilter] = useState<string>('')
    const [typeFilter, setTypeFilter] = useState<string>('')

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
    })

    const totalCount = listInmates?.length ?? 0
    const filteredCount = table.getFilteredRowModel().rows.length
    const hasFilters = !!genderFilter || !!statusFilter || !!typeFilter

    function clearFilters() {
        setGenderFilter('')
        setStatusFilter('')
        setTypeFilter('')
        table.getColumn('gender')?.setFilterValue(undefined)
        table.getColumn('status')?.setFilterValue(undefined)
        table.getColumn('inmateType')?.setFilterValue(undefined)
    }

    return (
        <article className="flex flex-col gap-5 py-5 md:max-w-5xl w-full mx-auto">
            <section className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">Inmates</h1>
                <Sheet>
                    <SheetTrigger className={cn(
                        buttonVariants({ size: 'sm' }),
                        'gap-2 shrink-0 ml-auto'
                    )}>
                        <HugeiconsIcon icon={UserPlus} className="dualTone" />
                        Add Inmate
                    </SheetTrigger>
                    <SheetApplication defaultCategory="inmate" />
                </Sheet>
            </section>

            {/* ── Filters ── */}
            <section className="flex flex-wrap items-center gap-2">
                <InputGroup className="relative w-full md:w-md">
                    <InputGroupAddon>
                        <HugeiconsIcon icon={Search} className="h-4 w-4 text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                        placeholder="Search by name…"
                        value={(table.getColumn('firstName')?.getFilterValue() as string) ?? ''}
                        onChange={(e) => table.getColumn('firstName')?.setFilterValue(e.target.value)}
                    />
                    <InputGroupAddon align="inline-end">
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {filteredCount === totalCount
                                ? `${totalCount} results`
                                : `${filteredCount} of ${totalCount}`}
                        </p>
                    </InputGroupAddon>
                </InputGroup>

                {hasFilters && (
                    <button
                        className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                        onClick={clearFilters}
                    >
                        Clear filters
                    </button>
                )}

                <div className="flex items-center gap-px ml-auto">
                    {/* Gender filter */}
                    <Select
                        value={genderFilter}
                        onValueChange={(v) => {
                            const next = v === genderFilter ? '' : v
                            setGenderFilter(next!!)
                            table.getColumn('gender')?.setFilterValue(next || undefined)
                        }}
                    >
                        <SelectTrigger className={cn(
                            buttonVariants({ size: 'xs', variant: 'secondary' }),
                            genderFilter && 'ring-1 ring-inset ring-primary/40 bg-primary/5 text-primary'
                        )}>
                            <HugeiconsIcon icon={UserSearch01Icon} className="dualTone" />
                            {genderFilter ? (genderFilter === 'male' ? 'Male' : 'Female') : 'Gender'}
                        </SelectTrigger>
                        <SelectContent align="start">
                            {[{ value: 'male', label: 'Male', dot: 'bg-blue-500' }, { value: 'female', label: 'Female', dot: 'bg-pink-500' }].map((g) => (
                                <SelectItem key={g.value} value={g.value}>
                                    <span className="flex items-center gap-2">
                                        <span className={cn('size-1.5 rounded-full', g.dot)} />
                                        {g.label}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Status filter */}
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
                            {statusFilter ? statusConfig[statusFilter as InmateStatus]?.label : 'Status'}
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

                    {/* Type filter */}
                    <Select
                        value={typeFilter}
                        onValueChange={(v) => {
                            const next = v === typeFilter ? '' : v
                            setTypeFilter(next!!)
                            table.getColumn('inmateType')?.setFilterValue(next || undefined)
                        }}
                    >
                        <SelectTrigger className={cn(
                            buttonVariants({ size: 'xs', variant: 'secondary' }),
                            typeFilter && 'ring-1 ring-inset ring-primary/40 bg-primary/5 text-primary'
                        )}>
                            <HugeiconsIcon icon={Filter} className="dualTone" />
                            {typeFilter ? typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1) : 'Type'}
                        </SelectTrigger>
                        <SelectContent align="start">
                            {(['remand', 'convict', 'civil'] as const).map((t) => (
                                <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </section>

            {/* ── Table ── */}
            <div className="overflow-hidden">
                <Table className="border-separate border-spacing-y-1 border-none no-scrollbar">
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id} className="bg-transparent hover:bg-transparent border-none">
                                {hg.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                                    >
                                        {header.isPlaceholder ? null : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
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
                                    {row.getVisibleCells().map((cell, index) => (
                                        <TableCell
                                            key={cell.id}
                                            className={cn(
                                                'py-3',
                                                index === 0 && 'rounded-l-xl',
                                                index === row.getVisibleCells().length - 1 && 'rounded-r-xl'
                                            )}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-32 text-center text-sm text-muted-foreground"
                                >
                                    No inmates match the current filters.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* ── Pagination ── */}
            <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground tabular-nums">
                    Page{' '}
                    <span className="font-medium text-foreground">
                        {table.getState().pagination.pageIndex + 1}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium text-foreground">
                        {table.getPageCount() || 1}
                    </span>
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
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