import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, Copy, Lock } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DataTable } from "@/components/tables/data-table"
import { formatCurrency, formatDateTime } from "@/lib/formatters"
import { PosSessionsRepository } from "@/lib/db/repositories/pos-sessions-repository"
import type { PosSession } from "@uru/types"
import { useNavigate } from "@tanstack/react-router"
import { useShop } from "@/hooks/use-shop"

type PosSessionRow = PosSession

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  open: "default",
  paused: "outline",
  closed: "secondary",
  cancelled: "destructive",
}

export function PosSessionsTable() {
  const navigate = useNavigate()
  const { shopId } = useShop()
  const [data, setData] = React.useState<PosSessionRow[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const loadData = React.useCallback(async () => {
    if (!shopId) return

    try {
      setIsLoading(true)
      const sessions = await PosSessionsRepository.listByShop(shopId)
      setData(sessions)
    } catch (error) {
      console.error("Failed to load POS sessions:", error)
      toast.error("Failed to load POS sessions")
    } finally {
      setIsLoading(false)
    }
  }, [shopId])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await PosSessionsRepository.delete(deleteId)
      toast.success("POS session deleted successfully")
      loadData()
    } catch (error) {
      console.error("Failed to delete POS session:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete POS session")
    } finally {
      setDeleteId(null)
    }
  }

  const handleEdit = (session: PosSession) => {
    if (!shopId) return
    navigate({
      to: "/shops/$shopId/pos-sessions/$posSessionId/edit",
      params: { shopId, posSessionId: session.id },
    })
  }

  const columns: ColumnDef<PosSessionRow>[] = React.useMemo(
    () => [
      {
        accessorKey: "session_number",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            #
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-mono">#{row.getValue("session_number") || "-"}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string
          const variant = STATUS_VARIANTS[status] || "outline"
          return <Badge variant={variant}>{status || "-"}</Badge>
        },
      },
      {
        accessorKey: "terminal_id",
        header: "Terminal",
        cell: ({ row }) => row.getValue("terminal_id") || "-",
      },
      {
        accessorKey: "opening_cash_amount",
        header: "Opening Cash",
        cell: ({ row }) => formatCurrency(row.getValue("opening_cash_amount")),
      },
      {
        accessorKey: "total_sales",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Sales
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{formatCurrency(row.getValue("total_sales"))}</div>
        ),
      },
      {
        accessorKey: "total_returns",
        header: "Returns",
        cell: ({ row }) => {
          const value = row.getValue("total_returns") as number
          return value > 0 ? `-${formatCurrency(value)}` : "-"
        },
      },
      {
        accessorKey: "transaction_count",
        header: "Transactions",
        cell: ({ row }) => row.getValue("transaction_count") || 0,
      },
      {
        accessorKey: "closing_cash_amount",
        header: "Closing Cash",
        cell: ({ row }) => {
          const value = row.getValue("closing_cash_amount") as number | null
          return value !== null ? formatCurrency(value) : "-"
        },
      },
      {
        accessorKey: "cash_difference",
        header: "Difference",
        cell: ({ row }) => {
          const value = row.original.cash_difference
          if (value === null) return "-"
          const isNegative = value < 0
          const color = isNegative ? "text-destructive" : value > 0 ? "text-green-600" : ""
          return (
            <span className={color}>
              {isNegative ? "-" : value > 0 ? "+" : ""}
              {formatCurrency(Math.abs(value))}
            </span>
          )
        },
      },
      {
        accessorKey: "opened_at",
        header: "Opened",
        cell: ({ row }) => formatDateTime(row.getValue("opened_at")),
      },
      {
        accessorKey: "closed_at",
        header: "Closed",
        cell: ({ row }) => formatDateTime(row.getValue("closed_at")),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const session = row.original
          const isClosed = session.status === "closed"

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(session.id)
                    toast.success("ID copied to clipboard")
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleEdit(session)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {isClosed ? "View" : "Edit / Close"}
                </DropdownMenuItem>
                {!session.status || session.status === "open" ? (
                  <DropdownMenuItem disabled className="text-muted-foreground">
                    <Lock className="mr-2 h-4 w-4" />
                    Cannot delete open session
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setDeleteId(session.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [shopId]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading POS sessions...</div>
      </div>
    )
  }

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        filterColumnId="terminal_id"
        filterPlaceholder="Filter by terminal..."
        emptyMessage="No POS sessions found."
        action={{
          label: "Open Session",
          to: `/shops/${shopId}/pos-sessions/new`,
        }}
        onRowDoubleClick={handleEdit}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the POS session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
