-- Migração Inicial SQLite
-- Adaptada de DDL.md e ARCHITECTURE.md
-- Ordem ajustada para satisfazer Foreign Keys

-- 1. Lojas (Shops) - Base da hierarquia
CREATE TABLE IF NOT EXISTS shops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    legal_name TEXT,
    slug TEXT UNIQUE NOT NULL,
    is_default INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    features_config TEXT, -- JSONB
    mail_config TEXT, -- JSONB
    storage_config TEXT, -- JSONB
    settings TEXT DEFAULT '{}', -- JSONB
    branding TEXT DEFAULT '{}', -- JSONB
    currency TEXT DEFAULT 'BRL',
    timezone TEXT DEFAULT 'America/Sao_Paulo',
    locale TEXT DEFAULT 'pt-BR',
    owner_id TEXT,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Marcas (Depende de Shops)
CREATE TABLE IF NOT EXISTS brands (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL REFERENCES shops(id),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    logo_url TEXT,
    banner_url TEXT,
    description TEXT,
    rich_description TEXT,
    website_url TEXT,
    status TEXT DEFAULT 'active',
    is_featured INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    seo_title TEXT,
    seo_keywords TEXT, -- TEXT[]
    metadata TEXT DEFAULT '{}', -- JSONB
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (shop_id, slug)
);

-- 3. Categorias (Depende de Shops)
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL REFERENCES shops(id),
    parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    banner_url TEXT,
    type TEXT DEFAULT 'manual',
    rules TEXT DEFAULT '[]', -- JSONB
    is_visible INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    template_suffix TEXT,
    metadata TEXT DEFAULT '{}', -- JSONB
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (shop_id, slug)
);

-- 4. Produtos (Depende de Brands, Categories)
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    sku TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('physical', 'digital', 'service', 'bundle')),
    status TEXT DEFAULT 'draft',
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    gtin_ean TEXT,
    price REAL NOT NULL,
    promotional_price REAL,
    cost_price REAL,
    currency TEXT DEFAULT 'BRL',
    tax_ncm TEXT,
    is_shippable INTEGER DEFAULT 1,
    weight_g INTEGER DEFAULT 0,
    width_mm INTEGER DEFAULT 0,
    height_mm INTEGER DEFAULT 0,
    depth_mm INTEGER DEFAULT 0,
    attributes TEXT, -- JSONB
    metadata TEXT,   -- JSONB
    category_id TEXT REFERENCES categories(id),
    brand_id TEXT REFERENCES brands(id),
    parent_id TEXT REFERENCES products(id),
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Product Categories (Join Table)
CREATE TABLE IF NOT EXISTS product_categories (
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id, category_id)
);

-- 6. Locais
CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('warehouse', 'store', 'transit', 'virtual')),
    is_sellable INTEGER DEFAULT 1,
    address_data TEXT -- JSONB
);

-- 7. Níveis de Estoque (Inventory Levels)
CREATE TABLE IF NOT EXISTS inventory_levels (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id),
    location_id TEXT NOT NULL REFERENCES locations(id),
    batch_number TEXT,
    serial_number TEXT,
    expiry_date DATE,
    quantity_on_hand REAL DEFAULT 0,
    quantity_reserved REAL DEFAULT 0,
    stock_status TEXT DEFAULT 'sellable' CHECK (stock_status IN ('sellable', 'damaged', 'quarantine', 'expired')),
    aisle_bin_slot TEXT,
    last_counted_at DATETIME,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (product_id, location_id, batch_number, serial_number, stock_status)
);

-- 8. Clientes
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'individual',
    email TEXT UNIQUE,
    phone TEXT,
    first_name TEXT,
    last_name TEXT,
    company_name TEXT,
    tax_id TEXT,
    tax_id_type TEXT,
    state_tax_id TEXT,
    status TEXT DEFAULT 'active',
    currency TEXT DEFAULT 'BRL',
    language TEXT DEFAULT 'pt',
    tags TEXT, -- TEXT[]
    accepts_marketing INTEGER DEFAULT 0,
    customer_group_id TEXT, -- FK definhada abaixo se necessario, ou circular
    total_spent REAL DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    last_order_at DATETIME,
    notes TEXT,
    metadata TEXT, -- JSONB
    custom_attributes TEXT, -- JSONB
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Grupos de Clientes (Customer Groups) - Depende de Shops
CREATE TABLE IF NOT EXISTS customer_groups (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL REFERENCES shops(id),
    name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    type TEXT DEFAULT 'manual',
    rules TEXT DEFAULT '[]', -- JSONB
    default_discount_percentage REAL DEFAULT 0,
    price_list_id TEXT,
    tax_class TEXT,
    allowed_payment_methods TEXT, -- TEXT[]
    min_order_amount REAL DEFAULT 0,
    metadata TEXT DEFAULT '{}', -- JSONB
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (shop_id, code)
);

