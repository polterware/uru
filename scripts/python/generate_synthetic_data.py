#!/usr/bin/env python3
"""
Synthetic Data Generator for Uru Multi-Database Architecture

Generates data for:
- Registry database (shops, users, roles, modules)
- Shop databases (products, customers, orders, etc. WITHOUT shop_id)

Usage:
    pip install faker
    python scripts/python/generate_synthetic_data.py --data-dir ./data --seed 42
"""

import argparse
import json
import random
import sqlite3
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

from faker import Faker


class SyntheticDataGenerator:
    """Generates synthetic data for Uru multi-database architecture."""

    def __init__(self, data_dir: str, seed: int = 42):
        self.data_dir = Path(data_dir)
        self.seed = seed
        self.fake = Faker("pt_BR")
        Faker.seed(seed)
        random.seed(seed)

        # Store generated IDs
        self.shop_ids: list[str] = []
        self.user_ids: list[str] = []
        self.role_ids: list[str] = []

        # Per-shop IDs (reset for each shop)
        self.brand_ids: list[str] = []
        self.category_ids: list[str] = []
        self.product_ids: list[str] = []
        self.location_ids: list[str] = []
        self.customer_ids: list[str] = []
        self.customer_group_ids: list[str] = []
        self.transaction_ids: list[str] = []
        self.order_ids: list[str] = []
        self.payment_ids: list[str] = []
        self.checkout_ids: list[str] = []
        self.inquiry_ids: list[str] = []
        self.inventory_level_ids: list[str] = []
        self.shipment_ids: list[str] = []
        self.pos_session_ids: list[str] = []

        # Configuration
        self.config = {
            "shops": 3,
            "users": 50,
            "roles": 5,
            "brands": 10,
            "categories": 20,
            "products": 150,
            "locations": 5,
            "customers": 100,
            "customer_groups": 5,
            "transactions": 200,
            "orders": 150,
            "payments": 250,
            "checkouts": 50,
            "inquiries": 30,
            "reviews": 80,
            "inventory_levels": 300,
            "shipments": 100,
            "pos_sessions": 20,
        }

    def _uuid(self) -> str:
        return str(uuid.uuid4())

    def _timestamp(self, days_ago_max: int = 365) -> str:
        days_ago = random.randint(0, days_ago_max)
        dt = datetime.now() - timedelta(days=days_ago, hours=random.randint(0, 23))
        return dt.strftime("%Y-%m-%d %H:%M:%S")

    def _future_timestamp(self, days_ahead_max: int = 30) -> str:
        days_ahead = random.randint(1, days_ahead_max)
        dt = datetime.now() + timedelta(days=days_ahead)
        return dt.strftime("%Y-%m-%d %H:%M:%S")

    def _date(self, days_ago_max: int = 365) -> str:
        days_ago = random.randint(0, days_ago_max)
        dt = datetime.now() - timedelta(days=days_ago)
        return dt.strftime("%Y-%m-%d")

    def _future_date(self, days_ahead_max: int = 365) -> str:
        days_ahead = random.randint(1, days_ahead_max)
        dt = datetime.now() + timedelta(days=days_ahead)
        return dt.strftime("%Y-%m-%d")

    def _slug(self, name: str) -> str:
        import re
        slug = name.lower()
        slug = re.sub(r"[àáâãäå]", "a", slug)
        slug = re.sub(r"[èéêë]", "e", slug)
        slug = re.sub(r"[ìíîï]", "i", slug)
        slug = re.sub(r"[òóôõö]", "o", slug)
        slug = re.sub(r"[ùúûü]", "u", slug)
        slug = re.sub(r"[ç]", "c", slug)
        slug = re.sub(r"[^a-z0-9]+", "-", slug)
        return slug.strip("-")

    def _json(self, data: Any) -> str:
        return json.dumps(data, ensure_ascii=False)

    def _choice_or_none(self, items: list, none_prob: float = 0.2) -> Any:
        if not items or random.random() < none_prob:
            return None
        return random.choice(items)

    def connect(self, db_path: Path) -> sqlite3.Connection:
        conn = sqlite3.connect(db_path)
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

    def run(self):
        print(f"Starting multi-database synthetic data generation")
        print(f"Data directory: {self.data_dir}")
        print(f"Seed: {self.seed}")

        # Create directories
        self.data_dir.mkdir(parents=True, exist_ok=True)
        shops_dir = self.data_dir / "shops"
        shops_dir.mkdir(exist_ok=True)

        # Phase 1: Registry Database
        print("\n" + "=" * 60)
        print("PHASE 1: REGISTRY DATABASE")
        print("=" * 60)

        registry_path = self.data_dir / "registry.db"
        self._generate_registry(registry_path)

        # Phase 2: Shop Databases
        print("\n" + "=" * 60)
        print("PHASE 2: SHOP DATABASES")
        print("=" * 60)

        for i, shop_id in enumerate(self.shop_ids):
            print(f"\n--- Generating data for Shop {i+1}/{len(self.shop_ids)} ---")
            shop_db_path = shops_dir / f"shop_{shop_id}.db"
            self._generate_shop_data(shop_db_path, shop_id)

        print("\n" + "=" * 60)
        print("DATA GENERATION COMPLETE")
        print("=" * 60)

    def _generate_registry(self, db_path: Path):
        """Generate registry database with global data."""
        print(f"\nGenerating registry: {db_path}")

        conn = self.connect(db_path)
        cursor = conn.cursor()

        try:
            # Apply registry schema
            schema_path = Path(__file__).resolve().parents[2] / "apps/desktop/src-tauri/migrations/001_registry_schema.sql"
            if schema_path.exists():
                print(f"  Applying schema from {schema_path.name}")
                schema_sql = schema_path.read_text()
                cursor.executescript(schema_sql)
            else:
                raise RuntimeError(f"Registry schema not found: {schema_path}")

            # Generate data
            self._gen_shops(cursor)
            self._gen_users(cursor)
            self._gen_roles(cursor)
            self._gen_user_roles(cursor)
            self._gen_user_sessions(cursor)
            self._gen_user_identities(cursor)

            conn.commit()
            self._print_registry_summary(cursor)
        finally:
            conn.close()

    def _generate_shop_data(self, db_path: Path, shop_id: str):
        """Generate shop database with business data (no shop_id columns)."""
        print(f"  Generating shop db: {db_path.name}")

        # Reset per-shop IDs
        self.brand_ids = []
        self.category_ids = []
        self.product_ids = []
        self.location_ids = []
        self.customer_ids = []
        self.customer_group_ids = []
        self.transaction_ids = []
        self.order_ids = []
        self.payment_ids = []
        self.checkout_ids = []
        self.inquiry_ids = []
        self.inventory_level_ids = []
        self.shipment_ids = []
        self.pos_session_ids = []

        conn = self.connect(db_path)
        cursor = conn.cursor()

        try:
            # Apply shop schema
            schema_path = Path(__file__).resolve().parents[2] / "apps/desktop/src-tauri/migrations/002_shop_schema_sqlite.sql"
            if schema_path.exists():
                print(f"    Applying schema from {schema_path.name}")
                schema_sql = schema_path.read_text()
                cursor.executescript(schema_sql)
            else:
                raise RuntimeError(f"Shop schema not found: {schema_path}")

            # Insert shop_config
            cursor.execute(
                "INSERT INTO shop_config (id, shop_id, initialized_at) VALUES (?, ?, ?)",
                ("config", shop_id, self._timestamp(0))
            )

            # Generate all shop data
            self._gen_brands(cursor)
            self._gen_categories(cursor)
            self._gen_customer_groups(cursor)
            self._gen_customers(cursor)
            self._gen_products(cursor)
            self._gen_locations(cursor)
            self._gen_customer_addresses(cursor)
            self._gen_customer_group_memberships(cursor)
            self._gen_product_categories(cursor)
            self._gen_inventory_levels(cursor)
            self._gen_transactions(cursor)
            self._gen_orders(cursor)
            self._gen_checkouts(cursor)
            self._gen_pos_sessions(cursor)
            self._gen_inquiries(cursor)
            self._gen_transaction_items(cursor)
            self._gen_payments(cursor)
            self._gen_shipments(cursor)
            self._gen_inquiry_messages(cursor)
            self._gen_reviews(cursor)
            self._gen_inventory_movements(cursor)
            self._gen_refunds(cursor)
            self._gen_shipment_items(cursor)
            self._gen_shipment_events(cursor)

            conn.commit()
            self._print_shop_summary(cursor)
        finally:
            conn.close()

    # =========================================================================
    # REGISTRY GENERATORS
    # =========================================================================

    def _gen_shops(self, cursor: sqlite3.Cursor):
        shops_data = [
            ("Loja Principal", "loja-principal"),
            ("Filial Centro", "filial-centro"),
            ("Filial Shopping", "filial-shopping"),
        ]
        for name, slug in shops_data[:self.config["shops"]]:
            shop_id = self._uuid()
            self.shop_ids.append(shop_id)
            cursor.execute("""
                INSERT INTO shops (id, name, legal_name, slug, status, features_config,
                    currency, timezone, locale, database_type, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                shop_id, name, f"{name} LTDA", slug, "active",
                self._json({"inventory": True, "orders": True}),
                "BRL", "America/Sao_Paulo", "pt-BR", "sqlite",
                "created", self._timestamp(365), self._timestamp(30)
            ))
        print(f"    ✓ Generated {len(self.shop_ids)} shops")

    def _gen_users(self, cursor: sqlite3.Cursor):
        for _ in range(self.config["users"]):
            user_id = self._uuid()
            self.user_ids.append(user_id)
            cursor.execute("""
                INSERT INTO users (id, email, phone, password_hash, is_email_verified,
                    profile_type, status, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id, self.fake.unique.email(), self.fake.phone_number(),
                "$argon2id$v=19$" + self.fake.sha256()[:30],
                random.choice([0, 1]),
                random.choice(["admin", "staff", "manager"]),
                random.choice(["active", "active", "inactive"]),
                "created", self._timestamp(365), self._timestamp(30)
            ))
        print(f"    ✓ Generated {self.config['users']} users")

    def _gen_roles(self, cursor: sqlite3.Cursor):
        roles = [("admin", ["all"]), ("manager", ["read", "write"]), ("staff", ["read"]),
                 ("viewer", ["read"]), ("cashier", ["read", "process_payments"])]
        for name, perms in roles[:self.config["roles"]]:
            role_id = self._uuid()
            self.role_ids.append(role_id)
            cursor.execute("""
                INSERT INTO roles (id, name, permissions, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (role_id, name, self._json(perms), "created", self._timestamp(365), self._timestamp(30)))
        print(f"    ✓ Generated {len(self.role_ids)} roles")

    def _gen_user_roles(self, cursor: sqlite3.Cursor):
        count = 0
        for user_id in self.user_ids:
            role_id = random.choice(self.role_ids)
            try:
                cursor.execute("""
                    INSERT INTO user_roles (user_id, role_id, _status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (user_id, role_id, "created", self._timestamp(300), self._timestamp(30)))
                count += 1
            except sqlite3.IntegrityError:
                pass
        print(f"    ✓ Generated {count} user_roles")

    def _gen_user_sessions(self, cursor: sqlite3.Cursor):
        count = 0
        for user_id in self.user_ids[:20]:
            cursor.execute("""
                INSERT INTO user_sessions (id, user_id, user_agent, ip_address, device_type,
                    token_hash, expires_at, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                self._uuid(), user_id, self.fake.user_agent(), self.fake.ipv4(),
                random.choice(["desktop", "mobile"]), self.fake.sha256(),
                self._future_timestamp(7), "created", self._timestamp(30), self._timestamp(7)
            ))
            count += 1
        print(f"    ✓ Generated {count} user_sessions")

    def _gen_user_identities(self, cursor: sqlite3.Cursor):
        count = 0
        for user_id in random.sample(self.user_ids, k=min(10, len(self.user_ids))):
            cursor.execute("""
                INSERT INTO user_identities (id, user_id, provider, provider_user_id,
                    profile_data, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                self._uuid(), user_id, random.choice(["google", "apple"]),
                self.fake.uuid4(), self._json({"name": self.fake.name()}),
                "created", self._timestamp(300), self._timestamp(30)
            ))
            count += 1
        print(f"    ✓ Generated {count} user_identities")

    # =========================================================================
    # SHOP GENERATORS (NO shop_id columns)
    # =========================================================================

    def _gen_brands(self, cursor: sqlite3.Cursor):
        names = ["TechPro", "EcoVida", "StyleMax", "PowerTools", "NaturaCare",
                 "UrbanWear", "HomePlus", "FitLife", "SmartGear", "PureEssence"]
        for i, name in enumerate(names[:self.config["brands"]]):
            brand_id = self._uuid()
            self.brand_ids.append(brand_id)
            cursor.execute("""
                INSERT INTO brands (id, name, slug, status, is_featured, sort_order,
                    _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (brand_id, name, self._slug(name) + f"-{i}", "active",
                  random.choice([0, 1]), i, "created", self._timestamp(365), self._timestamp(30)))
        print(f"      ✓ Generated {self.config['brands']} brands")

    def _gen_categories(self, cursor: sqlite3.Cursor):
        cats = ["Eletrônicos", "Vestuário", "Casa", "Esportes", "Beleza",
                "Alimentos", "Livros", "Brinquedos", "Ferramentas", "Auto"]
        for i, name in enumerate(cats[:self.config["categories"]]):
            cat_id = self._uuid()
            self.category_ids.append(cat_id)
            cursor.execute("""
                INSERT INTO categories (id, parent_id, name, slug, is_visible, sort_order,
                    _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (cat_id, None, name, self._slug(name) + f"-{i}", 1, i,
                  "created", self._timestamp(365), self._timestamp(30)))
        print(f"      ✓ Generated {len(self.category_ids)} categories")

    def _gen_customer_groups(self, cursor: sqlite3.Cursor):
        groups = [("VIP", 15.0), ("Premium", 10.0), ("Regular", 0.0),
                  ("Atacado", 20.0), ("Funcionários", 25.0)]
        for name, discount in groups[:self.config["customer_groups"]]:
            gid = self._uuid()
            self.customer_group_ids.append(gid)
            cursor.execute("""
                INSERT INTO customer_groups (id, name, code, default_discount_percentage,
                    _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (gid, name, self._slug(name), discount, "created",
                  self._timestamp(365), self._timestamp(30)))
        print(f"      ✓ Generated {len(self.customer_group_ids)} customer_groups")

    def _gen_customers(self, cursor: sqlite3.Cursor):
        for _ in range(self.config["customers"]):
            cid = self._uuid()
            self.customer_ids.append(cid)
            cursor.execute("""
                INSERT INTO customers (id, type, email, phone, first_name, last_name,
                    tax_id, status, currency, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                cid, "individual", self.fake.unique.email(), self.fake.phone_number(),
                self.fake.first_name(), self.fake.last_name(), self.fake.cpf(),
                "active", "BRL", "created", self._timestamp(365), self._timestamp(30)
            ))
        print(f"      ✓ Generated {self.config['customers']} customers")

    def _gen_products(self, cursor: sqlite3.Cursor):
        types = ["physical", "physical", "physical", "digital", "service"]
        for i in range(self.config["products"]):
            pid = self._uuid()
            self.product_ids.append(pid)
            price = round(random.uniform(10, 2000), 2)
            cursor.execute("""
                INSERT INTO products (id, sku, type, status, name, slug, price,
                    currency, category_id, brand_id, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                pid, f"SKU-{i:06d}", random.choice(types), "active",
                f"Produto {i+1}", f"produto-{i}", price, "BRL",
                self._choice_or_none(self.category_ids, 0.1),
                self._choice_or_none(self.brand_ids, 0.2),
                "created", self._timestamp(365), self._timestamp(30)
            ))
        print(f"      ✓ Generated {self.config['products']} products")

    def _gen_locations(self, cursor: sqlite3.Cursor):
        locs = [("Depósito Central", "warehouse"), ("Loja Matriz", "store"),
                ("Loja Centro", "store"), ("Em Trânsito", "transit"), ("Virtual", "virtual")]
        for name, ltype in locs[:self.config["locations"]]:
            lid = self._uuid()
            self.location_ids.append(lid)
            cursor.execute("""
                INSERT INTO locations (id, name, type, is_sellable, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (lid, name, ltype, 1 if ltype in ["warehouse", "store"] else 0,
                  "created", self._timestamp(365), self._timestamp(30)))
        print(f"      ✓ Generated {len(self.location_ids)} locations")

    def _gen_customer_addresses(self, cursor: sqlite3.Cursor):
        count = 0
        for cid in self.customer_ids[:50]:
            cursor.execute("""
                INSERT INTO customer_addresses (id, customer_id, type, is_default,
                    address1, city, province_code, country_code, postal_code,
                    _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                self._uuid(), cid, "shipping", 1, self.fake.street_address(),
                self.fake.city(), self.fake.state_abbr(), "BR", self.fake.postcode(),
                "created", self._timestamp(300), self._timestamp(30)
            ))
            count += 1
        print(f"      ✓ Generated {count} customer_addresses")

    def _gen_customer_group_memberships(self, cursor: sqlite3.Cursor):
        count = 0
        for cid in random.sample(self.customer_ids, k=min(30, len(self.customer_ids))):
            gid = random.choice(self.customer_group_ids)
            try:
                cursor.execute("""
                    INSERT INTO customer_group_memberships (customer_id, customer_group_id,
                        _status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (cid, gid, "created", self._timestamp(300), self._timestamp(30)))
                count += 1
            except sqlite3.IntegrityError:
                pass
        print(f"      ✓ Generated {count} customer_group_memberships")

    def _gen_product_categories(self, cursor: sqlite3.Cursor):
        count = 0
        for pid in random.sample(self.product_ids, k=int(len(self.product_ids) * 0.7)):
            cat_id = random.choice(self.category_ids)
            try:
                cursor.execute("""
                    INSERT INTO product_categories (product_id, category_id, position,
                        _status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (pid, cat_id, 0, "created", self._timestamp(300), self._timestamp(30)))
                count += 1
            except sqlite3.IntegrityError:
                pass
        print(f"      ✓ Generated {count} product_categories")

    def _gen_inventory_levels(self, cursor: sqlite3.Cursor):
        count = 0
        for _ in range(self.config["inventory_levels"]):
            lid = self._uuid()
            self.inventory_level_ids.append(lid)
            cursor.execute("""
                INSERT INTO inventory_levels (id, product_id, location_id, quantity_on_hand,
                    quantity_reserved, stock_status, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                lid, random.choice(self.product_ids), random.choice(self.location_ids),
                random.randint(0, 200), random.randint(0, 20), "sellable",
                "created", self._timestamp(365), self._timestamp(30)
            ))
            count += 1
        print(f"      ✓ Generated {count} inventory_levels")

    def _gen_transactions(self, cursor: sqlite3.Cursor):
        for _ in range(self.config["transactions"]):
            tid = self._uuid()
            self.transaction_ids.append(tid)
            total = round(random.uniform(50, 2000), 2)
            cursor.execute("""
                INSERT INTO transactions (id, type, status, channel, customer_id,
                    currency, total_items, total_net, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                tid, random.choice(["sale", "sale", "purchase", "return"]),
                random.choice(["completed", "completed", "pending"]),
                random.choice(["web", "store", "mobile"]),
                self._choice_or_none(self.customer_ids, 0.2),
                "BRL", total, total, "created", self._timestamp(365), self._timestamp(30)
            ))
        print(f"      ✓ Generated {self.config['transactions']} transactions")

    def _gen_orders(self, cursor: sqlite3.Cursor):
        for i in range(self.config["orders"]):
            oid = self._uuid()
            self.order_ids.append(oid)
            subtotal = round(random.uniform(50, 2000), 2)
            cursor.execute("""
                INSERT INTO orders (id, order_number, channel, customer_id, status,
                    payment_status, fulfillment_status, currency, subtotal_price,
                    total_price, customer_snapshot, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                oid, 1000 + i, random.choice(["web", "store"]),
                self._choice_or_none(self.customer_ids, 0.1),
                random.choice(["open", "completed", "processing"]),
                random.choice(["paid", "paid", "pending"]),
                random.choice(["fulfilled", "unfulfilled"]),
                "BRL", subtotal, subtotal,
                self._json({"name": self.fake.name(), "email": self.fake.email()}),
                "created", self._timestamp(365), self._timestamp(30)
            ))
        print(f"      ✓ Generated {self.config['orders']} orders")

    def _gen_checkouts(self, cursor: sqlite3.Cursor):
        for _ in range(self.config["checkouts"]):
            cid = self._uuid()
            self.checkout_ids.append(cid)
            subtotal = round(random.uniform(50, 1000), 2)
            cursor.execute("""
                INSERT INTO checkouts (id, token, email, items, currency,
                    subtotal_price, total_price, status, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                cid, self._uuid(), self.fake.email(),
                self._json([{"product_id": random.choice(self.product_ids), "qty": 1}]),
                "BRL", subtotal, subtotal,
                random.choice(["open", "completed", "abandoned"]),
                "created", self._timestamp(60), self._timestamp(30)
            ))
        print(f"      ✓ Generated {self.config['checkouts']} checkouts")

    def _gen_pos_sessions(self, cursor: sqlite3.Cursor):
        for i in range(self.config["pos_sessions"]):
            sid = self._uuid()
            self.pos_session_ids.append(sid)
            cursor.execute("""
                INSERT INTO pos_sessions (id, location_id, operator_id, terminal_id,
                    session_number, status, opening_cash_amount, total_sales,
                    _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                sid, self._choice_or_none(self.location_ids, 0.1),
                random.choice(self.user_ids), f"TERM-{random.randint(1, 5):02d}",
                i + 1, random.choice(["closed", "closed", "open"]),
                round(random.uniform(100, 500), 2),
                round(random.uniform(500, 3000), 2),
                "created", self._timestamp(60), self._timestamp(30)
            ))
        print(f"      ✓ Generated {self.config['pos_sessions']} pos_sessions")

    def _gen_inquiries(self, cursor: sqlite3.Cursor):
        for i in range(self.config["inquiries"]):
            iid = self._uuid()
            self.inquiry_ids.append(iid)
            cursor.execute("""
                INSERT INTO inquiries (id, protocol_number, type, status, priority,
                    source, customer_id, requester_data, subject, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                iid, f"INQ-{2024}{i:06d}",
                random.choice(["general", "support", "complaint"]),
                random.choice(["new", "open", "resolved"]),
                random.choice(["normal", "high"]),
                random.choice(["web_form", "email"]),
                self._choice_or_none(self.customer_ids, 0.3),
                self._json({"name": self.fake.name(), "email": self.fake.email()}),
                self.fake.sentence(nb_words=5),
                "created", self._timestamp(90), self._timestamp(30)
            ))
        print(f"      ✓ Generated {self.config['inquiries']} inquiries")

    def _gen_transaction_items(self, cursor: sqlite3.Cursor):
        count = 0
        for tid in self.transaction_ids:
            for _ in range(random.randint(1, 3)):
                cursor.execute("""
                    INSERT INTO transaction_items (id, transaction_id, product_id,
                        sku_snapshot, name_snapshot, quantity, unit_price,
                        _status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    self._uuid(), tid, self._choice_or_none(self.product_ids, 0.05),
                    f"SKU-{random.randint(1000, 9999)}", self.fake.word().title(),
                    random.randint(1, 5), round(random.uniform(10, 500), 2),
                    "created", self._timestamp(300), self._timestamp(30)
                ))
                count += 1
        print(f"      ✓ Generated {count} transaction_items")

    def _gen_payments(self, cursor: sqlite3.Cursor):
        for _ in range(self.config["payments"]):
            pid = self._uuid()
            self.payment_ids.append(pid)
            cursor.execute("""
                INSERT INTO payments (id, transaction_id, amount, currency, provider,
                    method, status, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                pid, random.choice(self.transaction_ids),
                round(random.uniform(20, 1000), 2), "BRL",
                random.choice(["stripe", "pagarme", "pix"]),
                random.choice(["credit_card", "pix", "boleto"]),
                random.choice(["captured", "captured", "pending"]),
                "created", self._timestamp(300), self._timestamp(30)
            ))
        print(f"      ✓ Generated {self.config['payments']} payments")

    def _gen_shipments(self, cursor: sqlite3.Cursor):
        for _ in range(self.config["shipments"]):
            sid = self._uuid()
            self.shipment_ids.append(sid)
            cursor.execute("""
                INSERT INTO shipments (id, order_id, location_id, status,
                    carrier_company, tracking_number, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                sid, random.choice(self.order_ids),
                self._choice_or_none(self.location_ids, 0.2),
                random.choice(["shipped", "delivered", "pending"]),
                random.choice(["Correios", "Jadlog", "Total Express"]),
                f"BR{random.randint(100000000, 999999999)}BR",
                "created", self._timestamp(90), self._timestamp(30)
            ))
        print(f"      ✓ Generated {self.config['shipments']} shipments")

    def _gen_inquiry_messages(self, cursor: sqlite3.Cursor):
        count = 0
        for iid in self.inquiry_ids:
            for _ in range(random.randint(1, 4)):
                cursor.execute("""
                    INSERT INTO inquiry_messages (id, inquiry_id, sender_type,
                        body, _status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    self._uuid(), iid, random.choice(["customer", "staff"]),
                    self.fake.paragraph(nb_sentences=2),
                    "created", self._timestamp(60), self._timestamp(30)
                ))
                count += 1
        print(f"      ✓ Generated {count} inquiry_messages")

    def _gen_reviews(self, cursor: sqlite3.Cursor):
        for _ in range(self.config["reviews"]):
            cursor.execute("""
                INSERT INTO reviews (id, order_id, customer_id, product_id, rating,
                    title, body, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                self._uuid(), random.choice(self.order_ids),
                self._choice_or_none(self.customer_ids, 0.2),
                self._choice_or_none(self.product_ids, 0.1),
                random.choice([3, 4, 4, 5, 5]),
                self.fake.sentence(nb_words=4),
                self.fake.paragraph(nb_sentences=2),
                "created", self._timestamp(180), self._timestamp(30)
            ))
        print(f"      ✓ Generated {self.config['reviews']} reviews")

    def _gen_inventory_movements(self, cursor: sqlite3.Cursor):
        count = 0
        # Only use 'in' movements to avoid trigger validation failures
        for lid in random.sample(self.inventory_level_ids, k=min(100, len(self.inventory_level_ids))):
            cursor.execute("""
                INSERT INTO inventory_movements (id, transaction_id, inventory_level_id,
                    type, quantity, _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                self._uuid(), self._choice_or_none(self.transaction_ids, 0.3),
                lid, "in", random.randint(1, 20),
                "created", self._timestamp(180), self._timestamp(30)
            ))
            count += 1
        print(f"      ✓ Generated {count} inventory_movements")

    def _gen_refunds(self, cursor: sqlite3.Cursor):
        count = 0
        for pid in random.sample(self.payment_ids, k=int(len(self.payment_ids) * 0.1)):
            cursor.execute("""
                INSERT INTO refunds (id, payment_id, amount, status, reason,
                    _status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                self._uuid(), pid, round(random.uniform(10, 200), 2),
                random.choice(["approved", "processed"]),
                random.choice(["Defeito", "Arrependimento"]),
                "created", self._timestamp(90), self._timestamp(30)
            ))
            count += 1
        print(f"      ✓ Generated {count} refunds")

    def _gen_shipment_items(self, cursor: sqlite3.Cursor):
        count = 0
        for sid in self.shipment_ids:
            for _ in range(random.randint(1, 3)):
                cursor.execute("""
                    INSERT INTO shipment_items (id, shipment_id, order_item_id, quantity,
                        _status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    self._uuid(), sid, self._uuid(), random.randint(1, 3),
                    "created", self._timestamp(90), self._timestamp(30)
                ))
                count += 1
        print(f"      ✓ Generated {count} shipment_items")

    def _gen_shipment_events(self, cursor: sqlite3.Cursor):
        count = 0
        for sid in self.shipment_ids:
            for i, status in enumerate(["object_posted", "in_transit", "delivered"][:random.randint(1, 3)]):
                cursor.execute("""
                    INSERT INTO shipment_events (id, shipment_id, status, description,
                        location, happened_at, _status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    self._uuid(), sid, status, f"Evento: {status}",
                    f"{self.fake.city()}, {self.fake.state_abbr()}",
                    self._timestamp(90 - i * 5),
                    "created", self._timestamp(90), self._timestamp(30)
                ))
                count += 1
        print(f"      ✓ Generated {count} shipment_events")

    def _print_registry_summary(self, cursor: sqlite3.Cursor):
        print("\n  Registry Summary:")
        for table in ["shops", "users", "roles", "user_roles", "user_sessions", "user_identities"]:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            print(f"    {table}: {cursor.fetchone()[0]}")

    def _print_shop_summary(self, cursor: sqlite3.Cursor):
        print("\n    Shop Summary:")
        tables = ["brands", "categories", "products", "customers", "orders", "payments"]
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            print(f"      {table}: {cursor.fetchone()[0]}")


def main():
    parser = argparse.ArgumentParser(description="Generate synthetic data for Uru multi-database architecture")
    parser.add_argument("--data-dir", type=str, required=True, help="Directory for database files")
    parser.add_argument("--seed", type=int, default=42, help="Random seed (default: 42)")
    args = parser.parse_args()

    generator = SyntheticDataGenerator(data_dir=args.data_dir, seed=args.seed)
    generator.run()


if __name__ == "__main__":
    main()
