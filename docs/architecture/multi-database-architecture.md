# Multi-Database Architecture

> **Status**: Em planejamento
> **Última atualização**: 2026-01-23

## Visão Geral

Este documento descreve a arquitetura de múltiplos bancos de dados, onde cada shop pode ter seu próprio banco isolado, podendo ser **SQLite local** ou **Postgres remoto (Supabase)**.

## Motivação

1. **Isolamento de dados**: Cada shop tem seu próprio banco, eliminando a necessidade de filtrar por `shop_id` em todas as queries
2. **Flexibilidade**: Lojas podem escolher entre armazenamento local (offline-first) ou remoto (sync, backup)
3. **Performance**: Sem overhead de multi-tenancy em cada query
4. **Escalabilidade**: Shops de alto volume podem usar Supabase; pequenos usam SQLite local

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                      Tauri Application                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────────────────────────────┐    │
│  │   Central   │    │          Shop Database Layer         │    │
│  │  Registry   │    │                                      │    │
│  │   (SQLite)  │    │  ┌─────────────────────────────────┐ │    │
│  │             │    │  │      RepositoryFactory          │ │    │
│  │  - shops    │    │  │                                 │ │    │
│  │  - users    │    │  │  create_for_shop(shop) ─────┐   │ │    │
│  │  - modules  │    │  │                             │   │ │    │
│  │  - templates│    │  └─────────────────────────────│───┘ │    │
│  └──────┬──────┘    │                                │     │    │
│         │           │                                ▼     │    │
│         │           │  ┌──────────────┬──────────────────┐ │    │
│         │           │  │              │                  │ │    │
│         │           │  │  SQLite      │    Postgres      │ │    │
│         │           │  │  Strategy    │    Strategy      │ │    │
│         │           │  │              │                  │ │    │
│         │           │  └──────┬───────┴────────┬─────────┘ │    │
│         │           │         │                │           │    │
│         │           └─────────│────────────────│───────────┘    │
│         │                     │                │                │
│         ▼                     ▼                ▼                │
│  ┌─────────────┐       ┌───────────┐    ┌───────────────┐      │
│  │ registry.db │       │shop_1.db  │    │   Supabase    │      │
│  │  (SQLite)   │       │ (SQLite)  │    │  (Postgres)   │      │
│  └─────────────┘       └───────────┘    └───────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Estrutura de Arquivos SQL

| Arquivo                        | Descrição                               | Banco               |
| ------------------------------ | --------------------------------------- | ------------------- |
| `001_registry_schema.sql`      | Tabelas globais (shops, users, modules) | SQLite (sempre)     |
| `002_shop_schema_sqlite.sql`   | Tabelas de negócio por shop             | SQLite (local)      |
| `002_shop_schema_postgres.sql` | Tabelas de negócio por shop             | Postgres (Supabase) |

## Banco de Registro Central

Contém apenas informações sobre quais shops existem e como conectar a eles:

- `shops` - registro de lojas com `database_type` e `database_config`
- `users` - usuários globais
- `user_sessions` - sessões ativas
- `roles` e `user_roles` - permissões
- `modules` - catálogo de módulos disponíveis
- `shop_templates` - templates de loja

## Bancos por Shop

Cada shop tem um banco isolado contendo:

- `shop_config` - configurações, branding, features habilitadas
- Tabelas de negócio **sem `shop_id`** (isolamento físico)
- Triggers e índices específicos

## Decisões de Design

### Por que SQLite para Local?

- Zero dependências (embarcado)
- Funciona offline
- Backup = copiar arquivo
- Performance excelente para operações locais

### Por que Postgres/Supabase para Remoto?

- Features avançadas (JSONB, arrays nativos)
- Sync entre dispositivos
- Backup automático na nuvem
- Escalabilidade para shops maiores

### Injeção de Dependência

Os repositórios implementam traits (interfaces), permitindo que services e commands sejam agnósticos ao banco:

```rust
#[async_trait]
pub trait ProductRepository: Send + Sync {
    async fn create(&self, dto: CreateProductDto) -> Result<Product>;
    async fn list(&self) -> Result<Vec<Product>>;
    // ...
}

// Service recebe trait object
pub struct ProductService {
    repo: Arc<dyn ProductRepository>,
}
```

## Próximos Passos

Veja o plano de implementação detalhado em: `implementation_plan.md`

## Referências

- [SQLx - Multiple Database Support](https://github.com/launchbadge/sqlx)
- [Supabase - Self-Hosting](https://supabase.com/docs/guides/self-hosting)
- [Tauri Plugin Stronghold](https://v2.tauri.app/plugin/stronghold/)
