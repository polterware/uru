import { createFileRoute, useNavigate } from "@tanstack/react-router"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"
import { DebtorsRepository } from "@/lib/db/repositories/debtors-repository"

export const Route = createFileRoute("/debtors/new")({
  component: NewDebtor,
})

function NewDebtor() {
  const navigate = useNavigate()

  const [newName, setNewName] = React.useState("")
  const [newPhone, setNewPhone] = React.useState("")
  const [newEmail, setNewEmail] = React.useState("")
  const [newNotes, setNewNotes] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)

  const handleSaveDebtor = async () => {
    if (!newName) return

    try {
      setIsSaving(true)
      await DebtorsRepository.create({
        name: newName,
        phone: newPhone || undefined,
        email: newEmail || undefined,
        notes: newNotes || undefined,
        current_balance: 0,
        status: 'active'
      })

      navigate({ to: '/debtors' })
      toast.success("Customer created successfully")
    } catch (error) {
      console.error("Failed to create debtor:", error)
      toast.error("Failed to create customer")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-medium">Add Customer</h3>
        <p className="text-sm text-muted-foreground">
          Create a new customer profile for your store.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
            <CardDescription>
              Enter the contact information for the new customer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Customer Name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Phone Number"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Email Address"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Additional Notes"
              />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate({ to: '/debtors' })}>
                Cancel
              </Button>
              <Button onClick={handleSaveDebtor} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Customer"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
