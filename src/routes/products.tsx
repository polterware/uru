import { FormEvent, useEffect, useMemo, useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { getUser } from '@/lib/supabase/auth'
import { ProductsRepository } from '@/lib/db/repositories'
import type { Product } from '@/types/domain'

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
  const [products, setProducts] = useState<Product[]>([])
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
      window.location.href = '/login'
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
        <p className="text-sm text-app-muted">Supabase-only catalog management. Active SKUs: {totalSkus}</p>
      </header>

      <form className="grid gap-3 rounded border border-app-border bg-app-panel p-4 md:grid-cols-4" onSubmit={onCreateProduct}>
        <input
          className="rounded border border-app-border bg-app-panel-strong px-3 py-2 text-sm"
          placeholder="Product title"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <input
          className="rounded border border-app-border bg-app-panel-strong px-3 py-2 text-sm"
          placeholder="SKU"
          required
          value={sku}
          onChange={(event) => setSku(event.target.value)}
        />
        <input
          className="rounded border border-app-border bg-app-panel-strong px-3 py-2 text-sm"
          placeholder="Price"
          type="number"
          min="0"
          step="0.01"
          required
          value={price}
          onChange={(event) => setPrice(event.target.value)}
        />
        <button type="submit" className="rounded bg-app-success px-3 py-2 text-sm font-medium text-black transition-colors hover:opacity-90">
          Add product
        </button>
      </form>

      {error ? <p className="text-sm text-app-danger">{error}</p> : null}

      <div className="overflow-hidden rounded border border-app-border">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-app-panel text-left text-app-muted">
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">SKU</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-3 text-app-muted" colSpan={4}>
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-app-muted" colSpan={4}>
                  No products yet.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-t border-app-border">
                  <td className="px-4 py-2">{product.title}</td>
                  <td className="px-4 py-2">{product.sku}</td>
                  <td className="px-4 py-2">{product.price}</td>
                  <td className="px-4 py-2 capitalize">{product.lifecycle_status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
