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
import { InventoryRepository } from "@/lib/db/repositories/inventory-repository"

export const Route = createFileRoute("/inventory/new")({
  component: NewInventoryItem,
})

function NewInventoryItem() {
  const navigate = useNavigate()

  const [newItemName, setNewItemName] = React.useState("")
  const [newItemSku, setNewItemSku] = React.useState("")
  const [newItemQuantity, setNewItemQuantity] = React.useState("")
  const [newItemPrice, setNewItemPrice] = React.useState("")
  const [newItemMinStock, setNewItemMinStock] = React.useState("5")
  const [isSaving, setIsSaving] = React.useState(false)

  const handleSaveItem = async () => {
    if (!newItemName) return

    try {
      setIsSaving(true)
      const newItemPayload = {
        name: newItemName,
        sku: newItemSku,
        quantity: parseFloat(newItemQuantity) || 0,
        selling_price: parseFloat(newItemPrice) || 0,
        min_stock_level: parseFloat(newItemMinStock) || 5,
      }
      console.log('[NewInventoryItem] Creating item with payload:', newItemPayload)

      await InventoryRepository.create(newItemPayload)

      navigate({ to: '/inventory' })
      toast.success("Item created successfully")
    } catch (error) {
      console.error("Failed to create item:", error)
      toast.error("Failed to create item")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-medium">Add Inventory Item</h3>
        <p className="text-sm text-muted-foreground">
          Register a new product to your inventory.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>
              Enter the product information below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Item Name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={newItemSku}
                onChange={(e) => setNewItemSku(e.target.value)}
                placeholder="Stock Keeping Unit"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minStock">Min Stock</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={newItemMinStock}
                  onChange={(e) => setNewItemMinStock(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Price (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate({ to: '/inventory' })}>
                Cancel
              </Button>
              <Button onClick={handleSaveItem} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Item"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
