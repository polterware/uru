import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  ChevronDownIcon,
  PackageSearch,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Users,
  Warehouse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import type { TableGroup } from "@/lib/schema-registry";

import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
} from "@/components/ui/sidebar";
import * as schemaTables from "@/lib/schema-tables";

const GROUP_ICONS: Record<TableGroup, LucideIcon> = {
  identity: ShieldCheck,
  catalog: PackageSearch,
  crm: Users,
  inventory: Warehouse,
  commerce: ShoppingCart,
};

type AppSidebarProps = {
  pathname: string;
};

export function AppSidebar({ pathname }: AppSidebarProps) {
  const [query, setQuery] = useState("");

  const filteredGroups = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return schemaTables.SCHEMA_TABLE_GROUPS;
    }

    return schemaTables.SCHEMA_TABLE_GROUPS.map((group) => ({
      ...group,
      tables: group.tables.filter((table) => {
        return (
          table.name.toLowerCase().includes(normalized) ||
          table.label.toLowerCase().includes(normalized)
        );
      }),
    })).filter((group) => group.tables.length > 0);
  }, [query]);

  return (
    <Sidebar>
      <SidebarHeader className="pt-4 md:pt-8">
        <div className="flex items-center gap-2 px-2 py-1">
          <p className="font-medium font-brand text-xl">OPS</p>
          <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-400 text-[10px] font-medium uppercase tracking-widest">alpha</Badge>
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
          <SidebarGroupContent className="space-y-4">
            {filteredGroups.length === 0 ? (
              <p className="text-muted-foreground px-2 text-xs">
                No tables found for the current filter.
              </p>
            ) : (
              filteredGroups.map((group, index) => (
                <div
                  key={group.key}
                  className={
                    index > 0
                      ? "border-sidebar-border/50 border-t pt-4"
                      : undefined
                  }
                >
                  <SidebarSectionDropdown
                    icon={GROUP_ICONS[group.key]}
                    title={group.label}
                  >
                    <SidebarMenu>
                      {group.tables.map((table) => {
                        const tablePath = `/tables/${table.name}`;

                        return (
                          <SidebarMenuItem key={table.name}>
                            <SidebarMenuButton
                              asChild
                              className="h-7"
                              isActive={pathname === tablePath}
                              tooltip={table.label}
                            >
                              <Link
                                to="/tables/$table"
                                params={{ table: table.name }}
                              >
                                <span className="font-mono text-[11px]">
                                  {table.name}
                                </span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarSectionDropdown>
                </div>
              ))
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border/70 border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/analytics"}
              tooltip="Analytics"
            >
              <Link to="/analytics">
                <BarChart3 />
                <span>Analytics</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/settings"}
              tooltip="Settings"
            >
              <Link to="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

type SidebarSectionDropdownProps = {
  children: ReactNode;
  icon: LucideIcon;
  title: string;
};

function SidebarSectionDropdown({
  children,
  icon: Icon,
  title,
}: SidebarSectionDropdownProps) {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground flex w-full items-center justify-between px-2 text-[11px] font-medium uppercase tracking-wide transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Icon className="text-primary/80 size-3.5" />
            {title}
          </span>
          <ChevronDownIcon
            className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-1">{children}</CollapsibleContent>
    </Collapsible>
  );
}
