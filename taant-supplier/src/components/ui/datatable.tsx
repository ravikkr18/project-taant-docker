'use client'

import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  Download,
  RefreshCw,
  Filter,
} from 'lucide-react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  title?: string
  description?: string
  searchPlaceholder?: string
  enableMultiSelect?: boolean
  enableSearch?: boolean
  enableFilters?: boolean
  enableSorting?: boolean
  enablePagination?: boolean
  pageSize?: number
  className?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  title,
  description,
  searchPlaceholder = "Search...",
  enableMultiSelect = true,
  enableSearch = true,
  enableFilters = true,
  enableSorting = true,
  enablePagination = true,
  pageSize = 10,
  className = "",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

  const extendedColumns = useMemo(() => {
    if (enableMultiSelect) {
      return [
        {
          id: 'select',
          header: ({ table }) => (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
              className="h-4 w-4"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              className="h-4 w-4"
            />
          ),
          enableSorting: false,
          enableHiding: false,
        },
        ...columns.map((column) => ({
          ...column,
          header: (props: any) => {
            if (!enableSorting || !column.enableSorting) {
              return <div className="text-xs font-medium text-gray-600">{column.header as string}</div>
            }
            return (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
                onClick={() => props.column.toggleSorting(props.column.getIsSorted() === 'asc')}
              >
                <span>{column.header as string}</span>
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            )
          },
        })),
      ]
    }
    return columns.map((column) => ({
      ...column,
      header: (props: any) => {
        if (!enableSorting || !column.enableSorting) {
          return <div className="text-xs font-medium text-gray-600">{column.header as string}</div>
        }
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
            onClick={() => props.column.toggleSorting(props.column.getIsSorted() === 'asc')}
          >
            <span>{column.header as string}</span>
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        )
      },
    }))
  }, [columns, enableMultiSelect, enableSorting])

  const table = useReactTable({
    data,
    columns: extendedColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows

  return (
    <Card className={`border-gray-100 shadow-sm ${className}`}>
      {(title || enableSearch || enableFilters) && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {title && <CardTitle className="text-sm font-semibold text-gray-800 mb-1">{title}</CardTitle>}
              {description && <p className="text-xs text-gray-400">{description}</p>}
            </div>
            <div className="flex items-center gap-2">
              {selectedRows.length > 0 && (
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 h-auto">
                  {selectedRows.length} selected
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs border-gray-200"
                onClick={() => table.resetColumnFilters()}
              >
                <RefreshCw className="h-3 w-3 mr-1.5" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs border-gray-200"
                onClick={() => {
                  // Export functionality here
                  console.log('Export data:', selectedRows.length > 0 ? selectedRows : data)
                }}
              >
                <Download className="h-3 w-3 mr-1.5" />
                Export
              </Button>
            </div>
          </div>

          {enableSearch && (
            <div className="flex items-center gap-3 mt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  placeholder={searchPlaceholder}
                  value={globalFilter ?? ''}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-8 h-8 text-xs border-gray-200 focus:border-slate-500 focus:ring-slate-500"
                />
              </div>
              {enableFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs border-gray-200"
                >
                  <Filter className="h-3 w-3 mr-1.5" />
                  Filters
                </Button>
              )}
            </div>
          )}
        </CardHeader>
      )}

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-5 py-3 text-left">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-5 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-2">
                        <Search className="h-4 w-4 text-gray-300" />
                      </div>
                      <p className="text-sm font-medium text-gray-400">No results found</p>
                      <p className="text-xs text-gray-300 mt-1">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {enablePagination && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-400">
                Showing {table.getFilteredRowModel().rows.length} of {data.length} results
              </p>
              {selectedRows.length > 0 && (
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 h-auto ml-2">
                  {selectedRows.length} selected
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger className="h-8 w-16 text-xs border-gray-200">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`} className="text-xs">
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0 border-gray-200"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronsLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0 border-gray-200"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <div className="flex items-center justify-center text-xs font-medium text-gray-600 min-w-[80px]">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </div>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0 border-gray-200"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0 border-gray-200"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <ChevronsRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}