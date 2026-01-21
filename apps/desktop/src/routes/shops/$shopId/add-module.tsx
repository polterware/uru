import * as React from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useShop } from "@/hooks/use-shop"
import { useShopStore } from "@/stores/shop-store"
import { ModulesRepository } from "@/lib/db/repositories/modules-repository"
import type { Module } from "@uru/types"
import { ModuleSelector } from "@/components/shops/module-selector"

export const Route = createFileRoute('/shops/$shopId/add-module')({
  component: AddModuleRoute,
})

function AddModuleRoute() {
  const navigate = useNavigate()
  const { shop } = useShop()
  const { updateShop } = useShopStore()
  const [modules, setModules] = React.useState<Module[]>([])
  const [selectedModules, setSelectedModules] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => {
    if (shop) {
      loadModules()
    }
  }, [shop])

  const loadModules = async () => {
    setIsLoading(true)
    try {
      const allModules = await ModulesRepository.list()
      setModules(allModules)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load modules")
    } finally {
      setIsLoading(false)
    }
  }

  const CORE_MODULES = ["products", "customers", "orders", "transactions", "payments"]

  React.useEffect(() => {
    if (shop && modules.length > 0) {
      let currentConfig: Record<string, boolean> = {}
      try {
        if (shop.features_config) {
          currentConfig = JSON.parse(shop.features_config)
        }
      } catch (e) {
        console.error("Failed to parse features_config", e)
      }

      // Initialize selectedModules with currently enabled modules + core modules
      const initialSelection = modules
        .filter((m) => {
          if (CORE_MODULES.includes(m.code)) return true
          return currentConfig[m.code] === true
        })
        .map((m) => m.code)

      setSelectedModules(initialSelection)
    }
  }, [shop, modules])

  const availableModules = modules

  const handleSave = async () => {
    if (!shop || selectedModules.length === 0) return

    setIsSaving(true)
    try {
      const newConfig: Record<string, boolean> = {}

      modules.forEach((module) => {
        // Core modules are always enabled
        if (CORE_MODULES.includes(module.code)) {
          newConfig[module.code] = true
        } else {
          // Other modules depend on selection
          newConfig[module.code] = selectedModules.includes(module.code)
        }
      })

      await updateShop(shop.id, {
        features_config: JSON.stringify(newConfig),
      })

      toast.success("Shop modules updated successfully")
      navigate({ to: "/shops/$shopId", params: { shopId: shop.id } })
    } catch (error) {
      console.error(error)
      toast.error("Failed to add modules")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading modules...</div>
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: ".." })}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Manage Modules</h1>
          <p className="text-sm text-muted-foreground">
            Enable or disable modules for your shop.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modules</CardTitle>
          <CardDescription>
            Select the modules you want to enable for this shop.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableModules.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 border rounded-lg border-dashed">
              All available modules are already installed.
            </div>
          ) : (
            <ModuleSelector
              modules={availableModules}
              selectedModules={selectedModules}
              onSelectionChange={setSelectedModules}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate({ to: ".." })}>Cancel</Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
