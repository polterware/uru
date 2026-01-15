```sql
CREATE TABLE products (
    -- Identidade
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('physical', 'digital', 'service', 'bundle')),
    status VARCHAR(20) DEFAULT 'draft',
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    gtin_ean VARCHAR(20),

    -- Financeiro
    price DECIMAL(10, 2) NOT NULL,
    promotional_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    currency CHAR(3) DEFAULT 'BRL',
    tax_ncm VARCHAR(20), -- Fiscal

    -- Logística
    is_shippable BOOLEAN DEFAULT TRUE,
    weight_g INTEGER DEFAULT 0,
    width_mm INTEGER DEFAULT 0,
    height_mm INTEGER DEFAULT 0,
    depth_mm INTEGER DEFAULT 0,

    -- Dados Flexíveis (A chave do generalismo)
    attributes JSONB, -- Ex: {"cor": "Vermelho", "voltagem": "220v"}
    metadata JSONB,   -- Ex: {"link_download": "..."}

    -- Organização
    category_id UUID,
    brand_id UUID,
    parent_id UUID REFERENCES products(id), -- Para variações (SKUs filhos)

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

```

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

```

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

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificadores
    order_number BIGINT GENERATED BY DEFAULT AS IDENTITY, -- Sequencial simples para humanos (#1001)
    idempotency_key VARCHAR(100) UNIQUE, -- Previne duplicação técnica (clique duplo no botão comprar)
    channel VARCHAR(50) DEFAULT 'web', -- De onde veio

    -- Relacionamentos
    shop_id UUID, -- Para sistemas Multi-tenant/Marketplace
    customer_id UUID, -- Link "vivo" (pode ser null se Guest)

    -- Máquina de Estados (O Triângulo de Status)
    status VARCHAR(20) DEFAULT 'open', -- open, archived, cancelled
    payment_status VARCHAR(20) DEFAULT 'unpaid', -- unpaid, authorized, paid, refunded, voided
    fulfillment_status VARCHAR(20) DEFAULT 'unfulfilled', -- unfulfilled, partial, fulfilled, restocked

    -- O Dinheiro (Snapshot Imutável)
    currency CHAR(3) DEFAULT 'BRL',
    subtotal_price DECIMAL(15, 2) NOT NULL, -- Soma dos itens
    total_discounts DECIMAL(15, 2) DEFAULT 0,
    total_tax DECIMAL(15, 2) DEFAULT 0,
    total_shipping DECIMAL(15, 2) DEFAULT 0,
    total_tip DECIMAL(15, 2) DEFAULT 0, -- Gorjeta (Comum em Food Service)
    total_price DECIMAL(15, 2) NOT NULL, -- O valor que saiu do bolso do cliente

    -- Dados Ricos (JSONB)
    tax_lines JSONB DEFAULT '[]', -- Detalhe dos impostos
    discount_codes JSONB DEFAULT '[]', -- Cupons usados

    -- Extensibilidade
    note TEXT, -- Campo simples de observação
    tags TEXT[], -- Array de strings para filtros rápidos
    custom_attributes JSONB DEFAULT '[]', -- Campos extras do cliente (KV Pair)
    metadata JSONB DEFAULT '{}', -- Campos técnicos ocultos

    -- Snapshots de Segurança
    customer_snapshot JSONB NOT NULL, -- Dados do cliente congelados
    billing_address JSONB, -- Endereço fiscal congelado
    shipping_address JSONB, -- Endereço entrega congelado

    -- Rastreabilidade Temporal
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    cancelled_at TIMESTAMP,
    closed_at TIMESTAMP -- Quando o pedido foi arquivado
);

```

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

