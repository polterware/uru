## 5. Carrinho/Checkout

O **Checkout** é a entidade mais volátil e complexa do sistema. Diferente de um `Order` (que é um documento imutável de história), o `Checkout` é um "rascunho vivo".

O cliente adiciona itens, remove, muda o endereço, troca o cartão, aplica cupom, remove cupom.

Para um sistema generalista, o Checkout precisa resolver três dores principais:

1. **Persistência:** Começar no celular, terminar no desktop.
2. **Marketing:** Recuperação de Carrinho Abandonado.
3. **Performance:** Calcular impostos e fretes sem criar lixo no banco de dados principal.

### 1. Estrutura da Tabela: `checkouts`

A grande sacada aqui é usar **JSONB para os itens**.
_Por que?_ Porque em um carrinho, não precisamos de integridade referencial estrita (Foreign Keys) para cada item. Se você criar uma tabela filha `checkout_items`, você terá milhões de inserts/deletes inúteis. O JSON é mais rápido para leitura/escrita nesse cenário de "rascunho".

```sql
CREATE TABLE checkouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identidade e Acesso
    token VARCHAR(100) UNIQUE NOT NULL, -- Token público (na URL ou Cookie) para acesso sem login
    user_id UUID, -- Opcional. Se o usuário logar, vinculamos aqui.
    email VARCHAR(255), -- Vital! Preenchido assim que o usuário digita no input (antes de comprar)

    -- O Conteúdo (A "Cesta")
    -- Estrutura: [{"sku": "A", "qty": 1, "attributes": {...}}, ...]
    items JSONB DEFAULT '[]'::JSONB,

    -- O Contexto Logístico (Rascunho)
    shipping_address JSONB, -- O endereço sendo digitado (ainda não validado)
    billing_address JSONB,

    -- Seleções do Usuário
    shipping_line JSONB, -- Ex: {"code": "sedex", "price": 15.00, "carrier": "Correios"}
    applied_discount_codes JSONB, -- Array de cupons aplicados ["NATAL10"]

    -- O Financeiro (Calculado em tempo real)
    currency CHAR(3) DEFAULT 'BRL',
    subtotal_price DECIMAL(15, 2) DEFAULT 0, -- Soma dos produtos
    total_tax DECIMAL(15, 2) DEFAULT 0,
    total_shipping DECIMAL(15, 2) DEFAULT 0,
    total_discounts DECIMAL(15, 2) DEFAULT 0,
    total_price DECIMAL(15, 2) DEFAULT 0, -- O valor final a pagar

    -- Ciclo de Vida e Regras
    status VARCHAR(20) DEFAULT 'open',
    -- open (ativo), completed (virou pedido), expired (muito tempo inativo)

    reservation_expires_at TIMESTAMP, -- Se você "segura" o estoque (estilo ingresso de show)
    completed_at TIMESTAMP, -- Data que virou Order

    -- Metadados Técnicos
    metadata JSONB, -- Origem (Instagram, Google), User Agent, IP
    recovery_url VARCHAR(255), -- Link mágico para retomar o carrinho no e-mail

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW() -- Importante para limpar carrinhos velhos (Cron Job)
);

```

---

### 2. Aprofundando nos Campos Críticos

#### A. O Campo `items` (JSONB)

Em vez de uma tabela separada, guardamos o estado atual dos itens aqui. Isso permite flexibilidade total.
Exemplo de conteúdo:

```json
[
  {
    "product_id": "uuid...",
    "variant_id": "uuid...",
    "sku": "TSHIRT-BLK-M",
    "quantity": 2,
    "unit_price": 50.0,
    "properties": {
      "custom_text": "Parabéns João",
      "gift_wrap": true
    }
  }
]
```

> **Nota:** O preço aqui é um "snapshot temporário". Se o administrador mudar o preço do produto no banco, o checkout deve ser recalculado quando o usuário der "refresh", a menos que você tenha uma regra de "garantia de preço".

#### B. Recuperação de Carrinho (`email` + `recovery_url`)

A regra de ouro do e-commerce: **Capture o e-mail primeiro.**
Se o usuário digitar o e-mail e fechar a aba, você tem um lead.

- `email`: Salve via AJAX no evento `onBlur` do campo de input.
- `recovery_url`: Um link como `loja.com/checkout?token=xyz123`. Enviado no e-mail "Você esqueceu algo?".

#### C. Reserva de Estoque (`reservation_expires_at`)

Para sistemas de alta demanda (ingressos, sneakers limitados), você precisa reservar o item no momento do checkout, não do pagamento.

- Ao adicionar ao carrinho, o sistema define `reservation_expires_at = NOW() + 15 minutes`.
- O sistema de estoque considera essa quantidade como `quantity_reserved` até o tempo expirar.

---

### 3. O Fluxo: Do Checkout ao Order

A transição de Checkout para Order é o momento mais crítico da arquitetura. É uma "transfusão" de dados.

1. **Gatilho:** Usuário clica em "Finalizar Compra" e o pagamento é aprovado (ou boleto gerado).
2. **Validação:**

- O estoque ainda existe?
- O preço total (`total_price`) bate com a soma dos itens atuais? (Evita fraude de injeção de HTML).

3. **Conversão (Transaction DB):**

- Cria-se o registro na tabela `orders`.
- Cria-se registros na tabela `order_items` (agora sim, relacional e rígido) baseados no JSON `items` do checkout.
- Cria-se o registro em `transactions`.

4. **Encerramento:**

- Atualiza `checkouts`: `status = 'completed'`, `completed_at = NOW()`.
- Apaga o cookie do navegador ou gera um novo token limpo.

### 4. Por que separar Checkout Address de User Address?

Você deve ter notado `shipping_address` como JSON no checkout.

- **Cenário:** O usuário quer mandar um presente para a tia que mora no Acre.
- Ele não quer, necessariamente, adicionar esse endereço no "Livro de Endereços" permanente do perfil dele.
- Ele digita no checkout. O sistema salva o JSON no `checkout`.
- Se a compra for efetivada, esse JSON é copiado para o `order`.
- O cadastro do usuário (`user_addresses`) permanece limpo, contendo apenas os endereços principais dele.

### 5. Lógica de "Merge" (A complexidade oculta)

O checkout precisa lidar com o "Visitante que faz Login".

1. Usuário anônimo adiciona 3 itens ao carrinho (Token A).
2. Usuário decide fazer Login.
3. O sistema descobre que ele já tinha um carrinho antigo "aberto" na conta dele (Token B) com 1 item.
4. **Ação de Merge:** O sistema deve pegar os itens do Token A, somar com os do Token B, atualizar o `user_id` do Token A e descartar o Token B.

## Essa tabela suporta essa lógica mantendo o histórico limpo via `updated_at`.
