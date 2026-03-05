import type { Database } from '@/types/database'

export type SchemaTableName = keyof Database['public']['Tables']

export type TableGroup = 'identity' | 'catalog' | 'crm' | 'inventory' | 'commerce'

export type DeleteStrategy = 'soft' | 'hard'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'integer'
  | 'enum'
  | 'date'
  | 'datetime'
  | 'json'
  | 'uuid'
  | 'boolean'

export type ListColumnType =
  | 'text'
  | 'number'
  | 'currency'
  | 'integer'
  | 'date'
  | 'datetime'
  | 'json'
  | 'boolean'
  | 'enum'
  | 'uuid'

export type FieldOption = {
  label: string
  value: string
}

export type RelationConfig = {
  table: SchemaTableName
  valueField: string
  labelField: string
  orderBy?: string
  ascending?: boolean
}

export type FieldConfig = {
  key: string
  label: string
  type: FieldType
  required?: boolean
  nullable?: boolean
  editableOnCreate?: boolean
  editableOnUpdate?: boolean
  defaultValue?: unknown
  autoValue?: 'current_user_id' | 'current_timestamp'
  options?: Array<FieldOption>
  relation?: RelationConfig
}

export type FieldConfigWithRelation = FieldConfig & {
  relation: RelationConfig
}

export type ListColumnConfig = {
  key: string
  label: string
  type: ListColumnType
}

export type TableSortConfig = {
  column: string
  ascending: boolean
}

export type TransactionalActionKind =
  | 'orders_update_status'
  | 'inventory_reserve_release'

export type TableConfig = {
  table: SchemaTableName
  label: string
  description: string
  group: TableGroup
  primaryKey: string
  deleteStrategy: DeleteStrategy
  sort: TableSortConfig
  listColumns: Array<ListColumnConfig>
  fields: Array<FieldConfig>
  transactionalActions?: Array<TransactionalActionKind>
}

const LIFECYCLE_OPTIONS: Array<FieldOption> = [
  { label: 'Ativo', value: 'active' },
  { label: 'Inativo', value: 'inactive' },
  { label: 'Arquivado', value: 'archived' },
]

const ROLE_OPTIONS: Array<FieldOption> = [
  { label: 'Admin', value: 'admin' },
  { label: 'Operator', value: 'operator' },
  { label: 'Analyst', value: 'analyst' },
]

const LOCATION_TYPE_OPTIONS: Array<FieldOption> = [
  { label: 'Warehouse', value: 'warehouse' },
  { label: 'Store', value: 'store' },
  { label: 'Transit', value: 'transit' },
]

const INVENTORY_MOVEMENT_OPTIONS: Array<FieldOption> = [
  { label: 'Inbound', value: 'inbound' },
  { label: 'Outbound', value: 'outbound' },
  { label: 'Adjustment', value: 'adjustment' },
  { label: 'Reservation', value: 'reservation' },
  { label: 'Release', value: 'release' },
]

const CHECKOUT_STATUS_OPTIONS: Array<FieldOption> = [
  { label: 'Open', value: 'open' },
  { label: 'Completed', value: 'completed' },
  { label: 'Expired', value: 'expired' },
  { label: 'Abandoned', value: 'abandoned' },
]

const ORDER_STATUS_OPTIONS: Array<FieldOption> = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Fulfilled', value: 'fulfilled' },
  { label: 'Cancelled', value: 'cancelled' },
]

const ORDER_PAYMENT_STATUS_OPTIONS: Array<FieldOption> = [
  { label: 'Pending', value: 'pending' },
  { label: 'Paid', value: 'paid' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Partially refunded', value: 'partially_refunded' },
]

const ORDER_FULFILLMENT_STATUS_OPTIONS: Array<FieldOption> = [
  { label: 'Unfulfilled', value: 'unfulfilled' },
  { label: 'Partial', value: 'partial' },
  { label: 'Fulfilled', value: 'fulfilled' },
  { label: 'Cancelled', value: 'cancelled' },
]

const TRANSACTION_STATUS_OPTIONS: Array<FieldOption> = [
  { label: 'Pending', value: 'pending' },
  { label: 'Authorized', value: 'authorized' },
  { label: 'Captured', value: 'captured' },
  { label: 'Failed', value: 'failed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Refunded', value: 'refunded' },
]

const TRANSACTION_ITEM_KIND_OPTIONS: Array<FieldOption> = [
  { label: 'Product', value: 'product' },
  { label: 'Shipping', value: 'shipping' },
  { label: 'Discount', value: 'discount' },
  { label: 'Tax', value: 'tax' },
  { label: 'Fee', value: 'fee' },
]

const REFUND_STATUS_OPTIONS: Array<FieldOption> = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Processed', value: 'processed' },
]