```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tipo Fundamental
    type VARCHAR(20) NOT NULL DEFAULT 'individual',
    -- 'individual' (B2C), 'business' (B2B), 'government', 'organization'

    -- Identidade Base
    email VARCHAR(255) UNIQUE, -- Chave principal de contato (pode ser NULL para clientes de loja física anônimos)
    phone VARCHAR(50), -- Com DDI (+55...)

    -- O Camaleão (Nomes)
    first_name VARCHAR(100), -- "João" ou NULL se for empresa
    last_name VARCHAR(100),  -- "Silva" ou NULL se for empresa
    company_name VARCHAR(255), -- "Tech Solutions Ltda" ou NULL se for pessoa

    -- Documentos (O pesadelo global resolvido)
    tax_id VARCHAR(50), -- O número em si (CPF, CNPJ, SSN, VAT ID)
    tax_id_type VARCHAR(20), -- O tipo (br_cpf, br_cnpj, us_ssn, eu_vat)
    state_tax_id VARCHAR(50), -- Inscrição Estadual (Para B2B)

    -- Gestão de Conta
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, blocked, guest (não tem login)
    currency CHAR(3) DEFAULT 'BRL', -- Moeda preferida
    language CHAR(2) DEFAULT 'pt', -- Idioma preferido (en, es)

    -- Marketing e Segmentação
    tags TEXT[], -- ["vip", "bad_payer", "wholesale", "influencer"]
    accepts_marketing BOOLEAN DEFAULT FALSE,

    -- Grupos e Segmentos
    customer_group_id UUID, -- Link para tabela de grupos (Ex: "Revendedores Ouro" que têm 10% off)

    -- Métricas Acumuladas (Cache para performance)
    total_spent DECIMAL(15, 2) DEFAULT 0, -- LTV (Lifetime Value)
    orders_count INTEGER DEFAULT 0,
    last_order_at TIMESTAMP,

    -- Extensibilidade
    notes TEXT, -- "Cliente chato, cuidado", "Prefere ser chamado de Dr."
    metadata JSONB, -- IDs externos, integração ERP
    custom_attributes JSONB, -- "Data de Aniversário", "Nome do Cão", "Time de Futebol"

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

```

```sql
CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),

    -- Rótulo
    type VARCHAR(20) DEFAULT 'shipping', -- shipping, billing, both
    is_default BOOLEAN DEFAULT FALSE,

    -- Dados
    first_name VARCHAR(100), -- Quem recebe pode ser diferente do dono da conta
    last_name VARCHAR(100),
    company VARCHAR(100),

    address1 VARCHAR(255), -- Rua, Número
    address2 VARCHAR(255), -- Complemento
    city VARCHAR(100),
    province_code VARCHAR(10), -- SP, RJ, CA, NY
    country_code CHAR(2), -- BR, US
    postal_code VARCHAR(20), -- CEP
    phone VARCHAR(50), -- Telefone específico deste local

    metadata JSONB -- "Portão azul", "Deixar na portaria"
);

```

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificador Principal (Login Handle)
    email VARCHAR(255) UNIQUE, -- Essencial para recuperação de conta
    phone VARCHAR(50) UNIQUE, -- Para sistemas Mobile-First (WhatsApp Login)

    -- Segurança de Senha (Local Strategy)
    password_hash VARCHAR(255), -- NUNCA senha pura. Use Argon2 ou Bcrypt. Pode ser NULL se usar apenas Google/Social.
    security_stamp VARCHAR(100), -- Um UUID que muda toda vez que a senha muda. Invalida tokens antigos instantaneamente.

    -- Segurança de Acesso (Lockout Mechanism)
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    failed_login_attempts INTEGER DEFAULT 0, -- Contador para Brute Force
    lockout_end_at TIMESTAMP, -- "Sua conta está bloqueada por 30 min"

    -- Autenticação Multifator (MFA/2FA)
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(100), -- O segredo do Google Authenticator/Authy (TOTP)
    mfa_backup_codes TEXT[], -- Códigos de recuperação de emergência

    -- Auditoria
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(45), -- IPv4 ou IPv6
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- O Elo com o Mundo Real (Polimorfismo Lógico)
    -- Não usamos FK rígida aqui para manter a tabela pura, mas logicamente conecta-se a perfis
    profile_type VARCHAR(20), -- 'customer', 'staff', 'system'
    status VARCHAR(20) DEFAULT 'active' -- active, suspended, banned, pending_deletion
);

