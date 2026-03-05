import { FormEvent, useEffect, useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { SettingsStore } from '@/lib/stores/settings-store'
import { getUser, getUserRoles } from '@/lib/supabase/auth'

export const Route = createFileRoute('/settings')({
  beforeLoad: async () => {
    const user = await getUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }
  },
  component: SettingsPage,
})

function SettingsPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [roles, setRoles] = useState<string[]>([])
  const [settingKey, setSettingKey] = useState('dashboard.default_range')
  const [settingValue, setSettingValue] = useState('{"days":30}')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function loadIdentity() {
      try {
        const user = await getUser()
        if (!user) {
          window.location.href = '/login'
          return
        }

        const userRoles = await getUserRoles(user.id)

        if (!ignore) {
          setUserEmail(user.email ?? null)
          setRoles(userRoles)
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load profile')
        }
      }
    }

    void loadIdentity()

    return () => {
      ignore = true
    }
  }, [])

  async function onSaveSetting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setError(null)

    try {
      const parsed = JSON.parse(settingValue)
      await SettingsStore.set(settingKey, parsed)
      setMessage('Setting saved locally (Tauri Store)')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save local setting')
    }
  }

  async function onLoadSetting() {
    setMessage(null)
    setError(null)

    try {
      const value = await SettingsStore.get<unknown>(settingKey)
      if (value === null) {
        setMessage('No local value found for this key')
        return
      }

      setSettingValue(JSON.stringify(value, null, 2))
      setMessage('Local setting loaded')
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load local setting')
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-app-muted">Local desktop settings via Tauri Store (not persisted in Supabase).</p>
      </header>

      <div className="rounded border border-app-border bg-app-panel p-4 text-sm">
        <p>User: {userEmail ?? 'Unknown'}</p>
        <p>Roles: {roles.length ? roles.join(', ') : 'No roles found'}</p>
      </div>

      <form className="space-y-3 rounded border border-app-border bg-app-panel p-4" onSubmit={onSaveSetting}>
        <label className="block text-sm">
          Key
          <input
            className="mt-2 w-full rounded border border-app-border bg-app-panel-strong px-3 py-2"
            value={settingKey}
            onChange={(event) => setSettingKey(event.target.value)}
          />
        </label>

        <label className="block text-sm">
          JSON Value
          <textarea
            className="mt-2 min-h-24 w-full rounded border border-app-border bg-app-panel-strong px-3 py-2 font-mono text-xs"
            value={settingValue}
            onChange={(event) => setSettingValue(event.target.value)}
          />
        </label>

        <div className="flex gap-2">
          <button type="submit" className="rounded bg-app-success px-3 py-2 text-sm font-medium text-black transition-colors hover:opacity-90">
            Save local setting
          </button>
          <button
            type="button"
            onClick={onLoadSetting}
            className="rounded border border-app-border bg-app-panel-strong px-3 py-2 text-sm font-medium transition-colors hover:bg-app-hover"
          >
            Load key
          </button>
        </div>

        {message ? <p className="text-app-success">{message}</p> : null}
        {error ? <p className="text-app-danger">{error}</p> : null}
      </form>
    </section>
  )
}
