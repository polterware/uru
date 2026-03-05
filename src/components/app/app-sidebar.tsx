import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { SchemaTableName } from '@/lib/schema-registry'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import * as schemaTables from '@/lib/schema-tables'

type AppSidebarProps = {
  pathname: string
}

const APP_NAV_ITEMS: Array<{ label: string; table: SchemaTableName }> = [
  { label: 'Products', table: 'products' },
  { label: 'Orders', table: 'orders' },
  { label: 'Inventory', table: 'inventory_levels' },
]

export function AppSidebar({ pathname }: AppSidebarProps) {
  const [query, setQuery] = useState('')

  const filteredGroups = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return schemaTables.SCHEMA_TABLE_GROUPS
    }

    return schemaTables.SCHEMA_TABLE_GROUPS.map((group) => ({
      ...group,
      tables: group.tables.filter((table) => {
        return (
          table.name.toLowerCase().includes(normalized) ||
          table.label.toLowerCase().includes(normalized)
        )
      }),
    })).filter((group) => group.tables.length > 0)
  }, [query])

  return (
    <Sidebar className="pt-4 md:pt-6">
      <SidebarHeader>
        <div className="px-2 py-1">
          <p className="font-brand text-xl">Urú</p>
        </div>
        <SidebarInput
          aria-label="Filter tables"
          placeholder="Filter tables..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {APP_NAV_ITEMS.map((item) => {
                const isActive = pathname === `/tables/${item.table}`

                return (
                  <SidebarMenuItem key={item.table}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link to="/tables/$table" params={{ table: item.table }}>
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/settings'} tooltip="Settings">
                  <Link to="/settings">
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Tables</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-4">
            {filteredGroups.length === 0 ? (
              <p className="text-muted-foreground px-2 text-xs">No tables found for the current filter.</p>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.key} className="space-y-1">
                  <p className="text-muted-foreground px-2 text-[11px] font-medium uppercase tracking-wide">{group.label}</p>
                  <SidebarMenu>
                    {group.tables.map((table) => {
                      const tablePath = `/tables/${table.name}`

                      return (
                        <SidebarMenuItem key={table.name}>
                          <SidebarMenuButton asChild className="h-7" isActive={pathname === tablePath} tooltip={table.label}>
                            <Link to="/tables/$table" params={{ table: table.name }}>
                              <span className="font-mono text-[11px]">{table.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </div>
              ))
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
