import { useCallback, useEffect, useMemo, useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import type { DataTableColumnFilter } from '@/components/ui/table'
import type {
  FieldConfig,
  ListColumnConfig,
  TableConfig,
} from '@/lib/schema-registry'
import type { TableLookupOption } from '@/lib/db/repositories'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { InventoryLevelsRepository, OrdersRepository, TableCrudRepository } from '@/lib/db/repositories'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/formatters'
import {
  getCreatableFields,
  getNullableFields,
  getRelationFields,
  getTableConfig,
  getUpdatableFields,
} from '@/lib/schema-registry'
import { getUser } from '@/lib/supabase/auth'

export const Route = createFileRoute('/tables/$table')({
  beforeLoad: async () => {
    const user = await getUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }
  },
  component: TablesBySchemaPage,
})

type TableRecord = Record<string, unknown>

type DialogMode = 'create' | 'edit'

type LookupsByField = Partial<Record<string, Array<TableLookupOption>>>

type OrderStatusForm = {
  orderId: string
  status: string
  paymentStatus: string
  fulfillmentStatus: string
}

type InventoryRpcForm = {
  productId: string
  locationId: string
  quantity: string
  reason: string
}

const ORDER_STATUS_OPTIONS = ['pending', 'confirmed', 'fulfilled', 'cancelled']
const ORDER_PAYMENT_OPTIONS = ['pending', 'paid', 'refunded', 'partially_refunded']
const ORDER_FULFILLMENT_OPTIONS = ['unfulfilled', 'partial', 'fulfilled', 'cancelled']
const SELECT_NONE = '__none__'

function toDateInputValue(value: unknown): string {
  if (!value) {
    return ''
  }

  const parsed = new Date(String(value))
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }

  return parsed.toISOString().slice(0, 10)
}

function toDateTimeInputValue(value: unknown): string {
  if (!value) {
    return ''
  }

  const parsed = new Date(String(value))
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }

  const localDate = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 16)
}

function getDefaultValue(field: FieldConfig, userId: string | null): unknown {
  if (field.autoValue === 'current_user_id') {
    return userId ?? ''
  }

  if (field.autoValue === 'current_timestamp') {
    return new Date().toISOString()
  }

  if (field.defaultValue === 'now') {
    return new Date().toISOString()
  }

  if (field.defaultValue !== undefined) {
    return field.defaultValue
  }

  if (field.type === 'boolean') {
    return false
  }

  return ''
}

function toFormValue(field: FieldConfig, rowValue: unknown, userId: string | null): unknown {
  if (rowValue === undefined) {
    return getDefaultValue(field, userId)
  }

  if (rowValue === null) {
    if (field.type === 'boolean') {
      return false
    }

    return ''
  }

  if (field.type === 'json') {
    return JSON.stringify(rowValue, null, 2)
  }

  if (field.type === 'date') {
    return toDateInputValue(rowValue)
  }

  if (field.type === 'datetime') {
    return toDateTimeInputValue(rowValue)
  }

  if (field.type === 'boolean') {
    return Boolean(rowValue)
  }

  return String(rowValue)
}

function parseFieldValue(field: FieldConfig, rawValue: unknown): unknown {
  if (field.autoValue === 'current_user_id') {
    return rawValue
  }

  if (field.type === 'boolean') {
    return Boolean(rawValue)
  }

  const normalized = String(rawValue ?? '').trim()

  if (normalized.length === 0) {
    if (field.nullable) {
      return null
    }

    if (field.required) {
      throw new Error(`O campo ${field.label} é obrigatório.`)
    }

    return ''
  }

  if (field.type === 'integer') {
    const parsed = Number.parseInt(normalized, 10)
    if (Number.isNaN(parsed)) {
      throw new Error(`O campo ${field.label} precisa ser um número inteiro.`)
    }

    return parsed
  }

  if (field.type === 'number' || field.type === 'currency') {
    const parsed = Number.parseFloat(normalized)
    if (Number.isNaN(parsed)) {
      throw new Error(`O campo ${field.label} precisa ser um número válido.`)
    }

    return parsed
  }

  if (field.type === 'date') {
    return normalized
  }

  if (field.type === 'datetime') {
    const parsed = new Date(normalized)
    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`O campo ${field.label} precisa de uma data válida.`)
    }

    return parsed.toISOString()
  }

  if (field.type === 'json') {
    try {
      return JSON.parse(normalized)
    } catch {
      throw new Error(`O campo ${field.label} precisa conter JSON válido.`)
    }
  }

  return normalized
}

