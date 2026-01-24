-- Version: 1
-- Registry Schema for Multi-Database Architecture
-- Contains: shops, users, roles, modules, shop_templates
-- This database is ALWAYS SQLite and shared across all shops
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
-- 1. SHOPS (Base da hierarquia)
-- ============================================================

CREATE TABLE IF NOT EXISTS shops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    legal_name TEXT,
    slug TEXT UNIQUE NOT NULL,
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
    -- Multi-database architecture fields
    database_type TEXT DEFAULT 'sqlite', -- 'sqlite' or 'postgres'
    database_config TEXT, -- JSONB with encrypted connection details
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shops_slug ON shops(slug) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_shops_status ON shops(status) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_shops_owner ON shops(owner_id) WHERE _status != 'deleted';

-- ============================================================
-- 2. USERS
-- ============================================================

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

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status) WHERE _status != 'deleted';

-- ============================================================
-- 3. USER IDENTITIES (OAuth/Social logins)
-- ============================================================

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

CREATE INDEX IF NOT EXISTS idx_user_identities_user ON user_identities(user_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_user_identities_provider ON user_identities(provider, provider_user_id) WHERE _status != 'deleted';

-- ============================================================
-- 4. USER SESSIONS
-- ============================================================

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

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at) WHERE _status != 'deleted';

-- ============================================================
-- 5. ROLES
-- ============================================================

CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE,
    permissions TEXT, -- TEXT[] (JSON array)
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name) WHERE _status != 'deleted';

