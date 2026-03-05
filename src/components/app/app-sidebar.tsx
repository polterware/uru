import { Link } from '@tanstack/react-router'
import { ChevronDownIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
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
} from '@/components/ui/sidebar'
import * as schemaTables from '@/lib/schema-tables'

type AppSidebarProps = {
  pathname: string
}

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
    <Sidebar>
      <SidebarHeader className="pt-4 md:pt-6">
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
          <SidebarGroupLabel>Tables</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-4">
            {filteredGroups.length === 0 ? (
              <p className="text-muted-foreground px-2 text-xs">No tables found for the current filter.</p>
            ) : (
              filteredGroups.map((group) => (
                <SidebarSectionDropdown key={group.key} title={group.label}>
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
                </SidebarSectionDropdown>
              ))
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border/70 border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/analytics'} tooltip="Analytics">
              <Link to="/analytics">
                <span>Analytics</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/settings'} tooltip="Settings">
              <Link to="/settings">
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

type SidebarSectionDropdownProps = {
  children: ReactNode
  title: string
}

function SidebarSectionDropdown({ children, title }: SidebarSectionDropdownProps) {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground flex w-full items-center justify-between px-2 text-[11px] font-medium uppercase tracking-wide transition-colors"
        >
          <span>{title}</span>
          <ChevronDownIcon className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
