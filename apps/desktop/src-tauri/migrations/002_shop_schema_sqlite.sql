-- Version: 1
-- Shop Schema for Multi-Database Architecture (SQLite version)
-- Contains all business tables WITHOUT shop_id columns
-- Each shop gets its own database with this schema
--
-- IMPORTANT: This schema does NOT include shop_id foreign keys
-- because each shop database is isolated by design.
--
-- CONVENÇÕES:
-- - ON DELETE CASCADE: apenas em join tables e tabelas dependentes sem valor próprio
-- - ON DELETE SET NULL: para FKs opcionais onde o registro pai pode ser removido
-- - ON DELETE RESTRICT (default): para FKs críticas onde deleção deve ser bloqueada
-- - Soft Delete (_status = 'deleted'): usado para todas as tabelas de negócio

-- ============================================================
-- PRAGMA SETTINGS
-- ============================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ============================================================
-- SHOP CONFIG (metadata stored in each shop's database)
-- ============================================================

CREATE TABLE IF NOT EXISTS shop_config (
    id TEXT PRIMARY KEY DEFAULT 'config',
    shop_id TEXT NOT NULL,
    initialized_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    schema_version INTEGER DEFAULT 1,
    metadata TEXT DEFAULT '{}'
);

-- ============================================================
-- 1. BRANDS
-- ============================================================

CREATE TABLE IF NOT EXISTS brands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_brands_status ON brands(status) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_brands_featured ON brands(is_featured) WHERE _status != 'deleted';

-- ============================================================
-- 2. CATEGORIES
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_categories_visible ON categories(is_visible) WHERE _status != 'deleted';

-- ============================================================
-- 3. PRODUCTS
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    sku TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('physical', 'digital', 'service', 'bundle')),
    status TEXT DEFAULT 'draft',
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    gtin_ean TEXT,
    price REAL NOT NULL CHECK (price >= 0),
    promotional_price REAL CHECK (promotional_price IS NULL OR promotional_price >= 0),
    cost_price REAL CHECK (cost_price IS NULL OR cost_price >= 0),
    currency TEXT DEFAULT 'BRL',
    tax_ncm TEXT,
    is_shippable INTEGER DEFAULT 1,
    weight_g INTEGER DEFAULT 0,
    width_mm INTEGER DEFAULT 0,
    height_mm INTEGER DEFAULT 0,
    depth_mm INTEGER DEFAULT 0,
    attributes TEXT, -- JSONB
    metadata TEXT,   -- JSONB
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    brand_id TEXT REFERENCES brands(id) ON DELETE SET NULL,
    parent_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    _status TEXT DEFAULT 'created' CHECK (_status IN ('created', 'synced', 'modified', 'deleted')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_products_parent ON products(parent_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at) WHERE _status != 'deleted';

-- ============================================================
-- 4. PRODUCT CATEGORIES (Join Table)
-- ============================================================

CREATE TABLE IF NOT EXISTS product_categories (
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id, category_id)
);

