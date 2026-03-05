import type { FormEvent } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DataTable, type DataTableColumnFilter } from '@/components/ui/table'
import { ProductsRepository } from '@/lib/db/repositories'
import { formatCurrency, formatDateTime } from '@/lib/formatters'
import { getUser } from '@/lib/supabase/auth'
import type { Product } from '@/types/domain'

const PRODUCT_COLUMNS: Array<ColumnDef<Product>> = [
  {
    accessorKey: 'title',
    header: 'Título',
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
  },
  {
    accessorKey: 'price',
    header: 'Preço',
    cell: ({ row }) => formatCurrency(row.original.price),
  },
  {
    accessorKey: 'lifecycle_status',
    header: 'Status',
    filterFn: 'equalsString',
    cell: ({ row }) => <span className="capitalize">{row.original.lifecycle_status}</span>,
  },
  {
    accessorKey: 'created_at',
    header: 'Criado em',
    cell: ({ row }) => formatDateTime(row.original.created_at),
  },
]

const PRODUCT_FILTERS: Array<DataTableColumnFilter<Product>> = [
  {
    columnId: 'sku',
    label: 'SKU',
    type: 'text',
  },
  {
    columnId: 'lifecycle_status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Ativo', value: 'active' },
      { label: 'Inativo', value: 'inactive' },
      { label: 'Arquivado', value: 'archived' },
    ],
  },
]

export const Route = createFileRoute('/products')({
  beforeLoad: async () => {
    const user = await getUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }
  },
  component: ProductsPage,
})

function ProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Array<Product>>([])
  const [title, setTitle] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('0')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function loadProducts() {
    setIsLoading(true)
    setError(null)

    try {
      const data = await ProductsRepository.list()
      setProducts(data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load products')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadProducts()
  }, [])

  async function onCreateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const user = await getUser()
    if (!user) {
      await navigate({ to: '/login' })
      return
    }

    try {
      await ProductsRepository.create({
        title,
        sku,
        price: Number(price),
        created_by: user.id,
      })

      setTitle('')
      setSku('')
      setPrice('0')
      await loadProducts()
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create product')
    }
  }

  const totalSkus = useMemo(() => products.length, [products])

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Products</h1>
        <p className="text-sm text-muted-foreground">Supabase-only catalog management. Active SKUs: {totalSkus}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>New Product</CardTitle>
          <CardDescription>Create a product using the default catalog fields.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-4" onSubmit={onCreateProduct}>
            <div className="space-y-2">
              <Label htmlFor="product-title">Title</Label>
              <Input
                id="product-title"
                placeholder="Product title"
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-sku">SKU</Label>
              <Input
                id="product-sku"
                placeholder="SKU"
                required
                value={sku}
                onChange={(event) => setSku(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-price">Price</Label>
              <Input
                id="product-price"
                placeholder="Price"
                type="number"
                min="0"
                step="0.01"
                required
                value={price}
                onChange={(event) => setPrice(event.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                Add product
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={PRODUCT_COLUMNS}
            data={products}
            filters={PRODUCT_FILTERS}
            searchPlaceholder="Buscar por título, SKU ou status..."
            emptyMessage={isLoading ? 'Carregando produtos...' : 'Nenhum produto encontrado para os filtros atuais.'}
            exportFileName="uru-products"
          />
        </CardContent>
      </Card>
    </section>
  )
}
