## 4. Pagamentos (Payments)

Para elevar o módulo de **Payments** ao nível "Enterprise/Global", precisamos entender que um pagamento não é um evento atômico (pagou/não pagou). É um **ciclo de vida** complexo que envolve autorização, captura, liquidação (settlement), fraude e conciliação bancária.

Um sistema generalista precisa suportar desde o **"Dinheiro na mão do caixa"** até **"Cartão de Crédito em 12x com juros"**, **"Pix"**, **"Criptomoedas"** e **"Buy Now Pay Later (Klarna/Affirm)"**.

Aqui está a modelagem definitiva para pagamentos:

---

### 1. A Tabela Mestre: `payments`

Esta tabela registra a intenção e a execução da movimentação financeira de entrada.

- `id` (UUID): Identificador único do pagamento.
- `transaction_id` (FK): A qual venda/pedido isso pertence.
- _Nota:_ Uma transação pode ter múltiplos pagamentos (Ex: Pagar R$ 50 no crédito e R$ 20 no Pix).

- **Valores e Moeda:**
- `amount` (Decimal): O valor total desta tentativa de pagamento.
- `currency` (String): ISO (BRL, USD). Vital para vendas internacionais.
- `exchange_rate` (Decimal): Se a loja vende em BRL mas recebe em USD, aqui fica a taxa de conversão do dia.

- **O Mecanismo (Quem processa):**
- `provider` (String): O processador (Ex: `stripe`, `pagar.me`, `adyen`, `mercadopago`, `manual_cash`).
- `method` (Enum): A forma de pagamento.
- Values: `credit_card`, `debit_card`, `pix`, `boleto`, `voucher`, `bank_transfer`, `cash`, `wallet`, `crypto`.

- **Parcelamento (A jabuticaba brasileira e tendência global):**
- `installments` (Integer): Número de parcelas (1 a 24).
- `installment_amount` (Decimal): Valor de cada parcela.
- `interest_rate` (Decimal): Taxa de juros aplicada (se houver).

- **Ciclo de Vida (State Machine):**
- `status` (Enum):
- `pending`: Aguardando (ex: boleto gerado, pix não pago).
- `authorized`: O banco disse "tem saldo", mas o dinheiro não saiu (Pre-auth).
- `captured`: O dinheiro foi efetivamente cobrado.
- `declined`: Recusado pelo banco/fraude.
- `voided`: Cancelado antes da captura (desfeito).
- `refunded`: Devolvido total ou parcialmente.
- `charged_back`: O cliente contestou a compra no banco (o pesadelo do lojista).

- **Identificadores Externos (Rastreabilidade):**
- `provider_transaction_id` (String): O ID único lá no Stripe/Pagar.me (Ex: `ch_3Lk...`). Essencial para fazer estorno via API depois.
- `authorization_code` (String): O código que aparece na filipeta da maquininha (NSU/Auth Code).

- **Dados Flexíveis (Onde mora o detalhe):**
- `payment_details` (JSONB): Detalhes específicos do método que não merecem coluna.
- _Cartão:_ `{"brand": "visa", "last4": "4242", "exp_month": 12, "exp_year": 2025, "holder_name": "JOAO SILVA"}`
- _Pix:_ `{"qr_code": "...", "copy_paste": "...", "expiration": "2024-..."}`
- _Boleto:_ `{"barcode": "...", "url_pdf": "..."}`

- `metadata` (JSONB): Dados crus de retorno do gateway (para debug).

- **Segurança e Datas:**
- `risk_score` (Integer): Pontuação de fraude (0-100) retornada pelo sistema antifraude (ClearSale, Radar).
- `authorized_at` (Timestamp): Quando o banco aprovou.
- `captured_at` (Timestamp): Quando a loja confirmou a captura.

---

### 2. A Tabela de Estornos: `refunds`

Nunca, jamais edite a tabela `payments` para mudar o valor para zero ou negativo. Contabilmente isso é um erro. Um estorno é uma transação nova e oposta.

