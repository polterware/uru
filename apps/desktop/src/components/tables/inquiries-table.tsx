import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, MessageSquare } from "lucide-react"
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
import { formatDateTime } from "@/lib/formatters"
import { InquiriesRepository } from "@/lib/db/repositories/inquiries-repository"
import type { Inquiry } from "@uru/types"
import { useNavigate } from "@tanstack/react-router"
import { useShop } from "@/hooks/use-shop"

type InquiryRow = Inquiry

const getStatusBadgeVariant = (status: string | null) => {
  switch (status) {
    case "new":
      return "default"
    case "open":
    case "pending":
      return "outline"
    case "resolved":
    case "closed":
      return "secondary"
    default:
      return "outline"
  }
}

const getPriorityBadgeVariant = (priority: string | null) => {
  switch (priority) {
    case "high":
    case "urgent":
      return "destructive"
    case "medium":
    case "normal":
      return "secondary"
    case "low":
      return "outline"
    default:
      return "outline"
  }
}

export function InquiriesTable() {
  const navigate = useNavigate()
  const { shopId } = useShop()
  const [data, setData] = React.useState<InquiryRow[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const loadData = React.useCallback(async () => {
    if (!shopId) return

    try {
      setIsLoading(true)
      const inquiries = await InquiriesRepository.listByShop(shopId)
      setData(inquiries)
    } catch (error) {
      console.error("Failed to load inquiries:", error)
      toast.error("Failed to load inquiries")
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
      await InquiriesRepository.delete(deleteId)
      toast.success("Inquiry deleted successfully")
      loadData()
    } catch (error) {
      console.error("Failed to delete inquiry:", error)
      toast.error("Failed to delete inquiry")
    } finally {
      setDeleteId(null)
    }
  }

  const handleEdit = (inquiry: Inquiry) => {
    if (!shopId) return
    navigate({
      to: "/shops/$shopId/inquiries/$inquiryId/edit",
      params: { shopId, inquiryId: inquiry.id },
    })
  }

  const columns: ColumnDef<InquiryRow>[] = React.useMemo(
    () => [
      {
        accessorKey: "protocol_number",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Protocol
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const protocol = row.getValue("protocol_number") as string
          return (
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-sm">{protocol}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string | null
          return (
            <Badge variant={getStatusBadgeVariant(status)}>
              {status || "New"}
            </Badge>
          )
        },
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => {
          const priority = row.getValue("priority") as string | null
          return (
            <Badge variant={getPriorityBadgeVariant(priority)}>
              {priority || "Normal"}
            </Badge>
          )
        },
      },
      {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }) => row.getValue("subject") || "-",
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created At
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => formatDateTime(row.getValue("created_at")),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const inquiry = row.original

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
                  onClick={() => navigator.clipboard.writeText(inquiry.id)}
                >
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleEdit(inquiry)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeleteId(inquiry.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
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
        <div className="text-muted-foreground">Loading inquiries...</div>
      </div>
    )
  }

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        filterColumnId="protocol_number"
        filterPlaceholder="Filter inquiries..."
        emptyMessage="No inquiries found."
        action={{
          label: "New Inquiry",
          to: `/shops/${shopId}/inquiries/new`,
        }}
        onRowDoubleClick={handleEdit}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the inquiry.
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
