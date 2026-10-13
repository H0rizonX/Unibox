import { getRouteApi } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { EmptyState } from '@/components/empty-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { cn } from '@/lib/utils'
import { priorities, statuses } from '../data/data'
import type { Task } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { tasksColumns as columns } from './tasks-columns'
import { useTasks } from './tasks-provider'

const route = getRouteApi('/_authenticated/tasks/')

type DataTableProps = {
  data: Task[]
  pageCount?: number
  isLoading?: boolean
}

export function TasksTable({
  data,
  pageCount: totalPages,
  isLoading,
}: DataTableProps) {
  const { setOpen } = useTasks()

  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // Local state management for table (uncomment to use local-only state, not synced with URL)
  // const [globalFilter, onGlobalFilterChange] = useState('')
  // const [columnFilters, onColumnFiltersChange] = useState<ColumnFiltersState>([])
  // const [pagination, onPaginationChange] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  // Synced with URL states (updated to match route search schema defaults)
  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search: route.useSearch(),
    navigate: route.useNavigate(),
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [
      { columnId: 'status', searchKey: 'status', type: 'array' },
      { columnId: 'priority', searchKey: 'priority', type: 'array' },
    ],
  })

  const isServerPagination = totalPages !== undefined
  const hasFilters =
    columnFilters.some(
      (f) =>
        (f.value as unknown[] | string | undefined) &&
        (Array.isArray(f.value) ? f.value.length > 0 : true)
    ) ||
    (typeof globalFilter === 'string' && globalFilter.trim().length > 0)

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    manualPagination: isServerPagination,
    pageCount: isServerPagination ? totalPages : undefined,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: isServerPagination
      ? undefined
      : (row, _columnId, filterValue) => {
          const id = String(row.getValue('id')).toLowerCase()
          const title = String(row.getValue('title')).toLowerCase()
          const searchValue = String(filterValue).toLowerCase()

          return id.includes(searchValue) || title.includes(searchValue)
        },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: isServerPagination ? undefined : getFilteredRowModel(),
    getPaginationRowModel: isServerPagination
      ? undefined
      : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
  })

  const tablePageCount = totalPages ?? table.getPageCount()
  useEffect(() => {
    ensurePageInRange(tablePageCount)
  }, [tablePageCount, ensurePageInRange])

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16', // Add margin bottom to the table on mobile when the toolbar is visible
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder="按标题或 ID 筛选..."
        filters={[
          {
            columnId: 'status',
            title: '状态',
            options: statuses,
          },
          {
            columnId: 'priority',
            title: '优先级',
            options: priorities,
          },
        ]}
      />
      <div className="overflow-hidden rounded-md border">
        <Table className="min-w-xl">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        header.column.columnDef.meta?.className,
                        header.column.columnDef.meta?.thClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  加载中...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  {hasFilters ? (
                    <EmptyState
                      variant="tasks"
                      compact
                      title="没有匹配的任务"
                      description="尝试调整筛选条件或清除过滤器。"
                    />
                  ) : (
                    <EmptyState
                      variant="tasks"
                      compact
                      action={{
                        label: '创建任务',
                        onClick: () => setOpen('create'),
                      }}
                      secondaryAction={{
                        label: '导入',
                        onClick: () => setOpen('import'),
                      }}
                    />
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className="mt-auto" />
      <DataTableBulkActions table={table} />
    </div>
  )
}
