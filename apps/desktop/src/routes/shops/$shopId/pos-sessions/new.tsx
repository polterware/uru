import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router"
import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PosSessionsRepository } from "@/lib/db/repositories/pos-sessions-repository"
import { LocationsRepository } from "@/lib/db/repositories/locations-repository"
import { UsersRepository } from "@/lib/db/repositories/users-repository"
import type { Location, User, CreatePosSessionDTO } from "@uru/types"

export const Route = createFileRoute("/shops/$shopId/pos-sessions/new")({
  component: NewPosSession,
})

function NewPosSession() {
  const navigate = useNavigate()
  const { shopId } = useParams({ from: "/shops/$shopId/pos-sessions/new" })
  const [isSaving, setIsSaving] = React.useState(false)
  const [locations, setLocations] = React.useState<Location[]>([])
  const [users, setUsers] = React.useState<User[]>([])

  const [formData, setFormData] = React.useState({
    location_id: "",
    operator_id: "",
    terminal_id: "",
    opening_cash_amount: "",
    opening_notes: "",
  })

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [locs, usrs] = await Promise.all([
          LocationsRepository.listByShop(shopId),
          UsersRepository.list(),
        ])
        // Filter to only store locations
        setLocations(locs.filter((l) => l.type === "store"))
        setUsers(usrs)
      } catch (error) {
        console.error("Failed to load data:", error)
        toast.error("Failed to load locations and operators")
      }
    }
    loadData()
  }, [shopId])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.operator_id) {
      toast.error("Please select an operator")
      return
    }

    try {
      setIsSaving(true)

      const payload: CreatePosSessionDTO = {
        shop_id: shopId,
        location_id: formData.location_id || undefined,
        operator_id: formData.operator_id,
        terminal_id: formData.terminal_id || undefined,
        opening_cash_amount: formData.opening_cash_amount
          ? parseFloat(formData.opening_cash_amount)
          : 0,
        opening_notes: formData.opening_notes || undefined,
      }

      await PosSessionsRepository.create(payload)
      toast.success("POS session opened successfully")
      navigate({ to: "/shops/$shopId/pos-sessions", params: { shopId } })
    } catch (error) {
      console.error("Failed to create POS session:", error)
      toast.error(error instanceof Error ? error.message : "Failed to open POS session")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-medium">Open POS Session</h3>
        <p className="text-sm text-muted-foreground">
          Start a new point of sale session. A session number will be generated automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Configuration</CardTitle>
              <CardDescription>
                Configure the operator, location, and terminal for this session.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="operator_id">Operator *</Label>
                  <Select
                    value={formData.operator_id}
                    onValueChange={(value) => handleChange("operator_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.email || user.phone || user.id.slice(0, 8)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    The cashier operating this session.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location_id">Location</Label>
                  <Select
                    value={formData.location_id}
                    onValueChange={(value) => handleChange("location_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Physical store where the POS is located.
                  </p>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="terminal_id">Terminal ID</Label>
                <Input
                  id="terminal_id"
                  value={formData.terminal_id}
                  onChange={(e) => handleChange("terminal_id", e.target.value)}
                  placeholder="TERM-01"
                />
                <p className="text-xs text-muted-foreground">
                  Identifier for the POS terminal/device.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Opening Cash</CardTitle>
              <CardDescription>
                Register the initial cash amount in the register.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="opening_cash_amount">Cash Amount</Label>
                <Input
                  id="opening_cash_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.opening_cash_amount}
                  onChange={(e) => handleChange("opening_cash_amount", e.target.value)}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  Amount of cash in the register at session start.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="opening_notes">Opening Notes</Label>
                <Textarea
                  id="opening_notes"
                  value={formData.opening_notes}
                  onChange={(e) => handleChange("opening_notes", e.target.value)}
                  rows={2}
                  placeholder="Any notes about the session opening..."
                />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: "/shops/$shopId/pos-sessions", params: { shopId } })}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Opening..." : "Open Session"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
