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
