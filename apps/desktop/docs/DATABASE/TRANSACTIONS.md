## 3. Transações (Transactions)

Para atingir o nível máximo de generalização em **Transações**, você não pode pensar apenas em "Vendas". Uma transação é **qualquer evento que altera o estado financeiro ou de estoque** da empresa.

Isso inclui: Venda (PDV/E-commerce), Compra (de fornecedor), Devolução (RMA), Perda (roubo/quebra), Transferência (entre estoques) e Ajuste de Balanço.

A arquitetura correta aqui é baseada no conceito de **Ledger (Livro Razão)**. Separamos a transação em três camadas: **O Cabeçalho (O Evento)**, **Os Itens (O Conteúdo)** e **Os Movimentos (As Consequências)**.

Aqui está a estrutura definitiva:

---

### 1. O Cabeçalho: `transactions`

Esta tabela representa o "contrato" ou o evento macro. Ela diz **o que** está acontecendo, **quem** está envolvido e **quando**.

- `id` (UUID): Identificador único.
- `type` (Enum): O campo mais crítico. Define a regra de negócio.
- Values: `sale_order` (Venda), `purchase_order` (Compra de Fornecedor), `transfer` (Transferência), `adjustment` (Correção de Estoque), `return` (Devolução/Troca).

- `status` (Enum): O ciclo de vida.
- Values: `draft`, `pending_payment`, `paid`, `processing`, `shipped`, `delivered`, `completed`, `cancelled`, `refunded`.

- `channel` (String): Origem da transação (ex: "POS Loja 1", "App Android", "Marketplace X", "Backoffice").
- **Atores (Quem):**
- `customer_id` (UUID): Cliente (pode ser nulo em ajustes internos).
- `supplier_id` (UUID): Fornecedor (usado em compras).
- `staff_id` (UUID): Quem operou o caixa ou criou o pedido.

- **Financeiro Macro:**
- `currency` (String): BRL, USD.
- `total_gross` (Decimal): Soma dos itens.
- `total_discount` (Decimal): Desconto global.
- `total_tax` (Decimal): Impostos somados.
- `total_shipping` (Decimal): Frete cobrado.
- `total_net` (Decimal): O valor final a pagar.

- **Dados Congelados (Snapshots):**
- `billing_address` (JSONB): Endereço de cobrança copiado no momento da compra (não use FK, pois o cliente muda de casa).
- `shipping_address` (JSONB): Endereço de entrega copiado.

---

### 2. Os Detalhes: `transaction_items`

Aqui listamos o que foi transacionado. O segredo do generalismo aqui é o **Snapshotting** (copiar os dados do produto para garantir integridade histórica). Se o preço do produto mudar amanhã, essa venda antiga deve manter o preço antigo.

- `id` (UUID): PK.
- `transaction_id` (FK): Vínculo com o pai.
- `product_id` (FK): Vínculo com o produto (para relatórios).
- `sku_snapshot` (String): O SKU no momento da venda.
- `name_snapshot` (String): O nome no momento da venda.
- `quantity` (Decimal): Quantidade (suporta fracionados, ex: 1.5kg).
- `unit_price` (Decimal): Preço unitário **cobrado**.
- `unit_cost` (Decimal): Custo do produto **naquele momento** (essencial para calcular lucro real depois).
- `tax_details` (JSONB): Detalhes fiscais específicos desta linha (ICMS, IPI, VAT).
- `metadata` (JSONB): Personalizações (ex: "Escrever 'Parabéns' no bolo").

---

### 3. As Consequências Físicas: `inventory_movements` (O Stock Ledger)

Esta tabela é o **rastro** de auditoria. Nenhuma quantidade em `inventory_levels` muda sem que um registro seja criado aqui.

- `id` (UUID): PK.
- `transaction_id` (FK): Qual venda/compra gerou isso?
- `transaction_item_id` (FK): Qual item específico?
- `product_id` (FK): O produto.
- `location_id` (FK): De onde saiu ou para onde foi.
- `type` (Enum): `in` (entrada), `out` (saída).
- `quantity` (Decimal): Valor sempre positivo.
- `balance_before` (Decimal): Quanto tinha antes (auditoria).
- `balance_after` (Decimal): Quanto ficou depois (auditoria).
- `reason` (String): Ex: "Venda #123", "Quebra no transporte", "Chegada de Fornecedor".

---

### 4. As Consequências Financeiras: `payments`

Separar o pagamento da transação é vital, pois uma venda de R$ 100 pode ser paga com: R$ 50 em Dinheiro + R$ 50 em Cartão.