function renderListValue(
  row: TableRecord,
  column: ListColumnConfig,
  relationLabels: Partial<Record<string, Map<string, string>>>,
): string {
  const value = row[column.key]

  if (value === null || value === undefined) {
    return '-'
  }

  if (column.type === 'currency') {
    return formatCurrency(typeof value === 'number' ? value : Number(value))
  }

  if (column.type === 'datetime') {
    return formatDateTime(String(value))
  }

  if (column.type === 'date') {
    return formatDate(String(value))
  }

  if (column.type === 'boolean') {
    return value === true ? 'Sim' : 'Não'
  }

  if (column.type === 'json') {
    const payload = typeof value === 'string' ? value : JSON.stringify(value)
    return payload.length > 60 ? `${payload.slice(0, 57)}...` : payload
  }

  const relationLabel = relationLabels[column.key]?.get(String(value))
  if (relationLabel) {
    return relationLabel
  }

  return String(value)
}

function buildDataTableFilters(config: TableConfig): Array<DataTableColumnFilter<TableRecord>> {
  const filters: Array<DataTableColumnFilter<TableRecord>> = []

  for (const column of config.listColumns) {
    const field = config.fields.find((item) => item.key === column.key)
    if (!field) {
      continue
    }

    if (field.type === 'enum' && field.options?.length) {
      filters.push({
        columnId: column.key,
        label: column.label,
        type: 'select',
        options: field.options,
      })
      continue
    }

    if (field.type === 'boolean') {
      filters.push({
        columnId: column.key,
        label: column.label,
        type: 'select',
        options: [
          { label: 'Sim', value: 'true' },
          { label: 'Não', value: 'false' },
        ],
      })
      continue
    }

    if (field.type === 'text' || field.type === 'textarea' || field.type === 'uuid') {
      filters.push({
        columnId: column.key,
        label: column.label,
        type: 'text',
      })
    }

    if (filters.length >= 4) {
      break
    }
  }

  return filters
}

