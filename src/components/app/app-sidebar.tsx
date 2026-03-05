import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { SchemaTableName } from '@/lib/schema-registry'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
  { label: 'Produtos', table: 'products' },
  { label: 'Pedidos', table: 'orders' },
  { label: 'Estoque', table: 'inventory_levels' },
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
          table.label.toLowerCase().includes(normalized) ||
          table.description.toLowerCase().includes(normalized)
        )
      }),
    })).filter((group) => group.tables.length > 0)
  }, [query])

  const visibleTableCount = useMemo(() => {
    return filteredGroups.reduce((acc, group) => acc + group.tables.length, 0)
  }, [filteredGroups])

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-1">
          <p className="font-brand text-xl">Urú</p>
          <p className="text-muted-foreground text-xs">Schema-driven desktop</p>
        </div>
        <SidebarInput
          aria-label="Filtrar tabelas"
          placeholder="Filtrar tabelas..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Módulos</SidebarGroupLabel>
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
                <SidebarMenuButton asChild isActive={pathname === '/settings'} tooltip="Configurações">
                  <Link to="/settings">
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>
            Tabelas ({visibleTableCount}/{schemaTables.SCHEMA_TABLES.length})
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-4">
            {filteredGroups.length === 0 ? (
              <p className="text-muted-foreground px-2 text-xs">Nenhuma tabela encontrada para o filtro atual.</p>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.key} className="space-y-1">
                  <p className="text-muted-foreground px-2 text-[11px] font-medium uppercase tracking-wide">{group.label}</p>
                  <SidebarMenu>
                    {group.tables.map((table) => {
                      const tablePath = `/tables/${table.name}`

                      return (
                        <SidebarMenuItem key={table.name}>
                          <SidebarMenuButton asChild className="h-7" isActive={pathname === tablePath} tooltip={table.description}>
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

      <SidebarFooter>
        <p className="text-muted-foreground px-2 text-xs">Baseado em `docs/SCHEMA.md` e migration vNext.</p>
      </SidebarFooter>
    </Sidebar>
  )
}
