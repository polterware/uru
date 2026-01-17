# Frontend CRUDs - Escopo e Detalhes de Implementacao

Este documento define o escopo do ciclo 1, as rotas dedicadas, quais
dominios terao CRUD completo ou parcial, e os campos que devem ser
expostos nas tabelas e formularios. A base e o schema de
`src-tauri/migrations/001_initial_schema.sql` e os comandos em
`src-tauri/src/features`.

## Escopo do ciclo 1

### CRUD completo (rotas dedicadas)
- `products`
- `brands`
- `categories`
- `customers` (com sub-CRUD de `customer_addresses` e
  `customer_group_memberships`)

### CRUD parcial
- `transactions` (com `transaction_items`)
- `orders`
- `payments`
- `refunds`
- `checkouts`

### Estoque
- `inventory`: leitura de `inventory_levels` com ajuste via
  `inventory_movements`
- `movements`: criar + listar (sem editar/remover)

### Fora do ciclo
- `pairing`: funcionalidade separada
- `debtors`: removido do escopo

## Status atual (implementado x pendente)

### Implementado
- Tabelas de listagem e rotas dedicadas: `/products`, `/brands`, `/categories`, `/customers`
- Tabelas de listagem e rotas existentes: `/inventory`, `/movements`, `/transactions`, `/orders`, `/payments`, `/refunds`, `/checkouts`
- Analytics no backend (SQLite/Rust) com comandos:
  - `get_dashboard_stats`
  - `get_stock_movements`
- Repositorio frontend para analytics e consumo no dashboard

### Pendente
- Formularios de criacao/edicao (CRUD completo e parcial)
- Sub-CRUDs de `customer_addresses` e `customer_group_memberships`
- Sub-CRUD de `transaction_items`
- Acoes de status (ex.: alterar status de `transactions`, `orders`, `payments`, `refunds`, `checkouts`)
- Filtros, ordenacao e paginacao reais via backend (hoje apenas UI)
- Ajuste de estoque via `inventory_movements` (formulario + fluxo)
- Navegacao por FKs (link para entidade relacionada)

## Rotas dedicadas

Criar rotas dedicadas no frontend para os CRUDs completos:
- `/products`
- `/brands`
- `/categories`
- `/customers`

Rotas existentes mantidas:
- `/inventory`
- `/movements`
- `/transactions`
- `/orders`
- `/payments`
- `/refunds`
- `/checkouts`

Criar rotas de criacao e edicao para cada dominio com CRUD completo e
parcial, seguindo o padrao de tabelas ja existente no frontend.

## Regras gerais para tabelas e formularios

- Sempre listar registros com `_status != 'deleted'`.
- Delecao e sempre soft delete: atualizar `_status = 'deleted'`.
- `created_at` e `updated_at` apenas leitura.
- Campos JSON (`metadata`, `attributes`, `custom_attributes`) devem ter
  editor simples (textarea) com validacao de JSON.
- Campos TEXT[] podem ser editados como tags (lista de strings).
- Relacionamentos por FK devem usar select com busca.
- Status devem ser selects com valores validos do schema.
- IDs nao editaveis pelo usuario (gerados pelo backend).

## Products (CRUD completo)

### Tabela principal
`products`

### Listagem (colunas sugeridas)
- `sku`, `name`, `type`, `status`, `price`, `promotional_price`
- `brand_id`, `category_id`
- `is_shippable`, `stock_status` (se houver join de inventory)
- `created_at`

### Formulario (campos)
- Identificacao: `sku` (obrigatorio), `name` (obrigatorio), `slug`
- Tipo e status: `type`, `status`
- Precificacao: `price` (obrigatorio), `promotional_price`,
  `cost_price`, `currency`
- Fiscal: `gtin_ean`, `tax_ncm`
- Entrega: `is_shippable`, `weight_g`, `width_mm`, `height_mm`,
  `depth_mm`
- Relacoes: `category_id`, `brand_id`, `parent_id`
- Metadados: `attributes`, `metadata`

### Regras
- `type` deve ser um dos: `physical`, `digital`, `service`, `bundle`.
- `price` e `promotional_price` devem ser >= 0.

## Brands (CRUD completo)

### Tabela principal
`brands`

### Listagem (colunas sugeridas)
- `name`, `slug`, `status`, `is_featured`, `sort_order`
- `website_url`, `created_at`

### Formulario (campos)
- `shop_id` (obrigatorio)
- `name` (obrigatorio), `slug` (obrigatorio)
- `logo_url`, `banner_url`
- `description`, `rich_description`
- `website_url`
- `status`, `is_featured`, `sort_order`
- `seo_title`, `seo_keywords`, `metadata`

## Categories (CRUD completo)

### Tabela principal
`categories`

### Listagem (colunas sugeridas)
- `name`, `slug`, `parent_id`, `type`, `is_visible`, `sort_order`
- `created_at`

### Formulario (campos)
- `shop_id` (obrigatorio)
- `parent_id`
- `name` (obrigatorio), `slug` (obrigatorio)
- `description`, `image_url`, `banner_url`
- `type`, `rules`
- `is_visible`, `sort_order`
- `seo_title`, `seo_description`, `template_suffix`, `metadata`

### Regras
- `type` default `manual`.
- `rules` deve ser JSON valido quando `type` usar regras.

## Customers (CRUD completo + sub-CRUD)

### Tabela principal
`customers`

### Listagem (colunas sugeridas)
- `type`, `email`, `phone`
- `first_name`, `last_name`, `company_name`
- `status`, `orders_count`, `total_spent`, `last_order_at`
- `created_at`

