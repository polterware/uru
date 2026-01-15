## 7. Entregas (Shipments)

Para o **Shipment** (Envio/Fulfillment), o nível "super generalista" exige que o sistema suporte desde um motoboy entregando uma pizza em 30 minutos até um container vindo da China que leva 60 dias e troca de transportadora 3 vezes.

A regra de ouro aqui é: **O Shipment é a verdade física.** O `Order` é o que o cliente _queria_, o `Shipment` é o que você efetivamente _mandou_ (que pode ser menos, dividido ou substituído).

Aqui está a modelagem definitiva para Logística e Entregas:

---

### 1. Conceitos Fundamentais

Antes da tabela, entenda o que ela resolve:

1. **Split Shipment (Envio Dividido):** O cliente comprou Geladeira + Livro. A Geladeira sai do CD (Transportadora A). O Livro sai da Loja (Correios). São 2 Shipments para 1 Order.
2. **Multi-Modal:** O shipment pode ser uma caminhão (`truck`), um download (`digital`), ou uma retirada (`pickup_in_store`).
3. **Custo Real vs. Custo Cobrado:** O cliente pagou R$ 20 de frete no pedido. Mas, na hora de gerar a etiqueta, custou R$ 18,50 para a empresa. O Shipment guarda o custo _operacional_.

---

### 2. A Tabela Mestre: `shipments`

```sql
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Vínculos
    order_id UUID NOT NULL REFERENCES orders(id),
    location_id UUID REFERENCES locations(id), -- De onde saiu (CD, Loja, Fornecedor Dropshipping)

    -- Máquina de Estados Logística
    status VARCHAR(30) DEFAULT 'pending',
    -- pending: Aguardando separação
    -- ready_to_ship: Etiqueta gerada/Embalado
    -- shipped: Coletado pela transportadora (Saiu do prédio)
    -- in_transit: Em trânsito (Updates intermediários)
    -- out_for_delivery: Saiu para entrega ao destinatário
    -- delivered: Entregue
    -- failed_attempt: Destinatário ausente
    -- exception: Extravio/Roubo/Avaria
    -- returned_to_sender: Devolvido

    -- Quem transporta (Carrier)
    carrier_company VARCHAR(100), -- "Correios", "FedEx", "Uber Flash", "Loggi"
    carrier_service VARCHAR(100), -- "Sedex 10", "Standard Ground", "Moto Express"
    tracking_number VARCHAR(100), -- O código de rastreio principal
    tracking_url TEXT, -- Link direto para rastreio

    -- Dimensões Reais do Pacote (Auditabilidade)
    weight_g INTEGER, -- Peso final da caixa fechada (pode divergir da soma dos produtos)
    height_mm INTEGER,
    width_mm INTEGER,
    depth_mm INTEGER,
    package_type VARCHAR(50), -- "box", "envelope", "pallet", "tube"

    -- Documentação e Etiquetas
    shipping_label_url TEXT, -- Link para o PDF/ZPL da etiqueta gerada
    invoice_url TEXT, -- Link da Nota Fiscal de Transporte (CTe ou NFe)
    invoice_key VARCHAR(100), -- Chave de acesso da NFe (Brasil)

    -- Custos Operacionais (Segredo Industrial)
    cost_amount DECIMAL(15, 2), -- Quanto a empresa pagou para a transportadora
    insurance_amount DECIMAL(15, 2), -- Valor segurado

    -- Datas Críticas
    estimated_delivery_at TIMESTAMP, -- O SLA prometido
    shipped_at TIMESTAMP, -- Quando a transportadora bipou
    delivered_at TIMESTAMP, -- O sucesso

    -- Extensibilidade
    metadata JSONB, -- Ex: {"locker_code": "1234"} para armários inteligentes
    customs_info JSONB, -- Ex: {"hs_code": "...", "country_of_origin": "BR"} para exportação

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

```

### 3. O Conteúdo do Pacote: `shipment_items`

Não basta dizer que o pacote saiu. Você precisa dizer **exatamente o que está dentro dele**.
Se o cliente comprou 5 cadeiras, mas só cabem 2 por caixa, você terá 3 Shipments. O `shipment_items` faz a ponte matemática.

```sql
CREATE TABLE shipment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id),

    -- Conexão com o Pedido
    order_item_id UUID NOT NULL, -- Referência à linha original do pedido

    -- O que foi enviado NESTE pacote
    quantity INTEGER NOT NULL,

    -- Controle de Qualidade (Opcional mas Enterprise)
    batch_number VARCHAR(100), -- Qual lote exato foi pego? (Rastreabilidade de validade)
    serial_numbers TEXT[] -- Array de Seriais se for eletrônico (Ex: [IMEI1, IMEI2])
);

```

---

### 4. Casos de Uso Generalistas Explicados

#### A. O "Digital Fulfillment" (Ebook/Curso/Gift Card)

- **Carrier:** `email` ou `system`.
- **Tracking Number:** Nulo ou um ID de transação interna.
- **Status:** Vai direto de `pending` para `delivered` em segundos.
- **Metadata:** Guarda o link de acesso ou o código do Gift Card (`{"redemption_code": "XYZ-123"}`).

#### B. "Click & Collect" / "Retira na Loja"

- **Carrier:** `customer` (O cliente é o transportador).
- **Location ID:** A loja onde o produto está esperando.
- **Status:**
- `ready_to_ship` = "Pronto para retirada" (Cliente recebe notificação).
- `delivered` = "Cliente retirou no balcão".

- **Metadata:** `{"pickup_person": "Nome da Esposa", "id_document": "RG..."}`.

#### C. Dropshipping (Venda sem Estoque)

- **Location ID:** ID do Fornecedor na China/Parceiro.
- **Tracking Number:** Código internacional (LP...CN).
- **Custo:** O `cost_amount` é quanto o fornecedor cobrou de frete de você.
- **Customs Info:** Preenchido com dados de importação.

#### D. Frota Própria (Caminhão da Empresa)

- **Carrier:** `own_fleet`.
- **Tracking:** Pode ser a placa do caminhão ou ID da rota.
- **Metadata:** `{"driver_name": "Seu Zé", "vehicle_plate": "ABC-1234"}`.

### 5. O Fluxo de Tracking (A tabela oculta `shipment_events`)

Para sistemas muito avançados (que mostram a linha do tempo "Saiu de Cajamar" -> "Chegou em Curitiba"), você não guarda isso apenas no `status`. Você tem uma tabela de eventos (History Log).

```sql
CREATE TABLE shipment_events (
    id UUID PRIMARY KEY,
    shipment_id UUID REFERENCES shipments(id),
    status VARCHAR(50), -- status normalizado
    description TEXT, -- "Objeto encaminhado para Unidade de Tratamento"
    location VARCHAR(255), -- "Curitiba / PR"
    happened_at TIMESTAMP, -- Data real do evento
    raw_data JSONB -- O JSON bruto que a API dos Correios/FedEx devolveu
);

```

### Resumo da Arquitetura Logística

Com essa estrutura `shipments` + `shipment_items`:

1. Você sabe que o **Pedido #50** teve 3 pacotes.
2. Pacote 1 (Shipment A): Saiu da Loja SP, via Motoboy, entregue em 2h.
3. Pacote 2 (Shipment B): Saiu do CD ES, via Transportadora, entregue em 3 dias.
4. Pacote 3 (Shipment C): Digital (Manual PDF), via Email, entregue na hora.

## Tudo isso vivendo harmoniosamente na mesma tabela.
