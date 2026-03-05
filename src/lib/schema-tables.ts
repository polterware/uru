export type AppRoute = '/products' | '/orders' | '/inventory' | '/settings'

export type SchemaTable = {
  name: string
  description: string
  route?: AppRoute
}

export type SchemaTableGroup = {
  key: 'identity' | 'catalog' | 'crm' | 'inventory' | 'commerce'
  label: string
  tables: Array<SchemaTable>
}

export const SCHEMA_TABLE_GROUPS: Array<SchemaTableGroup> = [
  {
    key: 'identity',
    label: 'Identidade e Acesso',
    tables: [
      { name: 'profiles', description: 'Perfis de usuário autenticado.' },
      { name: 'roles', description: 'Papéis de autorização do sistema.' },
      { name: 'user_roles', description: 'Vínculo entre usuários e papéis.' },
      { name: 'modules', description: 'Módulos e flags de funcionalidades.' },
    ],
  },
  {
    key: 'catalog',
    label: 'Catálogo',
    tables: [
      { name: 'categories', description: 'Categorias do catálogo.' },
      { name: 'brands', description: 'Marcas de produtos.' },
      { name: 'products', description: 'Produtos comercializados.', route: '/products' },
      { name: 'reviews', description: 'Avaliações dos produtos.' },
      { name: 'product_metrics', description: 'Métricas agregadas de produto.' },
    ],
  },
  {
    key: 'crm',
    label: 'Clientes e Relacionamento',
    tables: [
      { name: 'customers', description: 'Cadastro de clientes.' },
      { name: 'customer_addresses', description: 'Endereços de clientes.' },
      { name: 'customer_groups', description: 'Segmentação de clientes.' },
      {
        name: 'customer_group_memberships',
        description: 'Relação de membros por grupo.',
      },
      { name: 'inquiries', description: 'Atendimentos e chamados.' },
      { name: 'inquiry_messages', description: 'Mensagens de cada atendimento.' },
    ],
  },
  {
    key: 'inventory',
    label: 'Estoque e Logística',
    tables: [
      { name: 'locations', description: 'Locais de estoque e operação.' },
      {
        name: 'inventory_levels',
        description: 'Saldos de estoque por produto/local.',
        route: '/inventory',
      },
      { name: 'inventory_movements', description: 'Movimentações de estoque.' },
      { name: 'shipments', description: 'Remessas e expedição.' },
      { name: 'shipment_items', description: 'Itens por remessa.' },
      { name: 'shipment_events', description: 'Eventos de rastreio/logística.' },
    ],
  },
  {
    key: 'commerce',
    label: 'Checkout e Pedidos',
    tables: [
      { name: 'checkouts', description: 'Sessões de checkout.' },
      { name: 'orders', description: 'Pedidos finalizados.', route: '/orders' },
      { name: 'order_items', description: 'Itens que compõem os pedidos.' },
      { name: 'transactions', description: 'Transações comerciais agregadas.' },
      { name: 'transaction_items', description: 'Itens financeiros da transação.' },
      { name: 'payments', description: 'Pagamentos de pedidos.' },
      { name: 'refunds', description: 'Solicitações e status de reembolso.' },
      { name: 'pos_sessions', description: 'Sessões de ponto de venda.' },
    ],
  },
]

export const SCHEMA_TABLES = SCHEMA_TABLE_GROUPS.flatMap((group) => group.tables)