### Formulario (campos)
- Identificacao: `type`, `email`, `phone`
- Pessoa: `first_name`, `last_name`, `company_name`
- Fiscal: `tax_id`, `tax_id_type`, `state_tax_id`
- Preferencias: `status`, `currency`, `language`, `accepts_marketing`
- Segmentacao: `tags`, `customer_group_id`
- Observacoes: `notes`
- Metadados: `metadata`, `custom_attributes`

### Sub-CRUD: customer_addresses
Campos:
- `type`, `is_default`, `first_name`, `last_name`, `company`
- `address1`, `address2`, `city`, `province_code`, `country_code`,
  `postal_code`, `phone`, `metadata`

### Sub-CRUD: customer_group_memberships
Campos:
- `customer_group_id`

## Inventory (listagem + ajuste via movimentacoes)

### Tabela principal
`inventory_levels`

### Listagem (colunas sugeridas)
- `product_id`, `location_id`
- `quantity_on_hand`, `quantity_reserved`, `stock_status`
- `batch_number`, `serial_number`, `expiry_date`
- `last_counted_at`

### Acoes
- Ajuste de estoque sempre cria um registro em `inventory_movements`.
- Nao permitir edicao direta de `quantity_on_hand`.

## Movements (criar + listar)

### Tabela principal
`inventory_movements`

### Listagem (colunas sugeridas)
- `type`, `quantity`, `inventory_level_id`
- `previous_balance`, `new_balance`
- `created_at`

### Formulario (campos)
- `inventory_level_id` (obrigatorio)
- `type` (`in` ou `out`)
- `quantity` (obrigatorio, > 0)

## Transactions (CRUD parcial)

### Tabela principal
`transactions`

### Listagem (colunas sugeridas)
- `type`, `status`, `channel`
- `customer_id`, `staff_id`
- `total_net`, `total_items`, `total_discount`, `total_shipping`
- `created_at`

### Formulario (campos)
- `type` (obrigatorio)
- `status`
- `channel`
- `customer_id`, `staff_id`
- `currency`
- `shipping_method`
- `shipping_address`, `billing_address` (JSON)

### Itens (sub-CRUD)
Tabela: `transaction_items`
- `product_id`, `sku_snapshot`, `name_snapshot`
- `quantity`, `unit_price`, `unit_cost`
- `attributes_snapshot`, `tax_details` (JSON)

### Acoes permitidas
- Criar, listar, alterar status
- Sem delete fisico

## Orders (CRUD parcial)

### Tabela principal
`orders`

### Listagem (colunas sugeridas)
- `order_number`, `status`, `payment_status`, `fulfillment_status`
- `customer_id`, `shop_id`
- `subtotal_price`, `total_price`
- `created_at`

### Formulario (campos)
- `order_number`, `idempotency_key`
- `channel`, `shop_id`, `customer_id`
- `status`, `payment_status`, `fulfillment_status`
- `currency`
- `subtotal_price`, `total_discounts`, `total_tax`,
  `total_shipping`, `total_tip`, `total_price`
- `tax_lines`, `discount_codes`, `custom_attributes`, `metadata`
- `customer_snapshot`, `billing_address`, `shipping_address` (JSON)

### Acoes permitidas
- Criar, listar, alterar status
- Sem delete fisico

## Payments (CRUD parcial)

### Tabela principal
`payments`

### Listagem (colunas sugeridas)
- `transaction_id`, `amount`, `currency`
- `provider`, `method`, `status`
- `created_at`

### Formulario (campos)
- `transaction_id` (obrigatorio)
- `amount` (obrigatorio), `currency`
- `provider` (obrigatorio), `method` (obrigatorio)
- `installments`
- `status`
- `provider_transaction_id`, `authorization_code`
- `payment_details`, `risk_level` (JSON)
- `authorized_at`, `captured_at`, `voided_at`

### Acoes permitidas
- Criar, listar, alterar status
- Sem delete fisico

## Refunds (CRUD parcial)

### Tabela principal
`refunds`

### Listagem (colunas sugeridas)
- `payment_id`, `amount`, `status`, `reason`, `created_at`

### Formulario (campos)
- `payment_id` (obrigatorio)
- `amount` (obrigatorio)
- `status`, `reason`
- `provider_refund_id`

### Acoes permitidas
- Criar, listar, alterar status
- Sem delete fisico

## Checkouts (CRUD parcial)

### Tabela principal
`checkouts`

### Listagem (colunas sugeridas)
- `token`, `status`, `email`, `user_id`, `total_price`, `created_at`

### Formulario (campos)
- `token` (obrigatorio)
- `user_id`, `email`
- `items`, `shipping_address`, `billing_address`, `shipping_line`
- `applied_discount_codes`
- `currency`
- `subtotal_price`, `total_tax`, `total_shipping`,
  `total_discounts`, `total_price`
- `status`, `reservation_expires_at`, `completed_at`
- `metadata`, `recovery_url`

### Acoes permitidas
- Criar, listar, alterar status
- Sem delete fisico

## Analytics (dashboard)

### Backend (Tauri + SQLite)
- Comandos:
  - `get_dashboard_stats`
  - `get_stock_movements`
- Fonte de dados:
  - `inventory_levels` e `products` para totais/valor de estoque
  - `inventory_movements` para series temporais (`stock_in` / `stock_out`)
- Time ranges suportados: `30m`, `1h`, `2h`, `7d`, `30d`, `90d`, `1y`, `all`

### Frontend
- `AnalyticsRepository` em `src/lib/db/repositories/analytics-repository.ts`
- Dashboard em `/` consome:
  - `getDashboardStats()`
  - `getStockMovements(timeRange)`

## Observacoes finais

- Todas as telas devem suportar busca, filtros e ordenacao basica.
- Listagens devem suportar paginacao.
- Campos obrigatorios devem ser sinalizados na UI.
- Para tabelas com FKs, permitir navegar para a entidade relacionada.