```

```sql
CREATE TABLE user_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Quem é o provedor?
    provider VARCHAR(50) NOT NULL,
    -- 'google', 'facebook', 'apple', 'github', 'microsoft_azure_ad', 'saml_enterprise'

    -- Quem é o usuário lá?
    provider_user_id VARCHAR(255) NOT NULL, -- O ID numérico/string que o Google manda (sub)

    -- Dados de Conexão (Para renovar acesso)
    access_token TEXT, -- O token para chamar APIs do Google em nome do user (Opcional)
    refresh_token TEXT, -- Para pegar novos tokens
    expires_at TIMESTAMP,

    profile_data JSONB, -- Snapshot do perfil que veio do Google (Avatar, Locale)

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (provider, provider_user_id) -- Garante que um ID do Google só pertença a um user
);

```

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Este ID vai dentro do Refresh Token (JTI)
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Impressão Digital do Dispositivo
    user_agent TEXT, -- "Chrome on Windows 10"
    ip_address VARCHAR(45),
    device_type VARCHAR(20), -- 'mobile', 'desktop', 'tablet'
    location VARCHAR(100), -- "São Paulo, BR" (GeoIP)

    -- Validade
    token_hash VARCHAR(255), -- Hash do Refresh Token entregue ao user (segurança extra)
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP, -- Se preenchido, o token foi "morto" manualmente (Logout forçado)

    created_at TIMESTAMP DEFAULT NOW(),
    last_active_at TIMESTAMP -- Para saber "Visto por último há 2 dias"
);

```

```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY,
    name VARCHAR(50) UNIQUE, -- 'admin', 'editor', 'customer_support'
    permissions TEXT[] -- ['product:create', 'order:refund', 'user:view']
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id),
    role_id UUID REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

```

```sql
CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identidade Visual do Protocolo
    protocol_number VARCHAR(50) UNIQUE NOT NULL, -- Ex: 2024-XA92

    -- Classificação
    type VARCHAR(50) DEFAULT 'general', -- support, sales, partnership
    status VARCHAR(50) DEFAULT 'new', -- new, open, pending, solved, closed, spam
    priority VARCHAR(20) DEFAULT 'normal',

    -- Origem
    source VARCHAR(50) DEFAULT 'web_form', -- email, whatsapp, phone

    -- Solicitante (Híbrido: Vínculo ou Snapshot)
    customer_id UUID REFERENCES customers(id), -- Opcional
    requester_data JSONB NOT NULL,
    -- Ex: {"name": "João", "email": "j@test.com", "phone": "1199..."}

    -- Responsabilidade
    department VARCHAR(50), -- 'sales', 'tech_support'
    assigned_staff_id UUID REFERENCES users(id),

    -- Assunto
    subject VARCHAR(255),

    -- Links Inteligentes
    related_order_id UUID, -- Se for dúvida sobre pedido
    related_product_id UUID, -- Se for dúvida sobre produto
    metadata JSONB, -- Contexto técnico (URL onde estava, Browser, IP)

    -- Prazos (SLA)
    sla_due_at TIMESTAMP, -- Quando isso DEVE ser respondido
    resolved_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE inquiry_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID NOT NULL REFERENCES inquiries(id),

    -- Quem falou?
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('customer', 'staff', 'bot')),
    sender_id UUID, -- Pode ser null se for cliente não cadastrado

    -- O que falou?
    body TEXT,
    is_internal_note BOOLEAN DEFAULT FALSE, -- O cliente não vê isso

    -- Arquivos
    attachments JSONB DEFAULT '[]',

    -- Metadados de Mensageria
    external_id VARCHAR(255), -- ID do email no Gmail ou MessageID do Twilio
    read_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW()
);

```

## 11. Sincronização (Sync)

A arquitetura do sistema segue um modelo **Hybrid Cloud + Local Nodes** (baseado em WatermelonDB), onde o desktop opera como um "Mother Node" com banco de dados local (SQLite) que sincroniza totalmente com a nuvem (Supabase/PostgreSQL).

### Estrutura Base

Para suportar o protocolo de consistência eventual, **todas as tabelas** utilizam as seguintes colunas de controle:

```sql
-- Exemplo de colunas obrigatórias para Sync
ALTER TABLE table_name ADD COLUMN _status VARCHAR(20) DEFAULT 'created'; -- created, updated, deleted, synced
ALTER TABLE table_name ADD COLUMN _changed_at TIMESTAMP DEFAULT NOW(); -- Hash ou Timestamp de controle
ALTER TABLE table_name ADD COLUMN updated_at TIMESTAMP DEFAULT NOW(); -- Âncora LWW
```