- `id` (UUID): PK.
- `transaction_id` (FK): Vínculo.
- `method` (Enum): `credit_card`, `debit_card`, `cash`, `pix`, `bank_slip`, `store_credit`.
- `amount` (Decimal): Valor desta parcela.
- `status` (Enum): `pending`, `authorized`, `captured`, `failed`, `refunded`.
- `gateway_data` (JSONB): Dados retornados pelo Stripe/Pagar.me/Adyen (NSU, Authorization Code, Token).

---

### Exemplo de SQL (PostgreSQL)

```sql
-- 1. O Cabeçalho da Transação
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Definição do Evento
    type VARCHAR(50) NOT NULL CHECK (type IN ('sale', 'purchase', 'transfer', 'return', 'adjustment')),
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    channel VARCHAR(100), -- 'pos_01', 'website', 'app'

    -- Participantes
    customer_id UUID, -- Null se for compra de fornecedor
    supplier_id UUID, -- Null se for venda
    staff_id UUID,    -- Quem processou

    -- Valores Monetários (Agregados)
    currency CHAR(3) DEFAULT 'BRL',
    total_items DECIMAL(15, 2) DEFAULT 0,
    total_shipping DECIMAL(15, 2) DEFAULT 0,
    total_discount DECIMAL(15, 2) DEFAULT 0,
    total_net DECIMAL(15, 2) DEFAULT 0, -- O valor final da nota

    -- Contexto Logístico
    shipping_method VARCHAR(100),
    shipping_address JSONB, -- Snapshot do endereço
    billing_address JSONB,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Os Itens da Transação
CREATE TABLE transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    product_id UUID REFERENCES products(id), -- Pode ser null se o produto for deletado, mas snapshots salvam

    -- Snapshots (Garantia Histórica)
    sku_snapshot VARCHAR(100),
    name_snapshot VARCHAR(255),

    -- Matemática da Linha
    quantity DECIMAL(15, 4) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL, -- Valor de Venda
    unit_cost DECIMAL(15, 2),          -- Valor de Custo (Para relatório de margem)

    total_line DECIMAL(15, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,

    -- Flexibilidade
    attributes_snapshot JSONB, -- Ex: A cor escolhida na hora da compra
    tax_details JSONB -- Ex: {"icms_rate": 18, "ipi": 0}
);

-- 3. Movimentação Física (O Rastro do Estoque)
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id),
    inventory_level_id UUID REFERENCES inventory_levels(id), -- Liga com a tabela de saldo anterior

    type VARCHAR(10) CHECK (type IN ('in', 'out')),
    quantity DECIMAL(15, 4) NOT NULL,

    -- Auditoria
    previous_balance DECIMAL(15, 4),
    new_balance DECIMAL(15, 4),

    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Pagamentos
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id),

    payment_method VARCHAR(50) NOT NULL, -- credit_card, pix, cash
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',

    provider_transaction_id VARCHAR(255), -- ID no Stripe/Pagar.me
    metadata JSONB, -- JSON cru do gateway de pagamento

    created_at TIMESTAMP DEFAULT NOW()
);

```

### Cenários Complexos Resolvidos por essa Estrutura:

1. **Troca de Produto (Cliente devolve Azul P e leva Vermelho M):**

- Cria-se uma `transaction` do tipo `exchange` (ou `return` seguida de `sale`).
- Item 1: Camisa Azul (Quantidade -1, Valor Negativo ou marcado como estorno).
- Item 2: Camisa Vermelha (Quantidade 1, Valor Positivo).
- `inventory_movements`: Entrada de 1 no estoque de "Avarias" ou "Principal" (depende da avaliação física) e Saída de 1 do estoque "Principal".
- `payments`: Se houver diferença de preço, registra-se apenas o pagamento do delta.

2. **Transferência entre Lojas:**

- `transaction` tipo `transfer`. Origem: Loja A, Destino: Loja B.
- Preço unitário é 0 (ou preço de custo, para contabilidade interna).
- Gera dois `inventory_movements`: Um `out` na Loja A e um `in` na Loja B (ou `in` no local "Em Trânsito" primeiro).

3. **Venda de Kit (Computador + Monitor):**

- O `transaction_item` pode ser o ID do Kit.
- Mas, via lógica de aplicação (backend), gera-se múltiplos `inventory_movements` para baixar os componentes individuais (CPU, Teclado, Monitor) da tabela de estoque.

4. **Pagamento Misto:**

- Total da Venda: R$ 200,00.
- Tabela `payments` registro 1: R$ 100,00 (Cash).
- Tabela `payments` registro 2: R$ 100,00 (Credit Card).
- ## A soma dos pagamentos bate com o `total_net` da transação? Se sim, `status` muda para `paid`.
