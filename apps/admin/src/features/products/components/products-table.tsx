import {
  type ColumnFiltersState,
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
import { useState } from 'react'
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
import { cn } from '@/lib/utils'
import { categories, productStatuses } from '../data/data'
import type { Product } from '../data/schema'
import { productsColumns as columns } from './products-columns'
import { useProducts } from './products-provider'

type DataTableProps = {
  data: Product[]
}

export function ProductsTable({ data }: DataTableProps) {
  const { setOpen } = useProducts()
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

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
    enableRowSelection: false,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    globalFilterFn: (row, _columnId, filterValue) => {
      const name = String(row.getValue('name')).toLowerCase()
      const description = String(
        row.getValue('description') ?? ''
      ).toLowerCase()
      const searchValue = String(filterValue).toLowerCase()
      return name.includes(searchValue) || description.includes(searchValue)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const hasFilters =
    columnFilters.some(
      (f) =>
        (f.value as unknown[] | string | undefined) &&
        (Array.isArray(f.value) ? f.value.length > 0 : true)
    ) ||
    (typeof globalFilter === 'string' && globalFilter.trim().length > 0)

  return (
    <div className={cn('flex flex-1 flex-col gap-4')}>
      <DataTableToolbar
        table={table}
        searchPlaceholder="按名称或描述筛选..."
        filters={[
          {
            columnId: 'status',
            title: '状态',
            options: productStatuses.map((item) => ({
              label: item.label,
              value: item.value,
            })),
          },
          {
            columnId: 'category',
            title: '分类',
            options: categories.map((item) => ({
              label: item.label,
              value: item.value,
            })),
          },
        ]}
      />
      <div className="overflow-hidden rounded-md border">
        <Table className="min-w-xl">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                      variant="products"
                      compact
                      title="没有匹配的商品"
                      description="尝试调整筛选条件或清除过滤器。"
                    />
                  ) : (
                    <EmptyState
                      variant="products"
                      compact
                      action={{
                        label: '上传商品',
                        onClick: () => setOpen('create'),
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
    </div>
  )
}
