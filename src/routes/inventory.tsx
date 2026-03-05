import { useEffect, useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { getUser } from '@/lib/supabase/auth'
import { InventoryLevelsRepository } from '@/lib/db/repositories'
import type { InventoryLevel } from '@/types/domain'

export const Route = createFileRoute('/inventory')({
  beforeLoad: async () => {
    const user = await getUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }
  },
  component: InventoryPage,
})

function InventoryPage() {
  const [levels, setLevels] = useState<InventoryLevel[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let ignore = false

    async function loadInventory() {
      setIsLoading(true)
      setError(null)

      try {
        const data = await InventoryLevelsRepository.list()
        if (!ignore) {
          setLevels(data)
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load inventory')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadInventory()

    return () => {
      ignore = true
    }
  }, [])

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <p className="text-sm text-app-muted">Live inventory levels sourced only from Supabase.</p>
      </header>

      {error ? <p className="text-sm text-app-danger">{error}</p> : null}

      <div className="overflow-hidden rounded border border-app-border">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-app-panel text-left text-app-muted">
            <tr>
              <th className="px-4 py-2">Inventory level</th>
              <th className="px-4 py-2">On hand</th>
              <th className="px-4 py-2">Reserved</th>
              <th className="px-4 py-2">Available</th>
              <th className="px-4 py-2">Updated</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-3 text-app-muted" colSpan={5}>
                  Loading...
                </td>
              </tr>
            ) : levels.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-app-muted" colSpan={5}>
                  No inventory levels yet.
                </td>
              </tr>
            ) : (
              levels.map((level) => (
                <tr key={level.id} className="border-t border-app-border">
                  <td className="px-4 py-2">{level.id.slice(0, 8)}</td>
                  <td className="px-4 py-2">{level.quantity_on_hand}</td>
                  <td className="px-4 py-2">{level.quantity_reserved}</td>
                  <td className="px-4 py-2">{level.quantity_available}</td>
                  <td className="px-4 py-2">{new Date(level.updated_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
