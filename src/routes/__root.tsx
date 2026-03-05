import { HeadContent, Link, Outlet, Scripts, createRootRoute, useLocation } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import appCss from '../styles.css?url'
import { getSession, signOut } from '@/lib/supabase/auth'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Urú',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
})

function RootLayout() {
  const location = useLocation()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    let ignore = false

    getSession()
      .then((session) => {
        if (!ignore) {
          setIsAuthenticated(Boolean(session))
        }
      })
      .catch(() => {
        if (!ignore) {
          setIsAuthenticated(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [location.pathname])

  const isLoginPage = location.pathname === '/login'

  return (
    <div className="min-h-screen bg-app-shell text-app-foreground">
      <header className="border-b border-app-border bg-app-panel/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <span className="truncate text-2xl font-brand">Urú</span>
          {!isLoginPage && (
            <nav className="flex items-center gap-4 text-sm">
              <Link to="/products" className="text-app-muted transition-colors hover:text-app-foreground">
                Products
              </Link>
              <Link to="/orders" className="text-app-muted transition-colors hover:text-app-foreground">
                Orders
              </Link>
              <Link to="/inventory" className="text-app-muted transition-colors hover:text-app-foreground">
                Inventory
              </Link>
              <Link to="/settings" className="text-app-muted transition-colors hover:text-app-foreground">
                Settings
              </Link>
              {isAuthenticated ? (
                <button
                  type="button"
                  className="rounded bg-app-panel-strong px-3 py-1 text-xs text-app-foreground transition-colors hover:bg-app-hover"
                  onClick={async () => {
                    await signOut()
                    window.location.href = '/login'
                  }}
                >
                  Sign out
                </button>
              ) : (
                <Link to="/login" className="rounded bg-app-panel-strong px-3 py-1 text-xs text-app-foreground transition-colors hover:bg-app-hover">
                  Sign in
                </Link>
              )}
            </nav>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl p-6">
        <Outlet />
      </main>
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
