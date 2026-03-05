import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { SCHEMA_TABLE_GROUPS, SCHEMA_TABLES } from '@/lib/schema-tables'

type AppSidebarProps = {
  pathname: string
}

const APP_NAV_ITEMS: Array<{
  label: string
  to: '/products' | '/orders' | '/inventory' | '/settings'
}> = [
  { label: 'Produtos', to: '/products' },
  { label: 'Pedidos', to: '/orders' },
  { label: 'Estoque', to: '/inventory' },
  { label: 'Configurações', to: '/settings' },
]

export function AppSidebar({ pathname }: AppSidebarProps) {
  const [query, setQuery] = useState('')

  const filteredGroups = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return SCHEMA_TABLE_GROUPS
    }

    return SCHEMA_TABLE_GROUPS.map((group) => ({
      ...group,
      tables: group.tables.filter((table) => {
        return (
          table.name.toLowerCase().includes(normalized) ||
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
              {APP_NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.to}
                    tooltip={item.label}
                  >
                    <Link to={item.to}>
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>
            Tabelas ({visibleTableCount}/{SCHEMA_TABLES.length})
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-4">
            {filteredGroups.length === 0 ? (
              <p className="text-muted-foreground px-2 text-xs">Nenhuma tabela encontrada para o filtro atual.</p>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.key} className="space-y-1">
                  <p className="text-muted-foreground px-2 text-[11px] font-medium uppercase tracking-wide">{group.label}</p>
                  <SidebarMenu>
                    {group.tables.map((table) => (
                      <SidebarMenuItem key={table.name}>
                        {table.route ? (
                          <SidebarMenuButton
                            asChild
                            className="h-7"
                            isActive={pathname === table.route}
                            tooltip={table.description}
                          >
                            <Link to={table.route}>
                              <span className="font-mono text-[11px]">{table.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        ) : (
                          <SidebarMenuButton
                            disabled
                            className="h-7 cursor-default opacity-70"
                            tooltip={table.description}
                          >
                            <span className="font-mono text-[11px]">{table.name}</span>
                          </SidebarMenuButton>
                        )}
                        {!table.route ? <SidebarMenuBadge>schema</SidebarMenuBadge> : null}
                      </SidebarMenuItem>
                    ))}
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