### Mecanismo de Funcionamento

1.  **Offline-First**: Toda escrita (INSERT/UPDATE) ocorre primeiro no SQLite local, marcando `_status = 'created'` ou `'updated'`.
2.  **Push (Upload)**: Um worker em segundo plano envia registros "sujos" (`_status != 'synced'`) para o Supabase via API.
3.  **Pull (Download)**: O sistema solicita ao Supabase registros onde `updated_at > last_pulled_at`.
4.  **Resolução de Conflitos**: Estratégia **Last Write Wins (LWW)** baseada no timestamp `updated_at`.

```sql
CREATE TABLE shops (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identidade
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255), -- Para sair nas Notas Fiscais/Relatórios
    slug VARCHAR(60) UNIQUE NOT NULL,
    is_default BOOLEAN DEFAULT FALSE, -- A loja "principal" da instalação

    -- Controle Operacional
    status VARCHAR(20) DEFAULT 'active', -- active, maintenance (página de erro amigável), archived

    -- Módulos (O usuário liga/desliga o que quer usar)
    features_config JSONB DEFAULT '{
        "use_inventory": true,
        "use_pos": false,
        "use_b2b": false
    }',

    -- Configurações Técnicas (Vitais para Self-Hosted)
    mail_config JSONB, -- Credenciais de SMTP desta loja
    storage_config JSONB, -- Credenciais S3/Minio ou Local Path

    -- Preferências de Negócio
    settings JSONB DEFAULT '{}', -- Comportamento do checkout, impostos, etc.
    branding JSONB DEFAULT '{}', -- Logos e Cores

    -- Localização
    currency CHAR(3) DEFAULT 'BRL',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    locale VARCHAR(10) DEFAULT 'pt-BR',

    -- Metadados
    owner_id UUID, -- Quem instalou/criou
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()

);

```

```sql
CREATE TABLE brands (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
shop_id UUID NOT NULL REFERENCES shops(id), -- Contexto da loja

    -- Identidade Base
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL, -- Indexado para buscas rápidas na URL

    -- Visual
    logo_url TEXT, -- URL da imagem do logo (SVG/PNG)
    banner_url TEXT, -- URL da imagem de capa da página da marca

    -- Conteúdo
    description TEXT, -- Texto simples (SEO description)
    rich_description TEXT, -- HTML/Markdown longo
    website_url VARCHAR(255), -- Site oficial

    -- Controle
    status VARCHAR(20) DEFAULT 'active', -- active, inactive
    is_featured BOOLEAN DEFAULT FALSE, -- Aparece na home?
    sort_order INTEGER DEFAULT 0, -- Para ordenar manualmente quem aparece primeiro

    -- SEO Avançado (Opcional, mas recomendado)
    seo_title VARCHAR(255), -- Title Tag específica
    seo_keywords TEXT[], -- Palavras-chave

    -- Extensibilidade
    metadata JSONB DEFAULT '{}',
    -- Ex: {
    --   "warranty_policy_url": "...",
    --   "support_phone": "0800...",
    --   "social": {"instagram": "..."}
    -- }

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Garante que não existam duas "Adidas" na mesma loja
    UNIQUE (shop_id, slug)

);
```

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES shops(id),

    -- O Segredo da Hierarquia (Adjacency List)
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,

    -- Identidade
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,

    -- Visual
    image_url TEXT, -- Ícone/Thumb
    banner_url TEXT, -- Capa Grande

    -- Lógica de Preenchimento
    type VARCHAR(20) DEFAULT 'manual', -- manual, automated
    rules JSONB DEFAULT '[]',
    -- Ex: [{"field": "price", "relation": "less_than", "condition": "50"}]

    -- Controle
    is_visible BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,

    -- SEO
    seo_title VARCHAR(255),
    seo_description TEXT,

    -- Metadados e Frontend
    template_suffix VARCHAR(50), -- 'sale-landing', 'grid-minimal'
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (shop_id, slug)
);

-- Tabela de Ligação (Apenas para categorias MANUAIS)
-- Se a categoria for 'automated', você não usa essa tabela, usa uma query dinâmica.
CREATE TABLE product_categories (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0, -- Ordem do produto DENTRO da categoria
    PRIMARY KEY (product_id, category_id)
);
```

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