function TablesBySchemaPage() {
  const params = Route.useParams()
  const config = useMemo(() => getTableConfig(params.table), [params.table])

  const [userId, setUserId] = useState<string | null>(null)
  const [rows, setRows] = useState<Array<TableRecord>>([])
  const [lookupsByField, setLookupsByField] = useState<LookupsByField>({})
  const [includeArchived, setIncludeArchived] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<DialogMode>('create')
  const [editingRecord, setEditingRecord] = useState<TableRecord | null>(null)
  const [formValues, setFormValues] = useState<Record<string, unknown>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [orderStatusForm, setOrderStatusForm] = useState<OrderStatusForm>({
    orderId: '',
    status: 'pending',
    paymentStatus: 'pending',
    fulfillmentStatus: 'unfulfilled',
  })

  const [inventoryRpcForm, setInventoryRpcForm] = useState<InventoryRpcForm>({
    productId: '',
    locationId: '',
    quantity: '1',
    reason: '',
  })

  const [rpcMessage, setRpcMessage] = useState<string | null>(null)
  const [rpcError, setRpcError] = useState<string | null>(null)
  const [isRpcLoading, setIsRpcLoading] = useState(false)

  const loadTableData = useCallback(async () => {
    if (!config) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const currentUser = await getUser()
      setUserId(currentUser?.id ?? null)

      const relationFields = getRelationFields(config)

      const [tableRows, lookupEntries] = await Promise.all([
        TableCrudRepository.list(config.table, {
          includeArchived,
          orderBy: config.sort.column,
          ascending: config.sort.ascending,
        }),
        Promise.all(
          relationFields.map(async (field) => {
            const options = await TableCrudRepository.lookup(field.relation.table, {
              valueField: field.relation.valueField,
              labelField: field.relation.labelField,
              orderBy: field.relation.orderBy,
              ascending: field.relation.ascending,
            })

            return [field.key, options] as const
          }),
        ),
      ])

      setRows(tableRows as Array<TableRecord>)
      setLookupsByField(Object.fromEntries(lookupEntries))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar a tabela.')
    } finally {
      setIsLoading(false)
    }
  }, [config, includeArchived])

  useEffect(() => {
    void loadTableData()
  }, [loadTableData])

  const relationLabels = useMemo(() => {
    return Object.fromEntries(
      Object.entries(lookupsByField).map(([fieldKey, options]) => [
        fieldKey,
        new Map((options ?? []).map((option) => [option.value, option.label])),
      ]),
    ) as Partial<Record<string, Map<string, string>>>
  }, [lookupsByField])

  const tableColumns = useMemo(() => {
    if (!config) {
      return [] as Array<ColumnDef<TableRecord>>
    }

    const columns: Array<ColumnDef<TableRecord>> = config.listColumns.map((column) => ({
      accessorFn: (row) => row[column.key],
      id: column.key,
      header: column.label,
      cell: ({ row }) => {
        return renderListValue(row.original, column, relationLabels)
      },
    }))

    columns.push({
      id: '__actions',
      header: 'Ações',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              onClick={() => {
                setDialogMode('edit')
                setEditingRecord(row.original)
                setFormValues(
                  Object.fromEntries(
                    getUpdatableFields(config).map((field) => [
                      field.key,
                      toFormValue(field, row.original[field.key], userId),
                    ]),
                  ),
                )
                setFormError(null)
                setIsDialogOpen(true)
              }}
            >
              Editar
            </Button>

            <Button
              size="xs"
              variant="destructive"
              onClick={async () => {
                const confirmed = window.confirm('Deseja arquivar este registro?')
                if (!confirmed) {
                  return
                }

                try {
                  if (config.deleteStrategy === 'soft') {
                    await TableCrudRepository.archive(config.table, String(row.original.id))
                  } else {
                    await TableCrudRepository.hardDelete(config.table, String(row.original.id))
                  }

                  await loadTableData()
                } catch (archiveError) {
                  setError(archiveError instanceof Error ? archiveError.message : 'Falha ao remover registro.')
                }
              }}
            >
              Arquivar
            </Button>
          </div>
        )
      },
    })

    return columns
  }, [config, relationLabels, userId, loadTableData])

  const filters = useMemo(() => {
    if (!config) {
      return []
    }

    return buildDataTableFilters(config)
  }, [config])

  if (!config) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Tabela não encontrada</h1>
        <p className="text-muted-foreground text-sm">A tabela `{params.table}` não existe no registry.</p>
      </section>
    )
  }

  const openCreateDialog = () => {
    setDialogMode('create')
    setEditingRecord(null)

    const values = Object.fromEntries(
      getCreatableFields(config).map((field) => [field.key, toFormValue(field, undefined, userId)]),
    )

    setFormValues(values)
    setFormError(null)
    setIsDialogOpen(true)
  }

  const onSubmitForm = async () => {
    setFormError(null)
    setIsSubmitting(true)

    try {
      const fields = dialogMode === 'create' ? getCreatableFields(config) : getUpdatableFields(config)
      const payload = fields.reduce<Record<string, unknown>>((acc, field) => {
        let rawValue = formValues[field.key]

        if (field.autoValue === 'current_user_id') {
          rawValue = userId
        }

        if (field.autoValue === 'current_timestamp') {
          rawValue = new Date().toISOString()
        }

        if (dialogMode === 'create' && rawValue === '' && field.defaultValue !== undefined) {
          rawValue = field.defaultValue === 'now' ? new Date().toISOString() : field.defaultValue
        }

        acc[field.key] = parseFieldValue(field, rawValue)

        return acc
      }, {})

      if (dialogMode === 'create') {
        await TableCrudRepository.create(config.table, payload, {
          nullableFields: getNullableFields(config),
        })
      } else {
        if (!editingRecord) {
          throw new Error('Registro não encontrado para edição.')
        }

        await TableCrudRepository.update(config.table, String(editingRecord.id), payload, {
          nullableFields: getNullableFields(config),
        })
      }

      setIsDialogOpen(false)
      setFormValues({})
      setEditingRecord(null)

      await loadTableData()
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Falha ao salvar registro.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onUpdateOrderStatus = async () => {
    setRpcError(null)
    setRpcMessage(null)
    setIsRpcLoading(true)

    try {
      await OrdersRepository.updateStatus(
        orderStatusForm.orderId,
        orderStatusForm.status,
        orderStatusForm.paymentStatus,
        orderStatusForm.fulfillmentStatus,
      )
      setRpcMessage('Status do pedido atualizado via RPC.')
      await loadTableData()
    } catch (rpcLoadError) {
      setRpcError(rpcLoadError instanceof Error ? rpcLoadError.message : 'Falha ao atualizar status do pedido.')
    } finally {
      setIsRpcLoading(false)
    }
  }

  const onRunInventoryRpc = async (mode: 'reserve' | 'release') => {
    setRpcError(null)
    setRpcMessage(null)
    setIsRpcLoading(true)

    try {
      const quantity = Number.parseInt(inventoryRpcForm.quantity, 10)
      if (Number.isNaN(quantity) || quantity <= 0) {
        throw new Error('Quantidade deve ser maior que zero.')
      }

      if (mode === 'reserve') {
        await InventoryLevelsRepository.reserveStock(
          inventoryRpcForm.productId,
          inventoryRpcForm.locationId,
          quantity,
          inventoryRpcForm.reason || undefined,
        )
        setRpcMessage('Reserva de estoque concluída via RPC.')
      } else {
        await InventoryLevelsRepository.releaseStock(
          inventoryRpcForm.productId,
          inventoryRpcForm.locationId,
          quantity,
          inventoryRpcForm.reason || undefined,
        )
        setRpcMessage('Liberação de estoque concluída via RPC.')
      }

      await loadTableData()
    } catch (rpcLoadError) {
      setRpcError(rpcLoadError instanceof Error ? rpcLoadError.message : 'Falha na execução da RPC de estoque.')
    } finally {
      setIsRpcLoading(false)
    }
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{config.label}</h1>
        <p className="text-muted-foreground text-sm">
          {config.description} Tabela: <span className="font-mono">{config.table}</span>
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Registros</CardTitle>
            <CardDescription>
              CRUD completo orientado pelo schema com filtros, ordenação e exportação CSV.
            </CardDescription>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="include-archived"
                checked={includeArchived}
                onCheckedChange={(checked) => setIncludeArchived(Boolean(checked))}
              />
              <Label htmlFor="include-archived">Mostrar arquivados</Label>
            </div>

            <Button onClick={openCreateDialog}>Novo registro</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DataTable
            columns={tableColumns}
            data={rows}
            filters={filters}
            searchPlaceholder={`Buscar em ${config.table}...`}
            emptyMessage={isLoading ? 'Carregando registros...' : 'Nenhum registro encontrado para os filtros atuais.'}
            exportFileName={`uru-${config.table}`}
          />
        </CardContent>
      </Card>

      {config.transactionalActions?.includes('orders_update_status') ? (
        <Card>
          <CardHeader>
            <CardTitle>Ações RPC: Orders</CardTitle>
            <CardDescription>Atualização transacional de status via função `update_order_status`.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="rpc-order-id">Order ID</Label>
              <Input
                id="rpc-order-id"
                value={orderStatusForm.orderId}
                onChange={(event) => setOrderStatusForm((current) => ({ ...current, orderId: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={orderStatusForm.status}
                onValueChange={(value) => setOrderStatusForm((current) => ({ ...current, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment status</Label>
              <Select
                value={orderStatusForm.paymentStatus}
                onValueChange={(value) => setOrderStatusForm((current) => ({ ...current, paymentStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Payment status" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_PAYMENT_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fulfillment status</Label>
              <Select
                value={orderStatusForm.fulfillmentStatus}
                onValueChange={(value) => setOrderStatusForm((current) => ({ ...current, fulfillmentStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Fulfillment status" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_FULFILLMENT_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-4">
              <Button disabled={isRpcLoading} onClick={onUpdateOrderStatus}>
                Atualizar status via RPC
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {config.transactionalActions?.includes('inventory_reserve_release') ? (
        <Card>
          <CardHeader>
            <CardTitle>Ações RPC: Inventory</CardTitle>
            <CardDescription>
              Reserva/liberação transacional via `reserve_inventory_stock` e `release_inventory_stock`.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Produto</Label>
              <Select
                value={inventoryRpcForm.productId}
                onValueChange={(value) => setInventoryRpcForm((current) => ({ ...current, productId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {lookupsByField.product_id?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Local</Label>
              <Select
                value={inventoryRpcForm.locationId}
                onValueChange={(value) => setInventoryRpcForm((current) => ({ ...current, locationId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um local" />
                </SelectTrigger>
                <SelectContent>
                  {lookupsByField.location_id?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rpc-quantity">Quantidade</Label>
              <Input
                id="rpc-quantity"
                type="number"
                min="1"
                value={inventoryRpcForm.quantity}
                onChange={(event) => setInventoryRpcForm((current) => ({ ...current, quantity: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rpc-reason">Motivo</Label>
              <Input
                id="rpc-reason"
                value={inventoryRpcForm.reason}
                onChange={(event) => setInventoryRpcForm((current) => ({ ...current, reason: event.target.value }))}
              />
            </div>
            <div className="flex gap-2 md:col-span-4">
              <Button disabled={isRpcLoading} onClick={() => void onRunInventoryRpc('reserve')}>
                Reservar
              </Button>
              <Button variant="outline" disabled={isRpcLoading} onClick={() => void onRunInventoryRpc('release')}>
                Liberar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {rpcMessage ? <p className="text-sm text-muted-foreground">{rpcMessage}</p> : null}
      {rpcError ? <p className="text-sm text-destructive">{rpcError}</p> : null}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'create' ? `Novo registro em ${config.table}` : `Editar ${config.table}`}</DialogTitle>
            <DialogDescription>
              Preencha os campos de acordo com o contrato do schema. Permissões são validadas pelo RLS.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            {(dialogMode === 'create' ? getCreatableFields(config) : getUpdatableFields(config)).map((field) => {
              const isRelation = Boolean(field.relation)
              const isBoolean = field.type === 'boolean'
              const isEnum = field.type === 'enum'
              const isTextArea = field.type === 'textarea' || field.type === 'json'
              const isDate = field.type === 'date'
              const isDateTime = field.type === 'datetime'
              const isNumber = field.type === 'integer' || field.type === 'number' || field.type === 'currency'

              const value = formValues[field.key]

              return (
                <div key={field.key} className={isTextArea ? 'space-y-2 md:col-span-2' : 'space-y-2'}>
                  <Label htmlFor={`field-${field.key}`}>
                    {field.label}
                    {field.required ? <span className="text-destructive"> *</span> : null}
                  </Label>

                  {isRelation ? (
                    <Select
                      value={String(value ?? '') || SELECT_NONE}
                      onValueChange={(nextValue) => {
                        setFormValues((current) => ({
                          ...current,
                          [field.key]: nextValue === SELECT_NONE ? '' : nextValue,
                        }))
                      }}
                    >
                      <SelectTrigger id={`field-${field.key}`}>
                        <SelectValue placeholder={`Selecione ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SELECT_NONE}>Nenhum</SelectItem>
                        {lookupsByField[field.key]?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}

                  {isEnum ? (
                    <Select
                      value={String(value ?? '') || SELECT_NONE}
                      onValueChange={(nextValue) => {
                        setFormValues((current) => ({
                          ...current,
                          [field.key]: nextValue === SELECT_NONE ? '' : nextValue,
                        }))
                      }}
                    >
                      <SelectTrigger id={`field-${field.key}`}>
                        <SelectValue placeholder={`Selecione ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SELECT_NONE}>
                          {field.nullable ? 'Nenhum' : 'Selecione'}
                        </SelectItem>
                        {field.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}

                  {isBoolean ? (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`field-${field.key}`}
                        checked={Boolean(value)}
                        onCheckedChange={(checked) => {
                          setFormValues((current) => ({ ...current, [field.key]: Boolean(checked) }))
                        }}
                      />
                      <Label htmlFor={`field-${field.key}`}>Ativar</Label>
                    </div>
                  ) : null}

                  {isTextArea ? (
                    <Textarea
                      id={`field-${field.key}`}
                      value={String(value ?? '')}
                      onChange={(event) => {
                        setFormValues((current) => ({ ...current, [field.key]: event.target.value }))
                      }}
                    />
                  ) : null}

                  {isDate ? (
                    <Input
                      id={`field-${field.key}`}
                      type="date"
                      value={String(value ?? '')}
                      onChange={(event) => {
                        setFormValues((current) => ({ ...current, [field.key]: event.target.value }))
                      }}
                    />
                  ) : null}

                  {isDateTime ? (
                    <Input
                      id={`field-${field.key}`}
                      type="datetime-local"
                      value={String(value ?? '')}
                      onChange={(event) => {
                        setFormValues((current) => ({ ...current, [field.key]: event.target.value }))
                      }}
                    />
                  ) : null}

                  {isNumber ? (
                    <Input
                      id={`field-${field.key}`}
                      type="number"
                      step={field.type === 'integer' ? '1' : '0.01'}
                      value={String(value ?? '')}
                      onChange={(event) => {
                        setFormValues((current) => ({ ...current, [field.key]: event.target.value }))
                      }}
                    />
                  ) : null}

                  {!isRelation && !isEnum && !isBoolean && !isTextArea && !isDate && !isDateTime && !isNumber ? (
                    <Input
                      id={`field-${field.key}`}
                      value={String(value ?? '')}
                      onChange={(event) => {
                        setFormValues((current) => ({ ...current, [field.key]: event.target.value }))
                      }}
                    />
                  ) : null}
                </div>
              )
            })}
          </div>

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
              }}
            >
              Cancelar
            </Button>
            <Button disabled={isSubmitting} onClick={() => void onSubmitForm()}>
              {isSubmitting ? 'Salvando...' : dialogMode === 'create' ? 'Criar registro' : 'Salvar alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
