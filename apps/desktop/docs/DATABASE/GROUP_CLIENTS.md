## 15. Grupos de Clientes (Customer Groups)

A tabela **`customer_groups`** (ou `segments`) é a ferramenta mais poderosa para transformar sua plataforma de uma simples "loja de varejo" em um sistema capaz de atender B2B (Atacado), Clubes de Assinatura e programas de Fidelidade.

Em um sistema **super generalista**, um grupo de clientes não é apenas um "rótulo". É um **modificador de realidade**. Quando um cliente pertence a um grupo, três coisas podem mudar para ele:

1. **Preço:** Ele vê preços diferentes (Tabela de Atacado).
2. **Impostos:** Ele paga impostos diferentes (Isenção de IPI/ICMS).
3. **Permissões:** Ele pode comprar no boleto a prazo ou ver produtos ocultos.

Aqui está a modelagem definitiva para `customer_groups`.

---

### 1. Identidade e Controle

- `id` (UUID): Chave primária.
- `shop_id` (UUID): Contexto da loja.
- `name` (String): O nome visível (Ex: "Revendedores Ouro", "Funcionários", "Isentos de Taxa").
- `code` (String): Um identificador único para integrações (Ex: `WHOLESALE_GOLD`).
- _Uso:_ Permite que plugins ou o frontend apliquem lógica específica: `if (customer.group.code === 'VIP') showConfetti()`.

### 2. O Motor de Automação (`type` & `rules`)

Assim como nas Categorias de Produtos, os Grupos de Clientes podem ser estáticos ou dinâmicos.

- `type` (Enum):
- `manual`: Você entra no perfil do cliente e marca a checkbox.
- `dynamic` (Smart): O cliente entra e sai do grupo automaticamente baseado no comportamento.

- `rules` (JSONB): As condições para a automação.
- Exemplo: `[{"field": "total_spent", "operator": ">", "value": 5000}, {"field": "orders_count", "operator": ">", "value": 10}]`.
- _Resultado:_ Assim que o cliente gasta R$ 5.000, ele entra no grupo "VIP" automaticamente.

### 3. Economia e Precificação (A Chave do B2B)

Aqui é onde o grupo afeta o bolso.

- `default_discount` (Decimal): Um desconto global simples (Ex: 10%).
- _Uso:_ Aplica-se a tudo, exceto produtos em oferta, por exemplo.

- `price_list_id` (UUID): **O recurso mais avançado.** Aponta para uma tabela de _Tabelas de Preço_.
- _Cenário:_ O Grupo "Atacado" não tem 10% de desconto. Eles têm uma tabela de preços completamente diferente (onde o produto custa R$ 50 em vez de R$ 100). Ao associar este ID, o sistema carrega os preços dessa tabela para esses usuários.

- `tax_class` (String): Define a regra fiscal.
- Ex: `tax_exempt` (ONGs), `reseller` (Substituição Tributária).

### 4. Permissões e Regras de Negócio

- `payment_methods` (JSONB): Restringe ou libera formas de pagamento.
- Ex: `["boleto_prazo", "pix"]`. O cliente "Varejo" só vê Cartão. O cliente "Grupo B2B" vê "Boleto 30 Dias".

- `shipping_methods` (JSONB):
- Ex: O grupo "VIP" tem frete grátis forçado. O grupo "Internacional" só vê DHL.

- `is_hidden` (Boolean): Se este grupo é visível em formulários de cadastro públicos (Ex: "Selecione seu perfil"). Geralmente `false` para grupos internos.

---

### SQL Definitive (PostgreSQL)

```sql
CREATE TABLE customer_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES shops(id),

    -- Identidade
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50), -- Identificador para API/Código (ex: 'VIP_LEVEL_1')
    description TEXT,

    -- Automação (Smart Groups)
    type VARCHAR(20) DEFAULT 'manual', -- manual, dynamic
    rules JSONB DEFAULT '[]',
    -- Ex: [{"metric": "lifetime_value", "operator": "gt", "value": 1000}]

    -- Impacto Econômico
    default_discount_percentage DECIMAL(5, 2) DEFAULT 0, -- Ex: 5.00 para 5% OFF
    price_list_id UUID, -- Referência opcional a uma tabela de preços específica
    tax_class VARCHAR(50), -- Referência para cálculo de impostos (Ex: 'exempt')

    -- Controle de Acesso e Regras
    allowed_payment_methods TEXT[], -- Array: ['credit_card', 'invoice_net30']
    min_order_amount DECIMAL(15, 2) DEFAULT 0, -- B2B: "Só pode fechar pedido acima de R$ 500"

    -- Extensibilidade
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (shop_id, code)
);

-- Tabela de Ligação (Muitos-para-Muitos)
-- Um cliente pode pertencer a vários grupos? Em sistemas generalistas, SIM.
-- Ex: Ele pode ser "VIP" (Marketing) E "Isento de ICMS" (Fiscal).
CREATE TABLE customer_group_memberships (
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    customer_group_id UUID REFERENCES customer_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (customer_id, customer_group_id)
);

```

---

### Casos de Uso Reais (Por que essa estrutura?)

#### 1. O Cenário "Bad Payer" (Mau Pagador)

- **Nome:** "Bloqueio de Crédito".
- **Automation:** Manual (Financeiro coloca o cliente lá).
- **Regra (`allowed_payment_methods`):** `['pix', 'credit_card']`.
- **Resultado:** Removemos a opção "Boleto Faturado" para este grupo específico. O cliente ainda pode comprar, mas só pagando à vista.

#### 2. O Cenário "Atacadista" (B2B)

- **Nome:** "Revenda Gold".
- **Min Order Amount:** 1000.00.
- **Price List:** Aponta para a Tabela Gold (preços 40% menores).
- **Resultado:** Se o cliente tentar fechar um carrinho de R$ 50,00, o sistema bloqueia: "Membros Gold precisam comprar no mínimo R$ 1.000,00".

#### 3. O Cenário "VIP Automático" (Fidelidade)

- **Type:** `dynamic`.
- **Rules:** `total_spent > 2000` NOS ÚLTIMOS `90 dias`.
- **Default Discount:** 5%.
- **Resultado:** O sistema roda um job noturno, recalcula os gastos e promove os clientes automaticamente. Se pararem de comprar, são rebaixados automaticamente.

### Diferença Crítica: Groups vs Tags

Você pode perguntar: _"Por que não usar apenas as `tags` da tabela de clientes?"_

- **Tags** são informativas e livres (Ex: "cliente chato", "veio do instagram"). Elas não têm lógica de negócio atrelada.
- **Groups** são estruturais. Eles alteram o comportamento do sistema (preço, imposto, pagamento).

Em um sistema Open Source robusto, use **Grupos** para controlar regras e **Tags** para filtrar listas.
