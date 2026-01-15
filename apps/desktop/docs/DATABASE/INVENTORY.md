## 2. Estoque (Inventory)

Para manter o nível "super generalista" e profissional, o segredo do inventário não é apenas saber "quanto" você tem, mas **onde** está, **em que estado** está e **para quem** está reservado.

O maior erro de modelagem é colocar o campo `quantity` dentro da tabela de produtos. Isso impede que você tenha o mesmo produto em duas lojas diferentes ou em um depósito e na prateleira.

Aqui está a estrutura definitiva de inventário, dividida em **Locais** (Onde) e **Saldos** (O Quanto).

---

### 1. Tabela Auxiliar: Locais de Estoque (`locations`)

Antes de ter estoque, você precisa definir _onde_ ele cabe. Isso resolve o problema de "Loja Física" vs "Virtual" vs "Caminhão de Entrega".

- `id` (UUID): Identificador.
- `name` (String): "Loja Centro", "Depósito SP", "Estoque Virtual Fornecedor".
- `type` (Enum): Define a lógica de venda.
- Values: `warehouse` (CD), `store` (Loja Física), `transit` (Em transporte), `virtual` (Dropshipping/Infoproduto), `customer` (Entregue).

- `is_sellable` (Boolean): Se o estoque deste local aparece no site para venda. (Ex: Estoque de "Avarias" seria `false`).
- `address_data` (JSONB): Endereço físico para cálculo de frete de origem.

---

### 2. Tabela Principal: Saldos de Estoque (`inventory_levels`)

Esta é a tabela que responde "Quantos iPhone 15 eu tenho na Loja X?". Ela deve ser única por **Produto + Local + Lote**.

#### Chaves e Relacionamentos

- `id` (UUID): Identificador único do registro de saldo.
- `product_id` (FK): De qual produto estamos falando.
- `location_id` (FK): Em qual armazém/loja ele está.

#### Quantidades (A "Matemática" do Estoque)

Nunca use apenas um campo "quantidade". Você precisa saber o que é físico e o que já foi prometido.

- `quantity_on_hand` (Integer/Decimal): **Estoque Físico Total**. O que você contaria se fosse lá na prateleira agora.
- `quantity_reserved` (Integer/Decimal): **Estoque Comprometido**. Itens vendidos online que ainda não saíram do prédio, ou itens no carrinho de compras (se você reservar carrinho).
- `quantity_available` (Generated/Calculated): Coluna virtual ou calculada na query (`on_hand` - `reserved`). É isso que o site mostra para o cliente comprar.

#### Especificidades (O "Generalismo")

Aqui cobrimos alimentos, eletrônicos e moda.

- `batch_number` (String): Número do lote. Essencial para rastreio de validade ou recall.
- `serial_number` (String): Para itens únicos (ex: IMEI de celular, chassi de carro). Se preenchido, a quantidade geralmente é 1.
- `expiry_date` (Date): Validade. Se o produto vencer, o sistema pode automaticamente marcar como não vendível.
- `sku_vendor` (String): O código que o fornecedor usa (as vezes diferente do seu SKU).

#### Controle de Qualidade

- `stock_status` (Enum): O estado desse item específico.
- Values: `sellable` (Vendível), `damaged` (Avariado), `quarantine` (Em análise/CQ), `expired` (Vencido).

#### Auditoria

- `last_counted_at` (Timestamp): Data do último inventário físico (balanço). Ajuda a saber a confiabilidade do número.
- `aisle_bin_slot` (String): Endereço exato dentro do armazém (Corredor A, Pote 2).

---

### 3. Exemplo de SQL (PostgreSQL)

```sql
-- Primeiro, definimos ONDE as coisas podem estar
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('warehouse', 'store', 'transit', 'virtual')),
    is_sellable BOOLEAN DEFAULT TRUE, -- Se o e-commerce puxa estoque daqui
    address_data JSONB -- Para cálculo de frete de saída
);

-- Agora, o inventário de fato
CREATE TABLE inventory_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- O tripé do estoque: O Que, Onde e Qual Lote
    product_id UUID NOT NULL REFERENCES products(id),
    location_id UUID NOT NULL REFERENCES locations(id),

    -- Granularidade
    batch_number VARCHAR(100), -- Para iogurtes, tintas, remédios
    serial_number VARCHAR(100), -- Para celulares, carros (Quantidade será 1)
    expiry_date DATE,

    -- Quantidades
    quantity_on_hand DECIMAL(15, 4) DEFAULT 0, -- Decimal permite vender 1.5kg de areia
    quantity_reserved DECIMAL(15, 4) DEFAULT 0,

    -- Status
    stock_status VARCHAR(20) DEFAULT 'sellable' CHECK (stock_status IN ('sellable', 'damaged', 'quarantine', 'expired')),
    aisle_bin_slot VARCHAR(50), -- Localização micro (Prateleira 3B)

    last_counted_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Garante que não dupliquemos o mesmo lote no mesmo local
    UNIQUE (product_id, location_id, batch_number, serial_number, stock_status)
);

```

### Casos de Uso Reais com essa Estrutura:

1. **Venda Online com Retirada na Loja (Omnichannel):**

- O sistema verifica `inventory_levels` onde `location_type = 'store'` e `stock_status = 'sellable'`.
- Ao comprar, aumenta o `quantity_reserved` na Loja Física, impedindo que alguém na loja pegue o produto da prateleira antes do funcionário separar.

2. **Produto Perecível (Supermercado):**

- Você tem 100 iogurtes.
- 50 são do Lote A (Vence amanhã).
- 50 são do Lote B (Vence mês que vem).
- São duas linhas na tabela. O sistema pode fazer uma promoção automática apenas para o Lote A.

3. **Dropshipping / Infoproduto:**

- Cria-se um `location` do tipo `virtual`.
- A `quantity_on_hand` pode ser definida como 999.999 (infinito) ou espelhar via API o estoque do fornecedor.

4. **Caminhão de Entrega:**

- Quando o produto sai do depósito para entrega, você não dá baixa no item. Você faz uma **transferência** do `location_id` (Depósito) para o `location_id` (Caminhão 01 - Transit). Se o caminhão for roubado ou o item voltar, você ainda tem o registro contábil de que o item existia.

---