-- 10. Membros de Grupos de Clientes
CREATE TABLE IF NOT EXISTS customer_group_memberships (
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    customer_group_id TEXT REFERENCES customer_groups(id) ON DELETE CASCADE,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (customer_id, customer_group_id)
);

-- 11. Endereços de Clientes
CREATE TABLE IF NOT EXISTS customer_addresses (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    type TEXT DEFAULT 'shipping',
    is_default INTEGER DEFAULT 0,
    first_name TEXT,
    last_name TEXT,
    company TEXT,
    address1 TEXT,
    address2 TEXT,
    city TEXT,
    province_code TEXT,
    country_code TEXT,
    postal_code TEXT,
    phone TEXT,
    metadata TEXT, -- JSONB
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 12. Usuários
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password_hash TEXT,
    security_stamp TEXT,
    is_email_verified INTEGER DEFAULT 0,
    is_phone_verified INTEGER DEFAULT 0,
    failed_login_attempts INTEGER DEFAULT 0,
    lockout_end_at DATETIME,
    mfa_enabled INTEGER DEFAULT 0,
    mfa_secret TEXT,
    mfa_backup_codes TEXT, -- TEXT[]
    last_login_at DATETIME,
    last_login_ip TEXT,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    profile_type TEXT,
    status TEXT DEFAULT 'active'
);

