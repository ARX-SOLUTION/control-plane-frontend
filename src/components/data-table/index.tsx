import * as React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type TableOptions,
  type Table,
  type SortingState,
  getSortedRowModel,
} from '@tanstack/react-table'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  isLoading?: boolean
  emptyMessage?: string
  className?: string
}

// ─── useDataTable hook ────────────────────────────────────────────────────────

export function useDataTable<TData>(
  options: Omit<TableOptions<TData>, 'getCoreRowModel'>
): Table<TData> {
  return useReactTable({
    ...options,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (sorted === 'asc') return <ChevronUp className="h-3.5 w-3.5" />
  if (sorted === 'desc') return <ChevronDown className="h-3.5 w-3.5" />
  return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function SkeletonRows({ columnCount }: { columnCount: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, rowIdx) => (
        <tr key={rowIdx} className="border-b border-border">
          {Array.from({ length: columnCount }).map((_, colIdx) => (
            <td key={colIdx} className="h-11 px-4 py-2">
              <Skeleton
                variant="line"
                className={cn(
                  'h-4',
                  colIdx === 0 ? 'w-2/3' : 'w-1/2'
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// ─── DataTable ────────────────────────────────────────────────────────────────

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No results found.',
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const rows = table.getRowModel().rows
  const headerGroups = table.getHeaderGroups()

  return (
    <div className={cn('w-full overflow-auto rounded-md border border-border', className)}>
      <table className="w-full text-sm">
        {/* ── Header ── */}
        <thead className="sticky top-0 z-10 bg-bg-2 border-b border-border">
          {headerGroups.map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort()
                const sorted = header.column.getIsSorted()

                return (
                  <th
                    key={header.id}
                    scope="col"
                    colSpan={header.colSpan}
                    className={cn(
                      'h-10 px-4 text-left text-xs font-medium uppercase tracking-wide text-fg-muted',
                      'whitespace-nowrap select-none',
                      canSort && 'cursor-pointer hover:text-fg'
                    )}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                  >
                    {header.isPlaceholder ? null : (
                      <span className="inline-flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && <SortIcon sorted={sorted} />}
                      </span>
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>

        {/* ── Body ── */}
        <tbody className="bg-bg-1 divide-y divide-border">
          {isLoading ? (
            <SkeletonRows columnCount={columns.length} />
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="h-32 text-center text-sm text-fg-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                className="h-11 transition-colors hover:bg-bg-2"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2 text-sm text-fg">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