-- ============================================================
-- 5. LOCATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('warehouse', 'store', 'transit', 'virtual')),
    is_sellable INTEGER DEFAULT 1,
    address_data TEXT, -- JSONB
    _status TEXT DEFAULT 'created' CHECK (_status IN ('created', 'synced', 'modified', 'deleted')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(type) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_locations_sellable ON locations(is_sellable) WHERE _status != 'deleted';

-- ============================================================
-- 6. INVENTORY LEVELS
-- ============================================================

CREATE TABLE IF NOT EXISTS inventory_levels (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
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

CREATE INDEX IF NOT EXISTS idx_inventory_levels_product ON inventory_levels(product_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_inventory_levels_location ON inventory_levels(location_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_inventory_levels_status ON inventory_levels(stock_status) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_inventory_levels_expiry ON inventory_levels(expiry_date) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_inventory_levels_serial ON inventory_levels(serial_number) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_inventory_levels_batch ON inventory_levels(batch_number) WHERE _status != 'deleted';

-- ============================================================
-- 7. CUSTOMER GROUPS (must come before customers)
-- ============================================================

CREATE TABLE IF NOT EXISTS customer_groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE,
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customer_groups_code ON customer_groups(code) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_customer_groups_type ON customer_groups(type) WHERE _status != 'deleted';

-- ============================================================
-- 8. CUSTOMERS
-- ============================================================

CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'individual' CHECK (type IN ('individual', 'company')),
    email TEXT UNIQUE,
    phone TEXT,
    first_name TEXT,
    last_name TEXT,
    company_name TEXT,
    tax_id TEXT UNIQUE,
    tax_id_type TEXT,
    state_tax_id TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    currency TEXT DEFAULT 'BRL',
    language TEXT DEFAULT 'pt',
    tags TEXT, -- TEXT[]
    accepts_marketing INTEGER DEFAULT 0,
    customer_group_id TEXT REFERENCES customer_groups(id) ON DELETE SET NULL,
    total_spent REAL DEFAULT 0 CHECK (total_spent >= 0),
    orders_count INTEGER DEFAULT 0 CHECK (orders_count >= 0),
    last_order_at DATETIME,
    notes TEXT,
    metadata TEXT, -- JSONB
    custom_attributes TEXT, -- JSONB
    _status TEXT DEFAULT 'created' CHECK (_status IN ('created', 'synced', 'modified', 'deleted')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_customers_tax_id ON customers(tax_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_customers_group ON customers(customer_group_id) WHERE _status != 'deleted';

-- ============================================================
-- 9. CUSTOMER GROUP MEMBERSHIPS (Join Table)
-- ============================================================

CREATE TABLE IF NOT EXISTS customer_group_memberships (
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    customer_group_id TEXT REFERENCES customer_groups(id) ON DELETE CASCADE,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (customer_id, customer_group_id)
);

-- ============================================================
-- 10. CUSTOMER ADDRESSES
-- ============================================================

CREATE TABLE IF NOT EXISTS customer_addresses (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer ON customer_addresses(customer_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_customer_addresses_type ON customer_addresses(type) WHERE _status != 'deleted';

-- ============================================================
-- 11. TRANSACTIONS
-- Note: staff_id references users in registry database (validated at app layer)
-- ============================================================

CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('sale', 'purchase', 'transfer', 'return', 'adjustment')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'completed', 'cancelled', 'failed')),
    channel TEXT,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    supplier_id TEXT,
    staff_id TEXT, -- References users in registry (validated at app layer)
    currency TEXT DEFAULT 'BRL',
    total_items REAL DEFAULT 0 CHECK (total_items >= 0),
    total_shipping REAL DEFAULT 0 CHECK (total_shipping >= 0),
    total_discount REAL DEFAULT 0 CHECK (total_discount >= 0),
    total_net REAL DEFAULT 0,
    shipping_method TEXT,
    shipping_address TEXT, -- JSONB
    billing_address TEXT,  -- JSONB
    _status TEXT DEFAULT 'created' CHECK (_status IN ('created', 'synced', 'modified', 'deleted')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_transactions_staff ON transactions(staff_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_transactions_channel ON transactions(channel) WHERE _status != 'deleted';

-- ============================================================
-- 12. TRANSACTION ITEMS
-- ============================================================

CREATE TABLE IF NOT EXISTS transaction_items (
    id TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
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

CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON transaction_items(transaction_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_transaction_items_product ON transaction_items(product_id) WHERE _status != 'deleted';

-- ============================================================
-- 13. INVENTORY MOVEMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS inventory_movements (
    id TEXT PRIMARY KEY,
    transaction_id TEXT REFERENCES transactions(id) ON DELETE SET NULL,
    inventory_level_id TEXT REFERENCES inventory_levels(id) ON DELETE RESTRICT,
    type TEXT CHECK (type IN ('in', 'out')),
    quantity REAL NOT NULL,
    previous_balance REAL,
    new_balance REAL,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_transaction ON inventory_movements(transaction_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_inventory_movements_level ON inventory_movements(inventory_level_id) WHERE _status != 'deleted';

-- ============================================================
-- 14. PAYMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE RESTRICT,
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

CREATE INDEX IF NOT EXISTS idx_payments_transaction ON payments(transaction_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_payments_provider_transaction ON payments(provider_transaction_id) WHERE _status != 'deleted';

-- ============================================================
-- 15. REFUNDS
-- ============================================================

CREATE TABLE IF NOT EXISTS refunds (
    id TEXT PRIMARY KEY,
    payment_id TEXT NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    reason TEXT,
    provider_refund_id TEXT,
    created_by TEXT, -- References users in registry (validated at app layer)
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refunds_payment ON refunds(payment_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status) WHERE _status != 'deleted';

-- ============================================================
-- 16. CHECKOUTS
-- ============================================================

CREATE TABLE IF NOT EXISTS checkouts (
    id TEXT PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    user_id TEXT, -- References users in registry (validated at app layer)
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

CREATE INDEX IF NOT EXISTS idx_checkouts_token ON checkouts(token) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_checkouts_user ON checkouts(user_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_checkouts_status ON checkouts(status) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_checkouts_email ON checkouts(email) WHERE _status != 'deleted';

-- ============================================================
-- 17. ORDERS
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number INTEGER,
    idempotency_key TEXT UNIQUE,
    channel TEXT DEFAULT 'web',
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
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

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON orders(fulfillment_status) WHERE _status != 'deleted';

-- ============================================================
-- 18. SHIPMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS shipments (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    location_id TEXT REFERENCES locations(id) ON DELETE SET NULL,
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

CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number) WHERE _status != 'deleted';

-- ============================================================
-- 19. SHIPMENT ITEMS
-- ============================================================

CREATE TABLE IF NOT EXISTS shipment_items (
    id TEXT PRIMARY KEY,
    shipment_id TEXT NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    order_item_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    batch_number TEXT,
    serial_numbers TEXT, -- TEXT[]
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shipment_items_shipment ON shipment_items(shipment_id) WHERE _status != 'deleted';

-- ============================================================
-- 20. SHIPMENT EVENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS shipment_events (
    id TEXT PRIMARY KEY,
    shipment_id TEXT REFERENCES shipments(id) ON DELETE CASCADE,
    status TEXT,
    description TEXT,
    location TEXT,
    happened_at DATETIME,
    raw_data TEXT, -- JSONB
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shipment_events_shipment ON shipment_events(shipment_id) WHERE _status != 'deleted';

-- ============================================================
-- 21. POS SESSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS pos_sessions (
    id TEXT PRIMARY KEY,
    location_id TEXT REFERENCES locations(id) ON DELETE RESTRICT,
    operator_id TEXT NOT NULL, -- References users in registry (validated at app layer)
    terminal_id TEXT,
    session_number INTEGER,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'paused', 'closed', 'cancelled')),
    opening_cash_amount REAL DEFAULT 0,
    opening_notes TEXT,
    opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    closing_cash_amount REAL,
    closing_notes TEXT,
    closed_at DATETIME,
    closed_by TEXT, -- References users in registry
    total_sales REAL DEFAULT 0,
    total_returns REAL DEFAULT 0,
    total_cash_in REAL DEFAULT 0,
    total_cash_out REAL DEFAULT 0,
    transaction_count INTEGER DEFAULT 0,
    expected_cash_amount REAL,
    cash_difference REAL,
    metadata TEXT DEFAULT '{}', -- JSONB
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pos_sessions_location ON pos_sessions(location_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_pos_sessions_operator ON pos_sessions(operator_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_pos_sessions_status ON pos_sessions(status) WHERE _status != 'deleted';

-- ============================================================
-- 22. INQUIRIES
-- ============================================================

CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY,
    protocol_number TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'general' CHECK (type IN ('general', 'support', 'complaint', 'return', 'exchange', 'question')),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'open', 'pending', 'resolved', 'closed')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    source TEXT DEFAULT 'web_form' CHECK (source IN ('web_form', 'email', 'phone', 'chat', 'social', 'in_store')),
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    requester_data TEXT NOT NULL, -- JSONB
    department TEXT,
    assigned_staff_id TEXT, -- References users in registry (validated at app layer)
    subject TEXT,
    related_order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
    related_product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    metadata TEXT, -- JSONB
    sla_due_at DATETIME,
    resolved_at DATETIME,
    _status TEXT DEFAULT 'created' CHECK (_status IN ('created', 'synced', 'modified', 'deleted')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inquiries_customer ON inquiries(customer_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_inquiries_protocol ON inquiries(protocol_number) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_inquiries_priority ON inquiries(priority) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_inquiries_assigned ON inquiries(assigned_staff_id) WHERE _status != 'deleted';

-- ============================================================
-- 23. INQUIRY MESSAGES
-- ============================================================

CREATE TABLE IF NOT EXISTS inquiry_messages (
    id TEXT PRIMARY KEY,
    inquiry_id TEXT NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_inquiry_messages_inquiry ON inquiry_messages(inquiry_id) WHERE _status != 'deleted';

-- ============================================================
-- 24. REVIEWS
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title TEXT,
    body TEXT,
    photos TEXT DEFAULT '[]', -- JSONB
    videos TEXT DEFAULT '[]', -- JSONB
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON reviews(customer_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_reviews_order ON reviews(order_id) WHERE _status != 'deleted';

-- ============================================================
-- 25. PRODUCT METRICS (Aggregated)
-- ============================================================

CREATE TABLE IF NOT EXISTS product_metrics (
    product_id TEXT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    average_rating REAL DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 26. AUDIT LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data TEXT,  -- JSONB com dados anteriores
    new_data TEXT,  -- JSONB com dados novos
    changed_by TEXT,  -- user_id se disponível
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON audit_logs(record_id);

-- ============================================================
-- TRIGGERS: Stock Validation and Updates
-- ============================================================

-- Trigger: Validar estoque antes de movimentação de saída
CREATE TRIGGER IF NOT EXISTS trg_validate_stock_before_movement
BEFORE INSERT ON inventory_movements
WHEN NEW.type = 'out'
BEGIN
    SELECT CASE
        WHEN (SELECT quantity_on_hand - quantity_reserved FROM inventory_levels WHERE id = NEW.inventory_level_id) < NEW.quantity
        THEN RAISE(ABORT, 'Estoque insuficiente para esta movimentação')
    END;
END;

-- Trigger: Atualizar inventory_levels após INSERT em inventory_movements
CREATE TRIGGER IF NOT EXISTS trg_inventory_movement_update_level
AFTER INSERT ON inventory_movements
BEGIN
    UPDATE inventory_levels
    SET
        quantity_on_hand = CASE
            WHEN NEW.type = 'in' THEN quantity_on_hand + NEW.quantity
            WHEN NEW.type = 'out' THEN quantity_on_hand - NEW.quantity
            ELSE quantity_on_hand
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.inventory_level_id;
END;

-- Trigger: Marcar estoque como expirado ao inserir com data passada
CREATE TRIGGER IF NOT EXISTS trg_expire_stock_on_insert
AFTER INSERT ON inventory_levels
WHEN NEW.expiry_date IS NOT NULL AND NEW.expiry_date < date('now')
BEGIN
    UPDATE inventory_levels
    SET stock_status = 'expired', updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;

-- ============================================================
-- TRIGGERS: Product Metrics from Reviews
-- ============================================================

CREATE TRIGGER IF NOT EXISTS trg_reviews_metrics_insert
AFTER INSERT ON reviews
WHEN NEW.product_id IS NOT NULL
BEGIN
    INSERT INTO product_metrics (product_id, average_rating, review_count, updated_at)
    VALUES (NEW.product_id, NEW.rating, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(product_id) DO UPDATE SET
        average_rating = CASE
            WHEN review_count <= 0 THEN NEW.rating
            ELSE ((average_rating * review_count) + NEW.rating) / (review_count + 1)
        END,
        review_count = review_count + 1,
        updated_at = CURRENT_TIMESTAMP;
END;

CREATE TRIGGER IF NOT EXISTS trg_reviews_metrics_update_rating
AFTER UPDATE OF rating ON reviews
WHEN NEW.product_id IS NOT NULL AND OLD.product_id = NEW.product_id AND OLD.rating != NEW.rating
BEGIN
    UPDATE product_metrics
    SET
        average_rating = CASE
            WHEN review_count <= 0 THEN NEW.rating
            ELSE ((average_rating * review_count) - OLD.rating + NEW.rating) / review_count
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE product_id = NEW.product_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_reviews_metrics_update_product
AFTER UPDATE OF product_id ON reviews
WHEN OLD.product_id IS NOT NULL AND NEW.product_id IS NOT NULL AND OLD.product_id != NEW.product_id
BEGIN
    UPDATE product_metrics
    SET
        average_rating = CASE
            WHEN review_count <= 1 THEN 0
            ELSE ((average_rating * review_count) - OLD.rating) / (review_count - 1)
        END,
        review_count = CASE
            WHEN review_count <= 0 THEN 0
            ELSE review_count - 1
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE product_id = OLD.product_id;

    INSERT INTO product_metrics (product_id, average_rating, review_count, updated_at)
    VALUES (NEW.product_id, NEW.rating, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(product_id) DO UPDATE SET
        average_rating = CASE
            WHEN review_count <= 0 THEN NEW.rating
            ELSE ((average_rating * review_count) + NEW.rating) / (review_count + 1)
        END,
        review_count = review_count + 1,
        updated_at = CURRENT_TIMESTAMP;
END;

CREATE TRIGGER IF NOT EXISTS trg_reviews_metrics_delete
AFTER DELETE ON reviews
WHEN OLD.product_id IS NOT NULL
BEGIN
    UPDATE product_metrics
    SET
        average_rating = CASE
            WHEN review_count <= 1 THEN 0
            ELSE ((average_rating * review_count) - OLD.rating) / (review_count - 1)
        END,
        review_count = CASE
            WHEN review_count <= 0 THEN 0
            ELSE review_count - 1
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE product_id = OLD.product_id;
END;

-- ============================================================
-- TRIGGERS: Audit Logging for Critical Tables
-- ============================================================

CREATE TRIGGER IF NOT EXISTS trg_audit_transactions_insert
AFTER INSERT ON transactions
BEGIN
    INSERT INTO audit_logs (id, table_name, record_id, action, new_data, created_at)
    VALUES (
        lower(hex(randomblob(16))),
        'transactions',
        NEW.id,
        'INSERT',
        json_object(
            'id', NEW.id,
            'type', NEW.type,
            'status', NEW.status,
            'customer_id', NEW.customer_id,
            'total_net', NEW.total_net
        ),
        CURRENT_TIMESTAMP
    );
END;

CREATE TRIGGER IF NOT EXISTS trg_audit_transactions_update
AFTER UPDATE ON transactions
BEGIN
    INSERT INTO audit_logs (id, table_name, record_id, action, old_data, new_data, created_at)
    VALUES (
        lower(hex(randomblob(16))),
        'transactions',
        NEW.id,
        'UPDATE',
        json_object(
            'type', OLD.type,
            'status', OLD.status,
            'total_net', OLD.total_net
        ),
        json_object(
            'type', NEW.type,
            'status', NEW.status,
            'total_net', NEW.total_net
        ),
        CURRENT_TIMESTAMP
    );
END;

CREATE TRIGGER IF NOT EXISTS trg_audit_inventory_movements_insert
AFTER INSERT ON inventory_movements
BEGIN
    INSERT INTO audit_logs (id, table_name, record_id, action, new_data, created_at)
    VALUES (
        lower(hex(randomblob(16))),
        'inventory_movements',
        NEW.id,
        'INSERT',
        json_object(
            'id', NEW.id,
            'type', NEW.type,
            'quantity', NEW.quantity,
            'inventory_level_id', NEW.inventory_level_id,
            'previous_balance', NEW.previous_balance,
            'new_balance', NEW.new_balance
        ),
        CURRENT_TIMESTAMP
    );
END;

CREATE TRIGGER IF NOT EXISTS trg_audit_payments_insert
AFTER INSERT ON payments
BEGIN
    INSERT INTO audit_logs (id, table_name, record_id, action, new_data, created_at)
    VALUES (
        lower(hex(randomblob(16))),
        'payments',
        NEW.id,
        'INSERT',
        json_object(
            'id', NEW.id,
            'amount', NEW.amount,
            'status', NEW.status,
            'provider', NEW.provider,
            'method', NEW.method
        ),
        CURRENT_TIMESTAMP
    );
END;

CREATE TRIGGER IF NOT EXISTS trg_audit_payments_update
AFTER UPDATE ON payments
BEGIN
    INSERT INTO audit_logs (id, table_name, record_id, action, old_data, new_data, created_at)
    VALUES (
        lower(hex(randomblob(16))),
        'payments',
        NEW.id,
        'UPDATE',
        json_object(
            'amount', OLD.amount,
            'status', OLD.status
        ),
        json_object(
            'amount', NEW.amount,
            'status', NEW.status
        ),
        CURRENT_TIMESTAMP
    );
END;

CREATE TRIGGER IF NOT EXISTS trg_audit_orders_insert
AFTER INSERT ON orders
BEGIN
    INSERT INTO audit_logs (id, table_name, record_id, action, new_data, created_at)
    VALUES (
        lower(hex(randomblob(16))),
        'orders',
        NEW.id,
        'INSERT',
        json_object(
            'id', NEW.id,
            'order_number', NEW.order_number,
            'status', NEW.status,
            'payment_status', NEW.payment_status,
            'total_price', NEW.total_price
        ),
        CURRENT_TIMESTAMP
    );
END;

CREATE TRIGGER IF NOT EXISTS trg_audit_orders_update
AFTER UPDATE ON orders
BEGIN
    INSERT INTO audit_logs (id, table_name, record_id, action, old_data, new_data, created_at)
    VALUES (
        lower(hex(randomblob(16))),
        'orders',
        NEW.id,
        'UPDATE',
        json_object(
            'status', OLD.status,
            'payment_status', OLD.payment_status,
            'fulfillment_status', OLD.fulfillment_status
        ),
        json_object(
            'status', NEW.status,
            'payment_status', NEW.payment_status,
            'fulfillment_status', NEW.fulfillment_status
        ),
        CURRENT_TIMESTAMP
    );
END;

CREATE TRIGGER IF NOT EXISTS trg_audit_refunds_insert
AFTER INSERT ON refunds
BEGIN
    INSERT INTO audit_logs (id, table_name, record_id, action, new_data, created_at)
    VALUES (
        lower(hex(randomblob(16))),
        'refunds',
        NEW.id,
        'INSERT',
        json_object(
            'id', NEW.id,
            'payment_id', NEW.payment_id,
            'amount', NEW.amount,
            'status', NEW.status,
            'reason', NEW.reason
        ),
        CURRENT_TIMESTAMP
    );
END;