- `id` (UUID): PK.
- `payment_id` (FK): Qual pagamento original está sendo devolvido.
- `amount` (Decimal): Quanto foi devolvido. (Permite estorno parcial: pagou 100, devolveu 20).
- `reason` (String): "Cliente desistiu", "Produto defeituoso", "Fraude".
- `status` (Enum): `pending`, `succeeded`, `failed`.
- `provider_refund_id` (String): ID do estorno no gateway (Ex: `re_3Lk...`).
- `created_at` (Timestamp): Data da devolução.

---

### Exemplo de SQL (PostgreSQL)

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id),

    -- O Dinheiro
    amount DECIMAL(15, 2) NOT NULL,
    currency CHAR(3) DEFAULT 'BRL',

    -- O Método
    provider VARCHAR(50) NOT NULL, -- 'stripe', 'adyen', 'pos_stone'
    method VARCHAR(50) NOT NULL, -- 'credit_card', 'pix'

    -- Parcelamento
    installments SMALLINT DEFAULT 1,

    -- Estados
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    -- pending, authorized, captured, declined, voided, refunded, charged_back

    -- Integração Técnica
    provider_transaction_id VARCHAR(255), -- ID da transação no Gateway
    authorization_code VARCHAR(100), -- NSU ou Auth Code

    -- Detalhes ricos (Generalista)
    payment_details JSONB,
    -- Ex Card: {"last4": "4242", "brand": "mastercard"}
    -- Ex Pix: {"qr_code_url": "..."}

    -- Auditoria de Fraude
    risk_level VARCHAR(20), -- 'low', 'medium', 'high', 'critical'

    -- Timestamps Críticos
    created_at TIMESTAMP DEFAULT NOW(),
    authorized_at TIMESTAMP,
    captured_at TIMESTAMP,
    voided_at TIMESTAMP
);

CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id),

    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, succeeded, failed
    reason VARCHAR(255),

    provider_refund_id VARCHAR(255),

    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID -- ID do funcionário que autorizou o estorno
);

```

### Casos de Uso Avançados Resolvidos:

#### 1. Autorização e Captura Tardia (Posto de Gasolina / Hotel)

- **Cenário:** Você passa o cartão no hotel no check-in, eles bloqueiam R$ 1.000 (Caução). No check-out, você gastou apenas R$ 800.
- **Fluxo no Banco:**

1. Cria `payment` com `status = 'authorized'`, `amount = 1000`.
2. No check-out, o sistema envia comando de captura para o gateway de apenas R$ 800.
3. Atualiza `payment`: `status = 'captured'`, `amount = 800`, `captured_at = NOW()`. O banco libera os R$ 200 restantes para o cliente.

#### 2. Split de Pagamento (Entrada + Parcelado)

- **Cenário:** Compra de R$ 2.000. Cliente dá R$ 500 no Pix e parcela R$ 1.500 em 10x.
- **Registro:**
- Registro 1 na tabela `payments`: Método `pix`, Valor `500`, Status `captured`.
- Registro 2 na tabela `payments`: Método `credit_card`, Valor `1500`, Installments `10`, Status `captured`.
- A aplicação soma os `payments` com status `captured` vinculados ao `transaction_id`. Se soma == total do pedido, libera o pedido.

#### 3. Chargeback (O Cliente Ligou no Banco e Cancelou)

- Este é um evento assíncrono. O gateway avisa sua API via Webhook dias depois da venda.
- **Ação:** O sistema busca o `payment` pelo `provider_transaction_id`.
- Atualiza `status` para `charged_back`.
- Automaticamente gatilha um alerta para o time financeiro e bloqueia a conta do usuário se necessário.

#### 4. Conciliação (Conferir se o dinheiro caiu)

- Você adicionaria uma tabela extra ou colunas: `settlement_date` (Data prevista do depósito na conta da empresa) e `settlement_batch_id`.
- Isso permite saber: "Vendi hoje, mas o dinheiro desse cartão só cai na conta dia 15/02 já descontada a taxa de 3%".

### O Poder do JSONB `payment_details`

É aqui que você evita criar 50 colunas nulas.

- **Se for Pix:** Guarda o Hash `copy_paste`.
- **Se for Boleto:** Guarda a `linha_digitavel` e a `vencimento`.
- **Se for Cripto:** Guarda a `hash_transaction` da Blockchain e a `wallet_address` de origem.
- ## **Se for Dinheiro:** Pode ficar vazio ou guardar `{"troco_para": 100}`.
