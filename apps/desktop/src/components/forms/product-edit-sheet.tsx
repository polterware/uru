import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Product, ProductsRepository, UpdateProductDTO } from "@/lib/db/repositories/products-repository"
import { Brand } from "@/lib/db/repositories/brands-repository"
import { Category } from "@/lib/db/repositories/categories-repository"

type ProductEditSheetProps = {
  product: Product | null
  brands: Brand[]
  categories: Category[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const PRODUCT_TYPES = [
  { value: "physical", label: "Physical" },
  { value: "digital", label: "Digital" },
  { value: "service", label: "Service" },
  { value: "bundle", label: "Bundle" },
]

const PRODUCT_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
  { value: "out_of_stock", label: "Out of Stock" },
]

export function ProductEditSheet({
  product,
  brands,
  categories,
  open,
  onOpenChange,
  onSuccess,
}: ProductEditSheetProps) {
  const [isSaving, setIsSaving] = React.useState(false)
  const [formData, setFormData] = React.useState({
    sku: "",
    name: "",
    type: "physical",
    status: "draft",
    slug: "",
    gtin_ean: "",
    price: "",
    promotional_price: "",
    cost_price: "",
    currency: "BRL",
    tax_ncm: "",
    is_shippable: true,
    weight_g: "0",
    width_mm: "0",
    height_mm: "0",
    depth_mm: "0",
    brand_id: "",
    category_id: "",
    attributes: "",
    metadata: "",
  })

  React.useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku || "",
        name: product.name || "",
        type: product.type || "physical",
        status: product.status || "draft",
        slug: product.slug || "",
        gtin_ean: product.gtin_ean || "",
        price: product.price?.toString() || "",
        promotional_price: product.promotional_price?.toString() || "",
        cost_price: product.cost_price?.toString() || "",
        currency: product.currency || "BRL",
        tax_ncm: product.tax_ncm || "",
        is_shippable: product.is_shippable ?? true,
        weight_g: product.weight_g?.toString() || "0",
        width_mm: product.width_mm?.toString() || "0",
        height_mm: product.height_mm?.toString() || "0",
        depth_mm: product.depth_mm?.toString() || "0",
        brand_id: product.brand_id || "",
        category_id: product.category_id || "",
        attributes: product.attributes || "",
        metadata: product.metadata || "",
      })
    }
  }, [product])

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!product) return

    if (!formData.sku || !formData.name || !formData.price) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsSaving(true)

      const payload: UpdateProductDTO = {
        id: product.id,
        sku: formData.sku,
        name: formData.name,
        type: formData.type,
        status: formData.status || undefined,
        slug: formData.slug || undefined,
        gtin_ean: formData.gtin_ean || undefined,
        price: parseFloat(formData.price) || 0,
        promotional_price: formData.promotional_price
          ? parseFloat(formData.promotional_price)
          : undefined,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : undefined,
        currency: formData.currency || undefined,
        tax_ncm: formData.tax_ncm || undefined,
        is_shippable: formData.is_shippable,
        weight_g: parseInt(formData.weight_g) || 0,
        width_mm: parseInt(formData.width_mm) || 0,
        height_mm: parseInt(formData.height_mm) || 0,
        depth_mm: parseInt(formData.depth_mm) || 0,
        brand_id: formData.brand_id || undefined,
        category_id: formData.category_id || undefined,
        attributes: formData.attributes || undefined,
        metadata: formData.metadata || undefined,
      }

      await ProductsRepository.update(payload)
      toast.success("Product updated successfully")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update product:", error)
      toast.error("Failed to update product")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit Product</SheetTitle>
          <SheetDescription>
            Update product information. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-sku">
                      SKU <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="edit-sku"
                      value={formData.sku}
                      onChange={(e) => handleChange("sku", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-gtin_ean">GTIN/EAN</Label>
                    <Input
                      id="edit-gtin_ean"
                      value={formData.gtin_ean}
                      onChange={(e) => handleChange("gtin_ean", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-name">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-slug">Slug</Label>
                  <Input
                    id="edit-slug"
                    value={formData.slug}
                    onChange={(e) => handleChange("slug", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleChange("type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleChange("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-brand_id">Brand</Label>
                  <Select
                    value={formData.brand_id || "none"}
                    onValueChange={(value) => handleChange("brand_id", value === "none" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-category_id">Category</Label>
                  <Select
                    value={formData.category_id || "none"}
                    onValueChange={(value) => handleChange("category_id", value === "none" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Pricing</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-price">
                      Price <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="edit-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-promotional_price">Promo Price</Label>
                    <Input
                      id="edit-promotional_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.promotional_price}
                      onChange={(e) => handleChange("promotional_price", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-cost_price">Cost Price</Label>
                    <Input
                      id="edit-cost_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.cost_price}
                      onChange={(e) => handleChange("cost_price", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => handleChange("currency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">BRL</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Shipping</h4>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-is_shippable"
                    checked={formData.is_shippable}
                    onCheckedChange={(checked) =>
                      handleChange("is_shippable", checked as boolean)
                    }
                  />
                  <Label htmlFor="edit-is_shippable">Requires shipping</Label>
                </div>

                {formData.is_shippable && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-weight_g">Weight (g)</Label>
                      <Input
                        id="edit-weight_g"
                        type="number"
                        min="0"
                        value={formData.weight_g}
                        onChange={(e) => handleChange("weight_g", e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-width_mm">W (mm)</Label>
                        <Input
                          id="edit-width_mm"
                          type="number"
                          min="0"
                          value={formData.width_mm}
                          onChange={(e) => handleChange("width_mm", e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-height_mm">H (mm)</Label>
                        <Input
                          id="edit-height_mm"
                          type="number"
                          min="0"
                          value={formData.height_mm}
                          onChange={(e) => handleChange("height_mm", e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-depth_mm">D (mm)</Label>
                        <Input
                          id="edit-depth_mm"
                          type="number"
                          min="0"
                          value={formData.depth_mm}
                          onChange={(e) => handleChange("depth_mm", e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Advanced */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Advanced</h4>
                <div className="grid gap-2">
                  <Label htmlFor="edit-attributes">Attributes (JSON)</Label>
                  <Textarea
                    id="edit-attributes"
                    value={formData.attributes}
                    onChange={(e) => handleChange("attributes", e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-metadata">Metadata (JSON)</Label>
                  <Textarea
                    id="edit-metadata"
                    value={formData.metadata}
                    onChange={(e) => handleChange("metadata", e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
          <SheetFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