-- 13. Transações (Transactions)
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('sale', 'purchase', 'transfer', 'return', 'adjustment')),
    status TEXT NOT NULL DEFAULT 'draft',
    channel TEXT,
    customer_id TEXT REFERENCES customers(id),
    supplier_id TEXT, -- Sem tabela de suppliers definida no DDL, mas existe no conceito
    staff_id TEXT REFERENCES users(id),
    currency TEXT DEFAULT 'BRL',
    total_items REAL DEFAULT 0,
    total_shipping REAL DEFAULT 0,
    total_discount REAL DEFAULT 0,
    total_net REAL DEFAULT 0,
    shipping_method TEXT,
    shipping_address TEXT, -- JSONB
    billing_address TEXT,  -- JSONB
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 14. Itens da Transação
CREATE TABLE IF NOT EXISTS transaction_items (
    id TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL REFERENCES transactions(id),
    product_id TEXT REFERENCES products(id),
    sku_snapshot TEXT,
    name_snapshot TEXT,
    quantity REAL NOT NULL,
    unit_price REAL NOT NULL,
    unit_cost REAL,
    total_line REAL GENERATED ALWAYS AS (quantity * unit_price) STORED,
    attributes_snapshot TEXT, -- JSONB
    tax_details TEXT, -- JSONB
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 15. Movimentações de Estoque
CREATE TABLE IF NOT EXISTS inventory_movements (
    id TEXT PRIMARY KEY,
    transaction_id TEXT REFERENCES transactions(id),
    inventory_level_id TEXT REFERENCES inventory_levels(id),
    type TEXT CHECK (type IN ('in', 'out')),
    quantity REAL NOT NULL,
    previous_balance REAL,
    new_balance REAL,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 16. Pagamentos
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL REFERENCES transactions(id),
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'BRL',
    provider TEXT NOT NULL,
    method TEXT NOT NULL,
    installments INTEGER DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending',
    provider_transaction_id TEXT,
    authorization_code TEXT,
    payment_details TEXT, -- JSONB
    risk_level TEXT,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    authorized_at DATETIME,
    captured_at DATETIME,
    voided_at DATETIME
);

-- 17. Estornos/Reembolsos
CREATE TABLE IF NOT EXISTS refunds (
    id TEXT PRIMARY KEY,
    payment_id TEXT NOT NULL REFERENCES payments(id),
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    reason TEXT,
    provider_refund_id TEXT,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT REFERENCES users(id)
);

-- 18. Checkouts
CREATE TABLE IF NOT EXISTS checkouts (
    id TEXT PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    user_id TEXT REFERENCES users(id),
    email TEXT,
    items TEXT DEFAULT '[]', -- JSONB
    shipping_address TEXT, -- JSONB
    billing_address TEXT, -- JSONB
    shipping_line TEXT, -- JSONB
    applied_discount_codes TEXT, -- JSONB
    currency TEXT DEFAULT 'BRL',
    subtotal_price REAL DEFAULT 0,
    total_tax REAL DEFAULT 0,
    total_shipping REAL DEFAULT 0,
    total_discounts REAL DEFAULT 0,
    total_price REAL DEFAULT 0,
    status TEXT DEFAULT 'open',
    reservation_expires_at DATETIME,
    completed_at DATETIME,
    metadata TEXT, -- JSONB
    recovery_url TEXT,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 19. Pedidos (Orders)
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number INTEGER, -- Sequencial gerado via logica de app ou tabela auxiliar
    idempotency_key TEXT UNIQUE,
    channel TEXT DEFAULT 'web',
    shop_id TEXT REFERENCES shops(id),
    customer_id TEXT REFERENCES customers(id),
    status TEXT DEFAULT 'open',
    payment_status TEXT DEFAULT 'unpaid',
    fulfillment_status TEXT DEFAULT 'unfulfilled',
    currency TEXT DEFAULT 'BRL',
    subtotal_price REAL NOT NULL,
    total_discounts REAL DEFAULT 0,
    total_tax REAL DEFAULT 0,
    total_shipping REAL DEFAULT 0,
    total_tip REAL DEFAULT 0,
    total_price REAL NOT NULL,
    tax_lines TEXT DEFAULT '[]', -- JSONB
    discount_codes TEXT DEFAULT '[]', -- JSONB
    note TEXT,
    tags TEXT, -- TEXT[]
    custom_attributes TEXT DEFAULT '[]', -- JSONB
    metadata TEXT DEFAULT '{}', -- JSONB
    customer_snapshot TEXT NOT NULL, -- JSONB
    billing_address TEXT, -- JSONB
    shipping_address TEXT, -- JSONB
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    cancelled_at DATETIME,
    closed_at DATETIME
);

-- 20. Envios (Shipments)
CREATE TABLE IF NOT EXISTS shipments (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id),
    location_id TEXT REFERENCES locations(id),
    status TEXT DEFAULT 'pending',
    carrier_company TEXT,
    carrier_service TEXT,
    tracking_number TEXT,
    tracking_url TEXT,
    weight_g INTEGER,
    height_mm INTEGER,
    width_mm INTEGER,
    depth_mm INTEGER,
    package_type TEXT,
    shipping_label_url TEXT,
    invoice_url TEXT,
    invoice_key TEXT,
    cost_amount REAL,
    insurance_amount REAL,
    estimated_delivery_at DATETIME,
    shipped_at DATETIME,
    delivered_at DATETIME,
    metadata TEXT, -- JSONB
    customs_info TEXT, -- JSONB
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 21. Itens de Envio
CREATE TABLE IF NOT EXISTS shipment_items (
    id TEXT PRIMARY KEY,
    shipment_id TEXT NOT NULL REFERENCES shipments(id),
    order_item_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    batch_number TEXT,
    serial_numbers TEXT, -- TEXT[]
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 22. Eventos de Envio
CREATE TABLE IF NOT EXISTS shipment_events (
    id TEXT PRIMARY KEY,
    shipment_id TEXT REFERENCES shipments(id),
    status TEXT,
    description TEXT,
    location TEXT,
    happened_at DATETIME,
    raw_data TEXT, -- JSONB
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 23. Identidades de Usuário
CREATE TABLE IF NOT EXISTS user_identities (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_user_id TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at DATETIME,
    profile_data TEXT, -- JSONB
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (provider, provider_user_id)
);

-- 24. Sessões de Usuário
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_agent TEXT,
    ip_address TEXT,
    device_type TEXT,
    location TEXT,
    token_hash TEXT,
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_active_at DATETIME
);

-- 25. Roles
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE,
    permissions TEXT, -- TEXT[]
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 26. User Roles
CREATE TABLE IF NOT EXISTS user_roles (
    user_id TEXT REFERENCES users(id),
    role_id TEXT REFERENCES roles(id),
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- 27. Inquéritos (Inquiries)
CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY,
    protocol_number TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'general',
    status TEXT DEFAULT 'new',
    priority TEXT DEFAULT 'normal',
    source TEXT DEFAULT 'web_form',
    customer_id TEXT REFERENCES customers(id),
    requester_data TEXT NOT NULL, -- JSONB
    department TEXT,
    assigned_staff_id TEXT REFERENCES users(id),
    subject TEXT,
    related_order_id TEXT,
    related_product_id TEXT,
    metadata TEXT, -- JSONB
    sla_due_at DATETIME,
    resolved_at DATETIME,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 28. Mensagens de Inquérito
CREATE TABLE IF NOT EXISTS inquiry_messages (
    id TEXT PRIMARY KEY,
    inquiry_id TEXT NOT NULL REFERENCES inquiries(id),
    sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'staff', 'bot')),
    sender_id TEXT,
    body TEXT,
    is_internal_note INTEGER DEFAULT 0,
    attachments TEXT DEFAULT '[]', -- JSONB
    external_id TEXT,
    read_at DATETIME,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
