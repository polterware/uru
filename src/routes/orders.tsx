import { useEffect, useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { getUser } from '@/lib/supabase/auth'
import { OrdersRepository } from '@/lib/db/repositories'
import type { Order } from '@/types/domain'

export const Route = createFileRoute('/orders')({
  beforeLoad: async () => {
    const user = await getUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }
  },
  component: OrdersPage,
})

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let ignore = false

    async function loadOrders() {
      setIsLoading(true)
      setError(null)

      try {
        const data = await OrdersRepository.list()
        if (!ignore) {
          setOrders(data)
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load orders')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadOrders()

    return () => {
      ignore = true
    }
  }, [])

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-sm text-app-muted">Single-context order management with Supabase RLS.</p>
      </header>

      {error ? <p className="text-sm text-app-danger">{error}</p> : null}

      <div className="overflow-hidden rounded border border-app-border">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-app-panel text-left text-app-muted">
            <tr>
              <th className="px-4 py-2">Order</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Payment</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-3 text-app-muted" colSpan={5}>
                  Loading...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-app-muted" colSpan={5}>
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-t border-app-border">
                  <td className="px-4 py-2 font-medium">{order.order_number}</td>
                  <td className="px-4 py-2 capitalize">{order.status}</td>
                  <td className="px-4 py-2 capitalize">{order.payment_status}</td>
                  <td className="px-4 py-2">{order.total_amount}</td>
                  <td className="px-4 py-2">{new Date(order.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
