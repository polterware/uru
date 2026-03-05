import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  DownloadIcon,
  FilterXIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="table-container" className="relative w-full min-w-0 overflow-x-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("bg-muted/50 border-t font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn("hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors", className)}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn("text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn("p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

const DATA_TABLE_PAGE_SIZES = [10, 20, 50, 100]
const DATA_TABLE_ALL_VALUE = "__all__"

export type DataTableColumnOption = {
  label: string
  value: string
}

export type DataTableColumnFilter<TData> = {
  columnId: string
  label: string
  type?: "text" | "select"
  placeholder?: string
  options?: Array<DataTableColumnOption>
  parser?: (value: string) => TData[keyof TData] | string
}

export type DataTableProps<TData, TValue> = {
  columns: Array<ColumnDef<TData, TValue>>
  data: Array<TData>
  searchPlaceholder?: string
  emptyMessage?: string
  filters?: Array<DataTableColumnFilter<TData>>
  initialPageSize?: number
  exportFileName?: string
}

function normalizeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return ""
  }

  if (typeof value === "string") {
    return value
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  return JSON.stringify(value)
}

function escapeCsvValue(value: unknown): string {
  return `"${normalizeCsvValue(value).replaceAll('"', '""')}"`
}

function getHeaderLabel(header: unknown, fallback: string): string {
  return typeof header === "string" ? header : fallback
}

function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Buscar em todas as colunas...",
  emptyMessage = "Nenhum registro encontrado.",
  filters = [],
  initialPageSize = 10,
  exportFileName = "export",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: initialPageSize,
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    globalFilterFn: "includesString",
  })

  const activeFilterCount = columnFilters.length + (globalFilter.trim().length > 0 ? 1 : 0)

  const filteredRowsCount = table.getFilteredRowModel().rows.length
  const canResetView = sorting.length > 0 || activeFilterCount > 0

  const onResetView = React.useCallback(() => {
    setGlobalFilter("")
    setColumnFilters([])
    table.resetSorting()
    table.setPageIndex(0)
  }, [table])

  const resolveFilterOptions = React.useCallback(
    (columnId: string, options?: Array<DataTableColumnOption>) => {
      if (options && options.length > 0) {
        return options
      }

      const column = table.getColumn(columnId)
      if (!column) {
        return []
      }

      return Array.from(column.getFacetedUniqueValues().keys())
        .map((value) => String(value ?? "").trim())
        .filter((value) => value.length > 0)
        .filter((value, index, values) => values.indexOf(value) === index)
        .sort((left, right) => left.localeCompare(right))
        .map((value) => ({ label: value, value }))
    },
    [table]
  )

  const onExportCsv = React.useCallback(() => {
    if (typeof window === "undefined") {
      return
    }

    const visibleColumns = table.getVisibleLeafColumns()
    if (visibleColumns.length === 0) {
      return
    }

    const rows = table.getFilteredRowModel().rows
    if (rows.length === 0) {
      return
    }

    const headerLine = visibleColumns
      .map((column) => escapeCsvValue(getHeaderLabel(column.columnDef.header, column.id)))
      .join(",")

    const bodyLines = rows.map((row) => {
      return visibleColumns
        .map((column) => {
          return escapeCsvValue(row.getValue(column.id))
        })
        .join(",")
    })

    const csv = [headerLine, ...bodyLines].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = exportFileName.endsWith(".csv") ? exportFileName : `${exportFileName}.csv`
    anchor.click()

    URL.revokeObjectURL(url)
  }, [table, exportFileName])

  return (
    <div className="space-y-3" data-slot="data-table">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          aria-label="Busca global"
          className="h-8 w-full max-w-sm"
          placeholder={searchPlaceholder}
          value={globalFilter}
          onChange={(event) => {
            setGlobalFilter(event.target.value)
            table.setPageIndex(0)
          }}
        />

        {filters.map((filter) => {
          const column = table.getColumn(filter.columnId)
          if (!column) {
            return null
          }

          const filterValue = String(column.getFilterValue() ?? "")
          const options = filter.type === "select" ? resolveFilterOptions(filter.columnId, filter.options) : []

          if (filter.type === "select") {
            return (
              <Select
                key={filter.columnId}
                value={filterValue || DATA_TABLE_ALL_VALUE}
                onValueChange={(value) => {
                  column.setFilterValue(value === DATA_TABLE_ALL_VALUE ? undefined : filter.parser ? filter.parser(value) : value)
                  table.setPageIndex(0)
                }}
              >
                <SelectTrigger size="sm" className="h-8 min-w-[180px]">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value={DATA_TABLE_ALL_VALUE}>Todos - {filter.label}</SelectItem>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          }

          return (
            <Input
              key={filter.columnId}
              aria-label={`Filtro ${filter.label}`}
              className="h-8 w-[180px]"
              placeholder={filter.placeholder ?? `Filtrar ${filter.label.toLowerCase()}...`}
              value={filterValue}
              onChange={(event) => {
                column.setFilterValue(filter.parser ? filter.parser(event.target.value) : event.target.value)
                table.setPageIndex(0)
              }}
            />
          )
        })}

        <Button size="sm" variant="outline" disabled={!canResetView} onClick={onResetView}>
          <FilterXIcon className="size-4" />
          Limpar
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              Colunas
              <ChevronDownIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Exibir colunas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  className="capitalize"
                  onCheckedChange={(value) => {
                    column.toggleVisibility(Boolean(value))
                  }}
                >
                  {column.id.replaceAll("_", " ")}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          variant="outline"
          disabled={filteredRowsCount === 0}
          onClick={onExportCsv}
        >
          <DownloadIcon className="size-4" />
          CSV
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted()
                  const canSort = header.column.getCanSort()

                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : canSort ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="-ml-2 h-8 px-2"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === "asc" ? (
                            <ArrowUpIcon className="size-3.5" />
                          ) : sorted === "desc" ? (
                            <ArrowDownIcon className="size-3.5" />
                          ) : (
                            <ArrowUpDownIcon className="text-muted-foreground size-3.5" />
                          )}
                        </Button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell className="text-muted-foreground h-24 text-center" colSpan={table.getVisibleLeafColumns().length || 1}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">
          Mostrando {table.getRowModel().rows.length} de {filteredRowsCount} registros filtrados ({data.length} no total)
        </p>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground text-xs">Linhas</span>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger size="sm" className="h-8 w-20">
              <SelectValue placeholder={String(initialPageSize)} />
            </SelectTrigger>
            <SelectContent align="end">
              {DATA_TABLE_PAGE_SIZES.map((pageSize) => (
                <SelectItem key={pageSize} value={String(pageSize)}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-muted-foreground px-2 text-xs">
            Página {table.getState().pagination.pageIndex + 1} de {Math.max(table.getPageCount(), 1)}
          </span>

          <Button
            aria-label="Primeira página"
            size="icon-sm"
            variant="outline"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.setPageIndex(0)}
          >
            <ChevronsLeftIcon className="size-4" />
          </Button>
          <Button
            aria-label="Página anterior"
            size="icon-sm"
            variant="outline"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button
            aria-label="Próxima página"
            size="icon-sm"
            variant="outline"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            <ChevronRightIcon className="size-4" />
          </Button>
          <Button
            aria-label="Última página"
            size="icon-sm"
            variant="outline"
            disabled={!table.getCanNextPage()}
            onClick={() => table.setPageIndex(Math.max(table.getPageCount() - 1, 0))}
          >
            <ChevronsRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export {
  DataTable,
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