const SHIPMENT_STATUS_OPTIONS: Array<FieldOption> = [
  { label: 'Pending', value: 'pending' },
  { label: 'Packed', value: 'packed' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
]

const INQUIRY_STATUS_OPTIONS: Array<FieldOption> = [
  { label: 'Open', value: 'open' },
  { label: 'Pending', value: 'pending' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
]

const REVIEW_STATUS_OPTIONS: Array<FieldOption> = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]

const POS_STATUS_OPTIONS: Array<FieldOption> = [
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' },
]

const PROFILE_RELATION: RelationConfig = {
  table: 'profiles',
  valueField: 'id',
  labelField: 'email',
  orderBy: 'email',
  ascending: true,
}

function lifecycleField(): FieldConfig {
  return {
    key: 'lifecycle_status',
    label: 'Lifecycle status',
    type: 'enum',
    required: true,
    defaultValue: 'active',
    options: LIFECYCLE_OPTIONS,
  }
}

function createdByField(key: 'created_by' | 'opened_by' | 'author_id', label: string): FieldConfig {
  return {
    key,
    label,
    type: 'uuid',
    required: true,
    editableOnCreate: false,
    editableOnUpdate: false,
    autoValue: 'current_user_id',
    relation: PROFILE_RELATION,
  }
}

function readonlyTimestampField(key: 'created_at' | 'updated_at' | 'deleted_at', label: string): FieldConfig {
  return {
    key,
    label,
    type: 'datetime',
    editableOnCreate: false,
    editableOnUpdate: false,
  }
}

function withLifecycleAndTimestamps(fields: Array<FieldConfig>): Array<FieldConfig> {
  return [
    ...fields,
    lifecycleField(),
    readonlyTimestampField('created_at', 'Created at'),
    readonlyTimestampField('updated_at', 'Updated at'),
    readonlyTimestampField('deleted_at', 'Deleted at'),
  ]
}

function withStandardTableMeta(fields: Array<FieldConfig>): Array<FieldConfig> {
  return [
    ...fields,
    {
      key: 'id',
      label: 'ID',
      type: 'uuid',
      editableOnCreate: false,
      editableOnUpdate: false,
    },
  ]
}

export const SCHEMA_REGISTRY: Array<TableConfig> = [
  {
    table: 'profiles',
    label: 'Profiles',
    description: 'Perfis de usuário autenticado.',
    group: 'identity',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'updated_at', ascending: false },
    listColumns: [
      { key: 'full_name', label: 'Nome', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'lifecycle_status', label: 'Status', type: 'enum' },
      { key: 'updated_at', label: 'Atualizado em', type: 'datetime' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        { key: 'email', label: 'Email', type: 'text', nullable: true },
        { key: 'full_name', label: 'Nome completo', type: 'text', nullable: true },
        { key: 'avatar_url', label: 'Avatar URL', type: 'text', nullable: true },
      ]),
    ),
  },
  {
    table: 'roles',
    label: 'Roles',
    description: 'Papéis de autorização do sistema.',
    group: 'identity',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'name', ascending: true },
    listColumns: [
      { key: 'code', label: 'Code', type: 'enum' },
      { key: 'name', label: 'Nome', type: 'text' },
      { key: 'lifecycle_status', label: 'Status', type: 'enum' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: 'code',
          label: 'Code',
          type: 'enum',
          required: true,
          options: ROLE_OPTIONS,
        },
        { key: 'name', label: 'Nome', type: 'text', required: true },
      ]),
    ),
  },
  {
    table: 'user_roles',
    label: 'User Roles',
    description: 'Vínculo entre usuários e papéis.',
    group: 'identity',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'created_at', ascending: false },
    listColumns: [
      { key: 'user_id', label: 'Usuário', type: 'uuid' },
      { key: 'role_id', label: 'Role', type: 'uuid' },
      { key: 'lifecycle_status', label: 'Status', type: 'enum' },
      { key: 'created_at', label: 'Criado em', type: 'datetime' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: 'user_id',
          label: 'Usuário',
          type: 'uuid',
          required: true,
          relation: PROFILE_RELATION,
        },
        {
          key: 'role_id',
          label: 'Role',
          type: 'uuid',
          required: true,
          relation: {
            table: 'roles',
            valueField: 'id',
            labelField: 'name',
            orderBy: 'name',
            ascending: true,
          },
        },
      ]),
    ),
  },
  {
    table: 'modules',
    label: 'Modules',
    description: 'Módulos e flags de funcionalidades.',
    group: 'identity',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'code', ascending: true },
    listColumns: [
      { key: 'code', label: 'Code', type: 'text' },
      { key: 'name', label: 'Nome', type: 'text' },
      { key: 'enabled', label: 'Habilitado', type: 'boolean' },
      { key: 'lifecycle_status', label: 'Status', type: 'enum' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        { key: 'code', label: 'Code', type: 'text', required: true },
        { key: 'name', label: 'Nome', type: 'text', required: true },
        { key: 'description', label: 'Descrição', type: 'textarea', nullable: true },
        { key: 'enabled', label: 'Habilitado', type: 'boolean', defaultValue: true },
      ]),
    ),
  },
  {
    table: 'categories',
    label: 'Categories',
    description: 'Categorias do catálogo.',
    group: 'catalog',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'name', ascending: true },
    listColumns: [
      { key: 'name', label: 'Nome', type: 'text' },
      { key: 'slug', label: 'Slug', type: 'text' },
      { key: 'lifecycle_status', label: 'Status', type: 'enum' },
      { key: 'updated_at', label: 'Atualizado em', type: 'datetime' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        { key: 'name', label: 'Nome', type: 'text', required: true },
        { key: 'slug', label: 'Slug', type: 'text', required: true },
        createdByField('created_by', 'Criado por'),
      ]),
    ),
  },
  {
    table: 'brands',
    label: 'Brands',
    description: 'Marcas de produtos.',
    group: 'catalog',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'name', ascending: true },
    listColumns: [
      { key: 'name', label: 'Nome', type: 'text' },
      { key: 'lifecycle_status', label: 'Status', type: 'enum' },
      { key: 'updated_at', label: 'Atualizado em', type: 'datetime' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        { key: 'name', label: 'Nome', type: 'text', required: true },
        createdByField('created_by', 'Criado por'),
      ]),
    ),
  },
  {
    table: 'products',
    label: 'Products',
    description: 'Produtos comercializados.',
    group: 'catalog',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'created_at', ascending: false },
    listColumns: [
      { key: 'title', label: 'Título', type: 'text' },
      { key: 'sku', label: 'SKU', type: 'text' },
      { key: 'price', label: 'Preço', type: 'currency' },
      { key: 'lifecycle_status', label: 'Status', type: 'enum' },
      { key: 'created_at', label: 'Criado em', type: 'datetime' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        { key: 'sku', label: 'SKU', type: 'text', required: true },
        { key: 'title', label: 'Título', type: 'text', required: true },
        { key: 'description', label: 'Descrição', type: 'textarea', nullable: true },
        {
          key: 'category_id',
          label: 'Categoria',
          type: 'uuid',
          nullable: true,
          relation: {
            table: 'categories',
            valueField: 'id',
            labelField: 'name',
            orderBy: 'name',
            ascending: true,
          },
        },
        {
          key: 'brand_id',
          label: 'Marca',
          type: 'uuid',
          nullable: true,
          relation: {
            table: 'brands',
            valueField: 'id',
            labelField: 'name',
            orderBy: 'name',
            ascending: true,
          },
        },
        { key: 'price', label: 'Preço', type: 'currency', required: true, defaultValue: 0 },
        { key: 'cost', label: 'Custo', type: 'currency', nullable: true },
        createdByField('created_by', 'Criado por'),
      ]),
    ),
  },
  {
    table: 'customers',
    label: 'Customers',
    description: 'Cadastro de clientes.',
    group: 'crm',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'created_at', ascending: false },
    listColumns: [
      { key: 'full_name', label: 'Nome', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'phone', label: 'Telefone', type: 'text' },
      { key: 'lifecycle_status', label: 'Status', type: 'enum' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        { key: 'full_name', label: 'Nome completo', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'text', nullable: true },
        { key: 'phone', label: 'Telefone', type: 'text', nullable: true },
        { key: 'notes', label: 'Notas', type: 'textarea', nullable: true },
        createdByField('created_by', 'Criado por'),
      ]),
    ),
  },
  {
    table: 'customer_addresses',
    label: 'Customer Addresses',
    description: 'Endereços de clientes.',
    group: 'crm',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'updated_at', ascending: false },
    listColumns: [
      { key: 'customer_id', label: 'Cliente', type: 'uuid' },
      { key: 'city', label: 'Cidade', type: 'text' },
      { key: 'state', label: 'Estado', type: 'text' },
      { key: 'country', label: 'País', type: 'text' },
      { key: 'lifecycle_status', label: 'Status', type: 'enum' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: 'customer_id',
          label: 'Cliente',
          type: 'uuid',
          required: true,
          relation: {
            table: 'customers',
            valueField: 'id',
            labelField: 'full_name',
            orderBy: 'full_name',
            ascending: true,
          },
        },
        { key: 'line1', label: 'Linha 1', type: 'text', required: true },
        { key: 'line2', label: 'Linha 2', type: 'text', nullable: true },
        { key: 'city', label: 'Cidade', type: 'text', required: true },
        { key: 'state', label: 'Estado', type: 'text', required: true },
        { key: 'postal_code', label: 'CEP', type: 'text', required: true },
        { key: 'country', label: 'País', type: 'text', required: true },
        createdByField('created_by', 'Criado por'),
      ]),
    ),
  },
  {
    table: 'customer_groups',
    label: 'Customer Groups',
    description: 'Segmentação de clientes.',
    group: 'crm',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'name', ascending: true },
    listColumns: [
      { key: 'name', label: 'Nome', type: 'text' },
      { key: 'description', label: 'Descrição', type: 'text' },
      { key: 'lifecycle_status', label: 'Status', type: 'enum' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        { key: 'name', label: 'Nome', type: 'text', required: true },
        { key: 'description', label: 'Descrição', type: 'textarea', nullable: true },
        createdByField('created_by', 'Criado por'),
      ]),
    ),
  },
  {
    table: 'customer_group_memberships',
    label: 'Customer Group Memberships',
    description: 'Relação de membros por grupo.',
    group: 'crm',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'created_at', ascending: false },
    listColumns: [
      { key: 'customer_id', label: 'Cliente', type: 'uuid' },
      { key: 'customer_group_id', label: 'Grupo', type: 'uuid' },
      { key: 'lifecycle_status', label: 'Status', type: 'enum' },
      { key: 'created_at', label: 'Criado em', type: 'datetime' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: 'customer_id',
          label: 'Cliente',
          type: 'uuid',
          required: true,
          relation: {
            table: 'customers',
            valueField: 'id',
            labelField: 'full_name',
            orderBy: 'full_name',
            ascending: true,
          },
        },
        {
          key: 'customer_group_id',
          label: 'Grupo',
          type: 'uuid',
          required: true,
          relation: {
            table: 'customer_groups',
            valueField: 'id',
            labelField: 'name',
            orderBy: 'name',
            ascending: true,
          },
        },
        createdByField('created_by', 'Criado por'),
      ]),
    ),
  },
  {
    table: 'locations',
    label: 'Locations',
    description: 'Locais de estoque e operação.',
    group: 'inventory',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'name', ascending: true },
    listColumns: [
      { key: 'code', label: 'Code', type: 'text' },
      { key: 'name', label: 'Nome', type: 'text' },
      { key: 'type', label: 'Tipo', type: 'enum' },
      { key: 'lifecycle_status', label: 'Status', type: 'enum' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        { key: 'code', label: 'Code', type: 'text', required: true },
        { key: 'name', label: 'Nome', type: 'text', required: true },
        {
          key: 'type',
          label: 'Tipo',
          type: 'enum',
          required: true,
          defaultValue: 'warehouse',
          options: LOCATION_TYPE_OPTIONS,
        },
        createdByField('created_by', 'Criado por'),
      ]),
    ),
  },
  {
    table: 'inventory_levels',
    label: 'Inventory Levels',
    description: 'Saldos de estoque por produto/local.',
    group: 'inventory',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'updated_at', ascending: false },
    transactionalActions: ['inventory_reserve_release'],
    listColumns: [
      { key: 'product_id', label: 'Produto', type: 'uuid' },
      { key: 'location_id', label: 'Local', type: 'uuid' },
      { key: 'quantity_on_hand', label: 'On hand', type: 'integer' },
      { key: 'quantity_reserved', label: 'Reserved', type: 'integer' },
      { key: 'quantity_available', label: 'Available', type: 'integer' },
      { key: 'updated_at', label: 'Atualizado em', type: 'datetime' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: 'product_id',
          label: 'Produto',
          type: 'uuid',
          required: true,
          relation: {
            table: 'products',
            valueField: 'id',
            labelField: 'title',
            orderBy: 'title',
            ascending: true,
          },
        },
        {
          key: 'location_id',
          label: 'Local',
          type: 'uuid',
          required: true,
          relation: {
            table: 'locations',
            valueField: 'id',
            labelField: 'name',
            orderBy: 'name',
            ascending: true,
          },
        },
        { key: 'quantity_on_hand', label: 'Quantidade em estoque', type: 'integer', defaultValue: 0 },
        { key: 'quantity_reserved', label: 'Quantidade reservada', type: 'integer', defaultValue: 0 },
        { key: 'quantity_available', label: 'Quantidade disponível', type: 'integer', defaultValue: 0 },
        { key: 'reorder_point', label: 'Ponto de reposição', type: 'integer', defaultValue: 0 },
        createdByField('created_by', 'Criado por'),
      ]),
    ),
  },
  {
    table: 'inventory_movements',
    label: 'Inventory Movements',
    description: 'Movimentações de estoque.',
    group: 'inventory',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'created_at', ascending: false },
    listColumns: [
      { key: 'inventory_level_id', label: 'Inventory level', type: 'uuid' },
      { key: 'movement_type', label: 'Tipo', type: 'enum' },
      { key: 'quantity', label: 'Quantidade', type: 'integer' },
      { key: 'reason', label: 'Motivo', type: 'text' },
      { key: 'created_at', label: 'Criado em', type: 'datetime' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: 'inventory_level_id',
          label: 'Inventory level',
          type: 'uuid',
          required: true,
          relation: {
            table: 'inventory_levels',
            valueField: 'id',
            labelField: 'id',
            orderBy: 'created_at',
            ascending: false,
          },
        },
        {
          key: 'movement_type',
          label: 'Tipo',
          type: 'enum',
          required: true,
          options: INVENTORY_MOVEMENT_OPTIONS,
        },
        { key: 'quantity', label: 'Quantidade', type: 'integer', required: true },
        { key: 'reason', label: 'Motivo', type: 'text', nullable: true },
        { key: 'reference_type', label: 'Reference type', type: 'text', nullable: true },
        { key: 'reference_id', label: 'Reference ID', type: 'uuid', nullable: true },
        createdByField('created_by', 'Criado por'),
      ]),
    ),
  },
  {
    table: 'checkouts',
    label: 'Checkouts',
    description: 'Sessões de checkout.',
    group: 'commerce',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'created_at', ascending: false },
    listColumns: [
      { key: 'token', label: 'Token', type: 'text' },
      { key: 'customer_id', label: 'Cliente', type: 'uuid' },
      { key: 'status', label: 'Status', type: 'enum' },
      { key: 'total_amount', label: 'Total', type: 'currency' },
      { key: 'created_at', label: 'Criado em', type: 'datetime' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        { key: 'token', label: 'Token', type: 'text', required: true },
        {
          key: 'customer_id',
          label: 'Cliente',
          type: 'uuid',
          nullable: true,
          relation: {
            table: 'customers',
            valueField: 'id',
            labelField: 'full_name',
            orderBy: 'full_name',
            ascending: true,
          },
        },
        {
          key: 'status',
          label: 'Status',
          type: 'enum',
          required: true,
          defaultValue: 'open',
          options: CHECKOUT_STATUS_OPTIONS,
        },
        { key: 'total_amount', label: 'Total', type: 'currency', defaultValue: 0 },
        createdByField('created_by', 'Criado por'),
      ]),
    ),
  },
  {
    table: 'orders',
    label: 'Orders',
    description: 'Pedidos finalizados.',
    group: 'commerce',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'created_at', ascending: false },
    transactionalActions: ['orders_update_status'],
    listColumns: [
      { key: 'order_number', label: 'Pedido', type: 'text' },
      { key: 'status', label: 'Status', type: 'enum' },
      { key: 'payment_status', label: 'Pagamento', type: 'enum' },
      { key: 'fulfillment_status', label: 'Fulfillment', type: 'enum' },
      { key: 'total_amount', label: 'Total', type: 'currency' },
      { key: 'created_at', label: 'Criado em', type: 'datetime' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        { key: 'order_number', label: 'Número do pedido', type: 'text', required: true },
        {
          key: 'customer_id',
          label: 'Cliente',
          type: 'uuid',
          nullable: true,
          relation: {
            table: 'customers',
            valueField: 'id',
            labelField: 'full_name',
            orderBy: 'full_name',
            ascending: true,
          },
        },
        {
          key: 'checkout_id',
          label: 'Checkout',
          type: 'uuid',
          nullable: true,
          relation: {
            table: 'checkouts',
            valueField: 'id',
            labelField: 'token',
            orderBy: 'created_at',
            ascending: false,
          },
        },
        {
          key: 'status',
          label: 'Status',
          type: 'enum',
          required: true,
          defaultValue: 'pending',
          options: ORDER_STATUS_OPTIONS,
        },
        {
          key: 'payment_status',
          label: 'Status pagamento',
          type: 'enum',
          required: true,
          defaultValue: 'pending',
          options: ORDER_PAYMENT_STATUS_OPTIONS,
        },
        {
          key: 'fulfillment_status',
          label: 'Status fulfillment',
          type: 'enum',
          required: true,
          defaultValue: 'unfulfilled',
          options: ORDER_FULFILLMENT_STATUS_OPTIONS,
        },
        { key: 'subtotal_amount', label: 'Subtotal', type: 'currency', defaultValue: 0 },
        { key: 'discount_amount', label: 'Desconto', type: 'currency', defaultValue: 0 },
        { key: 'tax_amount', label: 'Taxa', type: 'currency', defaultValue: 0 },
        { key: 'shipping_amount', label: 'Frete', type: 'currency', defaultValue: 0 },
        { key: 'total_amount', label: 'Total', type: 'currency', defaultValue: 0 },
        createdByField('created_by', 'Criado por'),
      ]),
    ),
  },
  {
    table: 'order_items',
    label: 'Order Items',
    description: 'Itens que compõem os pedidos.',
    group: 'commerce',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'created_at', ascending: false },
    listColumns: [
      { key: 'order_id', label: 'Pedido', type: 'uuid' },
      { key: 'product_id', label: 'Produto', type: 'uuid' },
      { key: 'quantity', label: 'Qtd.', type: 'integer' },
      { key: 'unit_price', label: 'Preço unitário', type: 'currency' },
      { key: 'line_total', label: 'Total linha', type: 'currency' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: 'order_id',
          label: 'Pedido',
          type: 'uuid',
          required: true,
          relation: {
            table: 'orders',
            valueField: 'id',
            labelField: 'order_number',
            orderBy: 'created_at',
            ascending: false,
          },
        },
        {
          key: 'product_id',
          label: 'Produto',
          type: 'uuid',
          required: true,
          relation: {
            table: 'products',
            valueField: 'id',
            labelField: 'title',
            orderBy: 'title',
            ascending: true,
          },
        },
        { key: 'quantity', label: 'Quantidade', type: 'integer', required: true },
        { key: 'unit_price', label: 'Preço unitário', type: 'currency', required: true },
        { key: 'line_total', label: 'Total da linha', type: 'currency', required: true },
        createdByField('created_by', 'Criado por'),
      ]),
    ),
  },
  {
    table: 'transactions',
    label: 'Transactions',
    description: 'Transações comerciais agregadas.',
    group: 'commerce',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'created_at', ascending: false },
    listColumns: [
      { key: 'order_id', label: 'Pedido', type: 'uuid' },
      { key: 'status', label: 'Status', type: 'enum' },
      { key: 'total_amount', label: 'Total', type: 'currency' },
      { key: 'currency', label: 'Moeda', type: 'text' },
      { key: 'created_at', label: 'Criado em', type: 'datetime' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: 'order_id',
          label: 'Pedido',
          type: 'uuid',
          nullable: true,
          relation: {
            table: 'orders',
            valueField: 'id',
            labelField: 'order_number',
            orderBy: 'created_at',
            ascending: false,
          },
        },
        {
          key: 'checkout_id',
          label: 'Checkout',
          type: 'uuid',
          nullable: true,
          relation: {
            table: 'checkouts',
            valueField: 'id',
            labelField: 'token',
            orderBy: 'created_at',
            ascending: false,
          },
        },
        {
          key: 'status',
          label: 'Status',
          type: 'enum',
          defaultValue: 'pending',
          required: true,
          options: TRANSACTION_STATUS_OPTIONS,
        },
        { key: 'total_amount', label: 'Total', type: 'currency', required: true, defaultValue: 0 },
        { key: 'currency', label: 'Moeda', type: 'text', required: true, defaultValue: 'BRL' },
        createdByField('created_by', 'Criado por'),
      ]),
    ),
  },
  {
    table: 'transaction_items',
    label: 'Transaction Items',
    description: 'Itens financeiros da transação.',
    group: 'commerce',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'created_at', ascending: false },
    listColumns: [
      { key: 'transaction_id', label: 'Transaction', type: 'uuid' },
      { key: 'kind', label: 'Tipo', type: 'enum' },
      { key: 'amount', label: 'Valor', type: 'currency' },
      { key: 'created_at', label: 'Criado em', type: 'datetime' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: 'transaction_id',
          label: 'Transaction',
          type: 'uuid',
          required: true,
          relation: {
            table: 'transactions',
            valueField: 'id',
            labelField: 'id',
            orderBy: 'created_at',
            ascending: false,
          },
        },
        {
          key: 'kind',
          label: 'Tipo',
          type: 'enum',
          required: true,
          options: TRANSACTION_ITEM_KIND_OPTIONS,
        },
        { key: 'reference_id', label: 'Reference ID', type: 'uuid', nullable: true },
        { key: 'amount', label: 'Valor', type: 'currency', required: true },
        createdByField('created_by', 'Criado por'),
      ]),
    ),
  },
  {
    table: 'payments',
    label: 'Payments',
    description: 'Pagamentos de pedidos.',
    group: 'commerce',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'created_at', ascending: false },
    listColumns: [
      { key: 'order_id', label: 'Pedido', type: 'uuid' },
      { key: 'method', label: 'Método', type: 'text' },
      { key: 'status', label: 'Status', type: 'enum' },
      { key: 'amount', label: 'Valor', type: 'currency' },
      { key: 'created_at', label: 'Criado em', type: 'datetime' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: 'order_id',
          label: 'Pedido',
          type: 'uuid',
          nullable: true,
          relation: {
            table: 'orders',
            valueField: 'id',
            labelField: 'order_number',
            orderBy: 'created_at',
            ascending: false,
          },
        },
        {
          key: 'transaction_id',
          label: 'Transaction',
          type: 'uuid',
          nullable: true,
          relation: {
            table: 'transactions',
            valueField: 'id',
            labelField: 'id',
            orderBy: 'created_at',
            ascending: false,
          },
        },
        { key: 'method', label: 'Método', type: 'text', required: true },
        {
          key: 'status',
          label: 'Status',
          type: 'enum',
          required: true,
          defaultValue: 'pending',
          options: TRANSACTION_STATUS_OPTIONS,
        },
        { key: 'amount', label: 'Valor', type: 'currency', required: true },
        { key: 'currency', label: 'Moeda', type: 'text', required: true, defaultValue: 'BRL' },
        { key: 'provider_reference', label: 'Provider reference', type: 'text', nullable: true },
        createdByField('created_by', 'Criado por'),
      ]),
    ),
  },
  {
    table: 'refunds',
    label: 'Refunds',
    description: 'Solicitações e status de reembolso.',
    group: 'commerce',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'created_at', ascending: false },
    listColumns: [
      { key: 'payment_id', label: 'Pagamento', type: 'uuid' },
      { key: 'order_id', label: 'Pedido', type: 'uuid' },
      { key: 'status', label: 'Status', type: 'enum' },
      { key: 'amount', label: 'Valor', type: 'currency' },
      { key: 'created_at', label: 'Criado em', type: 'datetime' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: 'payment_id',
          label: 'Pagamento',
          type: 'uuid',
          required: true,
          relation: {
            table: 'payments',
            valueField: 'id',
            labelField: 'id',
            orderBy: 'created_at',
            ascending: false,
          },
        },
        {
          key: 'order_id',
          label: 'Pedido',
          type: 'uuid',
          required: true,
          relation: {
            table: 'orders',
            valueField: 'id',
            labelField: 'order_number',
            orderBy: 'created_at',
            ascending: false,
          },
        },
        {
          key: 'status',
          label: 'Status',
          type: 'enum',
          defaultValue: 'pending',
          required: true,
          options: REFUND_STATUS_OPTIONS,
        },
        { key: 'amount', label: 'Valor', type: 'currency', required: true },
        { key: 'reason', label: 'Motivo', type: 'textarea', nullable: true },
        createdByField('created_by', 'Criado por'),
      ]),
    ),
  },
  {
    table: 'shipments',
    label: 'Shipments',
    description: 'Remessas e expedição.',
    group: 'inventory',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'created_at', ascending: false },
    listColumns: [
      { key: 'order_id', label: 'Pedido', type: 'uuid' },
      { key: 'status', label: 'Status', type: 'enum' },
      { key: 'carrier', label: 'Transportadora', type: 'text' },
      { key: 'tracking_number', label: 'Tracking', type: 'text' },
      { key: 'updated_at', label: 'Atualizado em', type: 'datetime' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: 'order_id',
          label: 'Pedido',
          type: 'uuid',
          required: true,
          relation: {
            table: 'orders',
            valueField: 'id',
            labelField: 'order_number',
            orderBy: 'created_at',
            ascending: false,
          },
        },
        {
          key: 'status',
          label: 'Status',
          type: 'enum',
          defaultValue: 'pending',
          required: true,
          options: SHIPMENT_STATUS_OPTIONS,
        },
        { key: 'carrier', label: 'Transportadora', type: 'text', nullable: true },
        { key: 'tracking_number', label: 'Código de rastreio', type: 'text', nullable: true },
        { key: 'shipped_at', label: 'Enviado em', type: 'datetime', nullable: true },
        { key: 'delivered_at', label: 'Entregue em', type: 'datetime', nullable: true },
        createdByField('created_by', 'Criado por'),
      ]),
    ),
  },
  {
    table: 'shipment_items',
    label: 'Shipment Items',
    description: 'Itens por remessa.',
    group: 'inventory',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'created_at', ascending: false },
    listColumns: [
      { key: 'shipment_id', label: 'Shipment', type: 'uuid' },
      { key: 'order_item_id', label: 'Order item', type: 'uuid' },
      { key: 'quantity', label: 'Quantidade', type: 'integer' },
      { key: 'created_at', label: 'Criado em', type: 'datetime' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: 'shipment_id',
          label: 'Shipment',
          type: 'uuid',
          required: true,
          relation: {
            table: 'shipments',
            valueField: 'id',
            labelField: 'id',
            orderBy: 'created_at',
            ascending: false,
          },
        },
        {
          key: 'order_item_id',
          label: 'Order item',
          type: 'uuid',
          required: true,
          relation: {
            table: 'order_items',
            valueField: 'id',
            labelField: 'id',
            orderBy: 'created_at',
            ascending: false,
          },
        },
        { key: 'quantity', label: 'Quantidade', type: 'integer', required: true },
        createdByField('created_by', 'Criado por'),
      ]),
    ),
  },
  {
    table: 'shipment_events',
    label: 'Shipment Events',
    description: 'Eventos de rastreio/logística.',
    group: 'inventory',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'created_at', ascending: false },
    listColumns: [
      { key: 'shipment_id', label: 'Shipment', type: 'uuid' },
      { key: 'event_type', label: 'Evento', type: 'text' },
      { key: 'occurred_at', label: 'Ocorrido em', type: 'datetime' },
      { key: 'created_at', label: 'Criado em', type: 'datetime' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: 'shipment_id',
          label: 'Shipment',
          type: 'uuid',
          required: true,
          relation: {
            table: 'shipments',
            valueField: 'id',
            labelField: 'id',
            orderBy: 'created_at',
            ascending: false,
          },
        },
        { key: 'event_type', label: 'Tipo de evento', type: 'text', required: true },
        { key: 'payload', label: 'Payload JSON', type: 'json', required: true, defaultValue: {} },
        {
          key: 'occurred_at',
          label: 'Ocorrido em',
          type: 'datetime',
          required: true,
          defaultValue: 'now',
        },
        createdByField('created_by', 'Criado por'),
      ]),
    ),
  },
  {
    table: 'inquiries',
    label: 'Inquiries',
    description: 'Atendimentos e chamados.',
    group: 'crm',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'created_at', ascending: false },
    listColumns: [
      { key: 'subject', label: 'Assunto', type: 'text' },
      { key: 'customer_id', label: 'Cliente', type: 'uuid' },
      { key: 'product_id', label: 'Produto', type: 'uuid' },
      { key: 'status', label: 'Status', type: 'enum' },
      { key: 'created_at', label: 'Criado em', type: 'datetime' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: 'customer_id',
          label: 'Cliente',
          type: 'uuid',
          nullable: true,
          relation: {
            table: 'customers',
            valueField: 'id',
            labelField: 'full_name',
            orderBy: 'full_name',
            ascending: true,
          },
        },
        {
          key: 'product_id',
          label: 'Produto',
          type: 'uuid',
          nullable: true,
          relation: {
            table: 'products',
            valueField: 'id',
            labelField: 'title',
            orderBy: 'title',
            ascending: true,
          },
        },
        { key: 'subject', label: 'Assunto', type: 'text', required: true },
        {
          key: 'status',
          label: 'Status',
          type: 'enum',
          defaultValue: 'open',
          required: true,
          options: INQUIRY_STATUS_OPTIONS,
        },
        createdByField('created_by', 'Criado por'),
      ]),
    ),
  },
  {
    table: 'inquiry_messages',
    label: 'Inquiry Messages',
    description: 'Mensagens de cada atendimento.',
    group: 'crm',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'created_at', ascending: false },
    listColumns: [
      { key: 'inquiry_id', label: 'Inquiry', type: 'uuid' },
      { key: 'author_id', label: 'Autor', type: 'uuid' },
      { key: 'message', label: 'Mensagem', type: 'text' },
      { key: 'created_at', label: 'Criado em', type: 'datetime' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: 'inquiry_id',
          label: 'Inquiry',
          type: 'uuid',
          required: true,
          relation: {
            table: 'inquiries',
            valueField: 'id',
            labelField: 'subject',
            orderBy: 'created_at',
            ascending: false,
          },
        },
        createdByField('author_id', 'Autor'),
        { key: 'message', label: 'Mensagem', type: 'textarea', required: true },
      ]),
    ),
  },
  {
    table: 'reviews',
    label: 'Reviews',
    description: 'Avaliações dos produtos.',
    group: 'catalog',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'created_at', ascending: false },
    listColumns: [
      { key: 'product_id', label: 'Produto', type: 'uuid' },
      { key: 'customer_id', label: 'Cliente', type: 'uuid' },
      { key: 'rating', label: 'Rating', type: 'integer' },
      { key: 'status', label: 'Status', type: 'enum' },
      { key: 'created_at', label: 'Criado em', type: 'datetime' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: 'product_id',
          label: 'Produto',
          type: 'uuid',
          required: true,
          relation: {
            table: 'products',
            valueField: 'id',
            labelField: 'title',
            orderBy: 'title',
            ascending: true,
          },
        },
        {
          key: 'customer_id',
          label: 'Cliente',
          type: 'uuid',
          nullable: true,
          relation: {
            table: 'customers',
            valueField: 'id',
            labelField: 'full_name',
            orderBy: 'full_name',
            ascending: true,
          },
        },
        { key: 'rating', label: 'Rating', type: 'integer', required: true },
        { key: 'title', label: 'Título', type: 'text', nullable: true },
        { key: 'body', label: 'Conteúdo', type: 'textarea', nullable: true },
        {
          key: 'status',
          label: 'Status',
          type: 'enum',
          defaultValue: 'pending',
          required: true,
          options: REVIEW_STATUS_OPTIONS,
        },
      ]),
    ),
  },
  {
    table: 'product_metrics',
    label: 'Product Metrics',
    description: 'Métricas agregadas de produto.',
    group: 'catalog',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'metric_date', ascending: false },
    listColumns: [
      { key: 'product_id', label: 'Produto', type: 'uuid' },
      { key: 'metric_date', label: 'Data', type: 'date' },
      { key: 'views', label: 'Views', type: 'integer' },
      { key: 'add_to_cart', label: 'Add to cart', type: 'integer' },
      { key: 'sales_count', label: 'Sales', type: 'integer' },
      { key: 'revenue_amount', label: 'Receita', type: 'currency' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        {
          key: 'product_id',
          label: 'Produto',
          type: 'uuid',
          required: true,
          relation: {
            table: 'products',
            valueField: 'id',
            labelField: 'title',
            orderBy: 'title',
            ascending: true,
          },
        },
        { key: 'metric_date', label: 'Data da métrica', type: 'date', required: true },
        { key: 'views', label: 'Views', type: 'integer', defaultValue: 0 },
        { key: 'add_to_cart', label: 'Add to cart', type: 'integer', defaultValue: 0 },
        { key: 'sales_count', label: 'Sales count', type: 'integer', defaultValue: 0 },
        { key: 'revenue_amount', label: 'Receita', type: 'currency', defaultValue: 0 },
      ]),
    ),
  },
  {
    table: 'pos_sessions',
    label: 'POS Sessions',
    description: 'Sessões de ponto de venda.',
    group: 'commerce',
    primaryKey: 'id',
    deleteStrategy: 'soft',
    sort: { column: 'opened_at', ascending: false },
    listColumns: [
      { key: 'opened_by', label: 'Operador', type: 'uuid' },
      { key: 'opened_at', label: 'Aberta em', type: 'datetime' },
      { key: 'closed_at', label: 'Fechada em', type: 'datetime' },
      { key: 'status', label: 'Status', type: 'enum' },
      { key: 'opening_amount', label: 'Abertura', type: 'currency' },
      { key: 'closing_amount', label: 'Fechamento', type: 'currency' },
    ],
    fields: withStandardTableMeta(
      withLifecycleAndTimestamps([
        createdByField('opened_by', 'Aberta por'),
        {
          key: 'opened_at',
          label: 'Aberta em',
          type: 'datetime',
          required: true,
          defaultValue: 'now',
        },
        { key: 'closed_at', label: 'Fechada em', type: 'datetime', nullable: true },
        { key: 'opening_amount', label: 'Valor abertura', type: 'currency', defaultValue: 0 },
        { key: 'closing_amount', label: 'Valor fechamento', type: 'currency', nullable: true },
        {
          key: 'status',
          label: 'Status',
          type: 'enum',
          required: true,
          defaultValue: 'open',
          options: POS_STATUS_OPTIONS,
        },
      ]),
    ),
  },
]

export const SCHEMA_REGISTRY_BY_TABLE = Object.fromEntries(
  SCHEMA_REGISTRY.map((config) => [config.table, config]),
) as Record<SchemaTableName, TableConfig>

export const SCHEMA_TABLE_NAMES = SCHEMA_REGISTRY.map((config) => config.table)

export function getTableConfig(table: string): TableConfig | null {
  if (table in SCHEMA_REGISTRY_BY_TABLE) {
    return SCHEMA_REGISTRY_BY_TABLE[table as SchemaTableName]
  }

  return null
}

export function getNullableFields(config: TableConfig): Array<string> {
  return config.fields.filter((field) => field.nullable).map((field) => field.key)
}

export function getCreatableFields(config: TableConfig): Array<FieldConfig> {
  return config.fields.filter((field) => field.editableOnCreate !== false)
}

export function getUpdatableFields(config: TableConfig): Array<FieldConfig> {
  return config.fields.filter((field) => field.editableOnUpdate !== false)
}

export function getRelationFields(config: TableConfig): Array<FieldConfigWithRelation> {
  return config.fields.filter((field): field is FieldConfigWithRelation => field.relation !== undefined)
}
