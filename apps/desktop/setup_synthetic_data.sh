#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_DIR="$ROOT_DIR/scripts/python"
VENV_DIR="$PYTHON_DIR/.venv"
DB_DIR="$HOME/Library/Application Support/com.tauri.dev"
DB_PATH="$DB_DIR/inventy.db"
SCHEMA_PATH="$ROOT_DIR/src-tauri/migrations/001_initial_schema.sql"
SCRIPT_PATH="$PYTHON_DIR/generate_synthetic_data.py"

if [[ ! -f "$SCRIPT_PATH" ]]; then
  echo "Erro: script nao encontrado em $SCRIPT_PATH"
  exit 1
fi

if [[ ! -f "$SCHEMA_PATH" ]]; then
  echo "Erro: schema nao encontrado em $SCHEMA_PATH"
  exit 1
fi

echo "==> Criando venv em $VENV_DIR"
python3 -m venv "$VENV_DIR"

echo "==> Ativando venv"
source "$VENV_DIR/bin/activate"

echo "==> Instalando dependencias"
pip install --upgrade pip
pip install faker

echo "==> Aplicando schema no banco"
mkdir -p "$DB_DIR"
sqlite3 "$DB_PATH" < "$SCHEMA_PATH"

echo "==> Gerando dados sinteticos"
python "$SCRIPT_PATH" --db-path "$DB_PATH" --seed 42

echo "==> Concluido"
