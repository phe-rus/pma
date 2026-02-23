import {
    type ColumnDef,
    type TableOptions,
    type TableState,
    type PaginationState,
    type SortingState,
    type ColumnFiltersState,
    type VisibilityState,
    type ExpandedState,
    type RowSelectionState,
    type GroupingState,
    createColumnHelper,
    getCoreRowModel,
    getExpandedRowModel,
    getFacetedMinMaxValues,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getGroupedRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { useState } from "react"

export function createTypedColumnHelper<T>() {
    return createColumnHelper<T>()
}

export interface UseTableOptions<TData> {
    data: TData[]
    columns: ColumnDef<TData, any>[]
    enableRowSelection?: boolean
    enableExpanding?: boolean
    enableGrouping?: boolean
    enableFiltering?: boolean
    enableSorting?: boolean
    enablePagination?: boolean
    enableFaceted?: boolean
    initialState?: Partial<TableState>
    // Manual control options
    manualPagination?: boolean
    manualSorting?: boolean
    manualFiltering?: boolean
    pageCount?: number
    // Allow any other table options
    [key: string]: any
}

export function useTable<TData>({
    data,
    columns,
    enableRowSelection = false,
    enableExpanding = false,
    enableGrouping = false,
    enableFiltering = true,
    enableSorting = true,
    enablePagination = true,
    enableFaceted = true,
    initialState,
    manualPagination,
    manualSorting,
    manualFiltering,
    pageCount,
    ...restOptions
}: UseTableOptions<TData>) {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
        ...initialState?.pagination,
    })

    const [sorting, setSorting] = useState<SortingState>(initialState?.sorting ?? [])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialState?.columnFilters ?? [])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialState?.columnVisibility ?? {})
    const [expanded, setExpanded] = useState<ExpandedState>(initialState?.expanded ?? {})
    const [rowSelection, setRowSelection] = useState<RowSelectionState>(initialState?.rowSelection ?? {})
    const [grouping, setGrouping] = useState<GroupingState>(initialState?.grouping ?? [])

    // Build options object without conditional spreads to preserve types
    const options: TableOptions<TData> = {
        data,
        columns,
        state: {
            pagination,
            sorting,
            columnFilters,
            columnVisibility,
            expanded,
            rowSelection,
            grouping,
            ...initialState,
        },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onExpandedChange: setExpanded,
        onRowSelectionChange: setRowSelection,
        onGroupingChange: setGrouping,
        getCoreRowModel: getCoreRowModel(),
        ...restOptions,
    }

    if (enableSorting) {
        options.getSortedRowModel = getSortedRowModel()
    }
    if (enableFiltering) {
        options.getFilteredRowModel = getFilteredRowModel()
    }
    if (enablePagination) {
        options.getPaginationRowModel = getPaginationRowModel()
    }
    if (enableExpanding) {
        options.getExpandedRowModel = getExpandedRowModel()
    }
    if (enableGrouping) {
        options.getGroupedRowModel = getGroupedRowModel()
    }
    if (enableRowSelection) {
        options.enableRowSelection = true
    }
    if (enableFaceted) {
        options.getFacetedRowModel = getFacetedRowModel()
        options.getFacetedUniqueValues = getFacetedUniqueValues()
        options.getFacetedMinMaxValues = getFacetedMinMaxValues()
    }
    if (manualPagination !== undefined) {
        options.manualPagination = manualPagination
    }
    if (manualSorting !== undefined) {
        options.manualSorting = manualSorting
    }
    if (manualFiltering !== undefined) {
        options.manualFiltering = manualFiltering
    }
    if (pageCount !== undefined) {
        options.pageCount = pageCount
    }

    const table = useReactTable(options)
    return table
}

// Preset configurations for common use cases
export const tablePresets = {
    minimal: {
        enableSorting: false,
        enableFiltering: false,
        enablePagination: false,
        enableFaceted: false,
    },
    fullFeatured: {
        enableRowSelection: true,
        enableExpanding: true,
        enableGrouping: true,
        enableFiltering: true,
        enableSorting: true,
        enablePagination: true,
        enableFaceted: true,
    },
    serverSide: {
        enablePagination: true,
        enableSorting: true,
        enableFiltering: true,
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
    },
} as const