-- ============================================================
-- 6. USER ROLES (Join Table)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_roles (
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    role_id TEXT REFERENCES roles(id) ON DELETE CASCADE,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- ============================================================
-- 7. MODULES (Sistema de Módulos)
-- ============================================================

CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,              -- 'shipping', 'inventory', etc.
    name TEXT NOT NULL,                     -- Nome exibido ao usuário
    description TEXT,                       -- Descrição do módulo
    category TEXT,                          -- 'core', 'logistics', 'sales', etc.
    icon TEXT,                              -- Ícone/nome do ícone
    version TEXT DEFAULT '1.0.0',
    required_modules TEXT DEFAULT '[]',     -- JSON array: dependências
    conflicts_with TEXT DEFAULT '[]',       -- JSON array: conflitos
    tables_used TEXT DEFAULT '[]',          -- JSON array: tabelas utilizadas
    is_core INTEGER DEFAULT 0,              -- 1 se não pode ser desabilitado
    metadata TEXT DEFAULT '{}',             -- JSON: configurações adicionais
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_modules_code ON modules(code) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_modules_category ON modules(category) WHERE _status != 'deleted';

-- ============================================================
-- 8. SHOP TEMPLATES
-- ============================================================

CREATE TABLE IF NOT EXISTS shop_templates (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,              -- 'online_store', 'physical_store', etc.
    name TEXT NOT NULL,                     -- Nome exibido
    description TEXT,                       -- Descrição do tipo de negócio
    category TEXT,                          -- 'retail', 'services', 'ecommerce', etc.
    icon TEXT,                              -- Ícone/nome do ícone
    features_config TEXT NOT NULL,          -- JSON: configuração a ser aplicada
    default_settings TEXT DEFAULT '{}',     -- JSON: configurações padrão
    recommended_modules TEXT DEFAULT '[]',  -- JSON array: módulos recomendados
    metadata TEXT DEFAULT '{}',             -- JSON: informações adicionais
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shop_templates_code ON shop_templates(code) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_shop_templates_category ON shop_templates(category) WHERE _status != 'deleted';

-- ============================================================
-- SEED DATA: MODULES
-- ============================================================

-- Módulos Core (sempre habilitados)
INSERT OR IGNORE INTO modules (id, code, name, description, category, is_core, tables_used) VALUES
('mod-products', 'products', 'Produtos', 'Catálogo de produtos e serviços', 'core', 1, '["products", "brands", "categories", "product_categories"]'),
('mod-customers', 'customers', 'Clientes', 'Gerenciamento de clientes', 'core', 1, '["customers", "customer_addresses", "customer_groups", "customer_group_memberships"]'),
('mod-transactions', 'transactions', 'Transações', 'Registro de transações financeiras', 'core', 1, '["transactions", "transaction_items"]'),
('mod-orders', 'orders', 'Pedidos', 'Gerenciamento de pedidos', 'core', 1, '["orders"]'),
('mod-payments', 'payments', 'Pagamentos', 'Processamento de pagamentos', 'core', 1, '["payments", "refunds"]');

-- Módulos Opcionais - Logística
INSERT OR IGNORE INTO modules (id, code, name, description, category, required_modules, tables_used) VALUES
('mod-shipping', 'shipping', 'Entrega', 'Gerenciamento de entregas e frete', 'logistics', '[]', '["shipments", "shipment_items", "shipment_events"]'),
('mod-inventory', 'inventory', 'Estoque', 'Controle de estoque e inventário', 'logistics', '[]', '["inventory_levels", "inventory_movements"]'),
('mod-locations', 'locations', 'Locais', 'Gerenciamento de locais e depósitos', 'logistics', '[]', '["locations"]');

-- Módulos Opcionais - Vendas
INSERT OR IGNORE INTO modules (id, code, name, description, category, required_modules, tables_used) VALUES
('mod-checkout', 'checkout', 'Checkout', 'Carrinho de compras e checkout', 'sales', '[]', '["checkouts"]'),
('mod-pos', 'pos', 'Ponto de Venda', 'Sistema de ponto de venda (PDV)', 'sales', '[]', '["pos_sessions"]');

-- Módulos Opcionais - Marketing e Suporte
INSERT OR IGNORE INTO modules (id, code, name, description, category, required_modules, tables_used) VALUES
('mod-reviews', 'reviews', 'Avaliações', 'Sistema de avaliações e reviews', 'marketing', '[]', '["reviews", "product_metrics"]'),
('mod-inquiries', 'inquiries', 'Atendimento', 'Sistema de atendimento ao cliente (SAC)', 'marketing', '[]', '["inquiries", "inquiry_messages"]');

-- ============================================================
-- SEED DATA: SHOP TEMPLATES
-- ============================================================

-- Template 1: Loja Virtual
INSERT OR IGNORE INTO shop_templates (id, code, name, description, category, features_config, default_settings, recommended_modules) VALUES
(
    'tpl-online-store',
    'online_store',
    'Loja Virtual',
    'Loja online com checkout, estoque e entregas',
    'ecommerce',
    '{"products": true, "customers": true, "transactions": true, "orders": true, "payments": true, "shipping": true, "checkout": true, "inventory": true, "inquiries": true, "reviews": true, "pos": false, "locations": false}',
    '{"allow_guest_checkout": true, "require_shipping": true}',
    '["shipping", "checkout", "inventory", "reviews", "inquiries"]'
);

-- Template 2: Loja Física
INSERT OR IGNORE INTO shop_templates (id, code, name, description, category, features_config, default_settings, recommended_modules) VALUES
(
    'tpl-physical-store',
    'physical_store',
    'Loja Física',
    'Loja física com PDV e controle de estoque',
    'retail',
    '{"products": true, "customers": true, "transactions": true, "orders": true, "payments": true, "pos": true, "inventory": true, "locations": true, "inquiries": true, "shipping": false, "checkout": false, "reviews": false}',
    '{"require_shipping": false, "allow_offline_sales": true}',
    '["pos", "inventory", "locations"]'
);

-- Template 3: Marketplace
INSERT OR IGNORE INTO shop_templates (id, code, name, description, category, features_config, default_settings, recommended_modules) VALUES
(
    'tpl-marketplace',
    'marketplace',
    'Marketplace',
    'Marketplace multi-vendedor completo',
    'ecommerce',
    '{"products": true, "customers": true, "transactions": true, "orders": true, "payments": true, "shipping": true, "checkout": true, "inventory": true, "locations": true, "inquiries": true, "reviews": true, "pos": false}',
    '{"multi_vendor": true, "allow_guest_checkout": true, "require_shipping": true}',
    '["shipping", "checkout", "inventory", "locations", "reviews", "inquiries"]'
);

-- Template 4: Loja Híbrida (Física + Virtual)
INSERT OR IGNORE INTO shop_templates (id, code, name, description, category, features_config, default_settings, recommended_modules) VALUES
(
    'tpl-hybrid-store',
    'hybrid_store',
    'Loja Híbrida',
    'Loja física e virtual com todos os recursos',
    'retail',
    '{"products": true, "customers": true, "transactions": true, "orders": true, "payments": true, "shipping": true, "checkout": true, "inventory": true, "pos": true, "locations": true, "inquiries": true, "reviews": true}',
    '{"allow_guest_checkout": true, "require_shipping": true, "allow_offline_sales": true}',
    '["shipping", "checkout", "inventory", "pos", "locations", "reviews", "inquiries"]'
);

-- Template 5: Consultoria/Serviços
INSERT OR IGNORE INTO shop_templates (id, code, name, description, category, features_config, default_settings, recommended_modules) VALUES
(
    'tpl-consulting',
    'consulting',
    'Consultoria',
    'Serviços e consultoria sem necessidade de estoque ou entrega',
    'services',
    '{"products": true, "customers": true, "transactions": true, "orders": true, "payments": true, "inquiries": true, "shipping": false, "inventory": false, "checkout": false, "pos": false, "reviews": false, "locations": false}',
    '{"product_type_default": "service", "require_shipping": false}',
    '["inquiries"]'
);

-- Template 6: Aula Virtual/Educação
INSERT OR IGNORE INTO shop_templates (id, code, name, description, category, features_config, default_settings, recommended_modules) VALUES
(
    'tpl-online-education',
    'online_education',
    'Aula Virtual',
    'Plataforma de educação e cursos online',
    'education',
    '{"products": true, "customers": true, "transactions": true, "orders": true, "payments": true, "checkout": true, "inquiries": true, "reviews": true, "shipping": false, "inventory": false, "pos": false, "locations": false}',
    '{"product_type_default": "digital", "require_shipping": false, "allow_guest_checkout": false}',
    '["checkout", "reviews", "inquiries"]'
);
