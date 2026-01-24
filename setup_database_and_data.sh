#!/usr/bin/env bash
set -euo pipefail

# Script para resetar os bancos de dados, criar o schema e preencher com dados sintéticos
# Arquitetura multi-database: registry.db + shop_{id}.db para cada loja
# Uso: ./setup_database_and_data.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_DIR="$ROOT_DIR/scripts"
VENV_DIR="$PYTHON_DIR/.venv"
DATA_DIR="$HOME/Library/Application Support/com.tauri.dev"
REGISTRY_SCHEMA="$ROOT_DIR/apps/desktop/src-tauri/migrations/001_registry_schema.sql"
SCRIPT_PATH="$PYTHON_DIR/python/generate_synthetic_data.py"

# Verificar se sqlite3 está instalado
if ! command -v sqlite3 &> /dev/null; then
  echo "❌ Erro: sqlite3 não está instalado"
  echo "   Instale com: brew install sqlite3"
  exit 1
fi

# Verificar se o arquivo de schema existe
if [[ ! -f "$REGISTRY_SCHEMA" ]]; then
  echo "❌ Erro: Schema não encontrado em $REGISTRY_SCHEMA"
  exit 1
fi

# Verificar se o script Python existe
if [[ ! -f "$SCRIPT_PATH" ]]; then
  echo "❌ Erro: Script Python não encontrado em $SCRIPT_PATH"
  exit 1
fi

echo "🗑️  Removendo bancos de dados existentes (se houver)..."
mkdir -p "$DATA_DIR"
mkdir -p "$DATA_DIR/shops"

# Remover registry.db
if [[ -f "$DATA_DIR/registry.db" ]]; then
  rm -f "$DATA_DIR/registry.db"
  rm -f "$DATA_DIR/registry.db-shm" 2>/dev/null || true
  rm -f "$DATA_DIR/registry.db-wal" 2>/dev/null || true
  echo "   ✓ Registry removido"
else
  echo "   ℹ Nenhum registry encontrado"
fi

# Remover shop databases
SHOP_COUNT=$(find "$DATA_DIR/shops" -name "shop_*.db" 2>/dev/null | wc -l | tr -d ' ')
if [[ "$SHOP_COUNT" -gt 0 ]]; then
  rm -f "$DATA_DIR/shops/shop_"*.db*
  echo "   ✓ $SHOP_COUNT banco(s) de shop removido(s)"
else
  echo "   ℹ Nenhum banco de shop encontrado"
fi

# Remover banco antigo (se existir do schema antigo)
if [[ -f "$DATA_DIR/uru.db" ]]; then
  rm -f "$DATA_DIR/uru.db"*
  echo "   ✓ Banco antigo (uru.db) removido"
fi

echo ""
echo "🐍 Configurando ambiente Python..."

# Criar venv se não existir ou se estiver quebrado
if [[ ! -d "$VENV_DIR" ]] || [[ ! -f "$VENV_DIR/bin/python3" ]]; then
  echo "   Criando venv em $VENV_DIR"
  rm -rf "$VENV_DIR"
  python3 -m venv "$VENV_DIR"
fi

VENV_PYTHON="$VENV_DIR/bin/python3"

# Instalar dependências se necessário
echo "   Instalando/atualizando dependências"
"$VENV_PYTHON" -m pip install --upgrade pip --quiet
"$VENV_PYTHON" -m pip install faker --quiet

echo ""
echo "🎲 Gerando dados sintéticos (multi-database)..."
"$VENV_PYTHON" "$SCRIPT_PATH" --data-dir "$DATA_DIR" --seed 42

echo ""
echo "✅ Bancos de dados criados e preenchidos com sucesso!"
echo ""
echo "📊 Informações:"
echo "   Diretório: $DATA_DIR"

# Verificar registry
if [[ -f "$DATA_DIR/registry.db" ]]; then
  SHOP_COUNT=$(sqlite3 "$DATA_DIR/registry.db" "SELECT COUNT(*) FROM shops;" 2>/dev/null || echo "0")
  USER_COUNT=$(sqlite3 "$DATA_DIR/registry.db" "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
  echo ""
  echo "   📁 Registry (registry.db):"
  echo "      Shops: $SHOP_COUNT"
  echo "      Users: $USER_COUNT"
fi

# Verificar shops
SHOP_DBS=$(find "$DATA_DIR/shops" -name "shop_*.db" 2>/dev/null | head -1)
if [[ -n "$SHOP_DBS" ]]; then
  PRODUCT_COUNT=$(sqlite3 "$SHOP_DBS" "SELECT COUNT(*) FROM products;" 2>/dev/null || echo "0")
  CUSTOMER_COUNT=$(sqlite3 "$SHOP_DBS" "SELECT COUNT(*) FROM customers;" 2>/dev/null || echo "0")
  ORDER_COUNT=$(sqlite3 "$SHOP_DBS" "SELECT COUNT(*) FROM orders;" 2>/dev/null || echo "0")
  echo ""
  echo "   📁 Shop Databases (shops/):"
  echo "      Arquivos: $(find "$DATA_DIR/shops" -name "shop_*.db" | wc -l | tr -d ' ')"
  echo "      Products (per shop): $PRODUCT_COUNT"
  echo "      Customers (per shop): $CUSTOMER_COUNT"
  echo "      Orders (per shop): $ORDER_COUNT"
fi

echo ""
