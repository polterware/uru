# Status de Desenvolvimento - Frontend CRUDs

Este documento rastreia o status de implementação das funcionalidades CRUD para cada domínio do sistema.

**Legenda:**
- ✅ Implementado
- 🔄 Em progresso
- ❌ Pendente
- ➖ Não aplicável

---

## CRUD Completo (Rotas Dedicadas)

| Domínio | UI Table | List (Backend) | Create | Update | Delete (soft) | Filtros/Paginação | FK Navigation |
|---------|----------|----------------|--------|--------|---------------|-------------------|---------------|
| Products | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ (Brand) |
| Brands | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Categories | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Customers | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Sub-CRUDs de Customers

| Sub-Domínio | UI Table | List (Backend) | Create | Update | Delete |
|-------------|----------|----------------|--------|--------|--------|
| customer_addresses | ❌ | ❌ | ❌ | ❌ | ❌ |
| customer_group_memberships | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## CRUD Parcial

| Domínio | UI Table | List (Backend) | Create | Update | Status Actions | Delete (soft) | Filtros/Paginação | FK Navigation |
|---------|----------|----------------|--------|--------|----------------|---------------|-------------------|---------------|
| Transactions | ✅ | ❌ | ❌ | ➖ | ❌ | ➖ | ❌ | ❌ |
| Orders | ✅ | ❌ | ❌ | ➖ | ❌ | ➖ | ❌ | ❌ |
| Payments | ✅ | ❌ | ❌ | ➖ | ❌ | ➖ | ❌ | ❌ |
| Refunds | ✅ | ❌ | ❌ | ➖ | ❌ | ➖ | ❌ | ❌ |
| Checkouts | ✅ | ❌ | ❌ | ➖ | ❌ | ➖ | ❌ | ❌ |

### Sub-CRUDs de Transactions

| Sub-Domínio | UI Table | List (Backend) | Create | Update | Delete |
|-------------|----------|----------------|--------|--------|--------|
| transaction_items | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Estoque

| Domínio | UI Table | List (Backend) | Create | Update | Delete | Ajuste via Movements | Filtros/Paginação | FK Navigation |
|---------|----------|----------------|--------|--------|--------|----------------------|-------------------|---------------|
| Inventory | ✅ | ❌ | ➖ | ➖ | ➖ | ❌ | ❌ | ❌ |
| Movements | ✅ | ❌ | ❌ | ➖ | ➖ | ➖ | ❌ | ❌ |

---

## Analytics

| Funcionalidade | Backend | Frontend |
|----------------|---------|----------|
| get_dashboard_stats | ✅ | ✅ |
| get_stock_movements | ✅ | ✅ |
| Time ranges (30m, 1h, 2h, 7d, 30d, 90d, 1y, all) | ✅ | ✅ |

---

## Funcionalidades Transversais

| Funcionalidade | Status |
|----------------|--------|
| Soft delete (_status = 'deleted') | ✅ (Products) |
| Campos JSON (metadata, attributes) com validação | 🔄 (Products - sem validação) |
| Campos TEXT[] como tags | ❌ |
| Select com busca para FKs | ✅ (Products - Brand) |
| Campos obrigatórios sinalizados na UI | ✅ (Products) |

---

## Resumo por Prioridade

### Alta Prioridade - List (integração backend)
| Item | Domínio | Status |
|------|---------|--------|
| List (backend) | Products | ✅ |
| List (backend) | Brands | ❌ |
| List (backend) | Categories | ❌ |
| List (backend) | Customers | ❌ |
| List (backend) | Inventory | ❌ |
| List (backend) | Movements | ❌ |
| List (backend) | Transactions | ❌ |
| List (backend) | Orders | ❌ |
| List (backend) | Payments | ❌ |
| List (backend) | Refunds | ❌ |
| List (backend) | Checkouts | ❌ |

### Alta Prioridade - Formulários CRUD Completo
| Item | Domínio | Status |
|------|---------|--------|
| Formulário de criação | Products | ✅ |
| Formulário de edição | Products | ✅ |
| Formulário de criação | Brands | ❌ |
| Formulário de edição | Brands | ❌ |
| Formulário de criação | Categories | ❌ |
| Formulário de edição | Categories | ❌ |
| Formulário de criação | Customers | ❌ |
| Formulário de edição | Customers | ❌ |

### Média Prioridade - Formulários CRUD Parcial
| Item | Domínio | Status |
|------|---------|--------|
| Formulário de criação | Transactions | ❌ |
| Formulário de criação | Orders | ❌ |
| Formulário de criação | Payments | ❌ |
| Formulário de criação | Refunds | ❌ |
| Formulário de criação | Checkouts | ❌ |
| Ações de status | Transactions | ❌ |
| Ações de status | Orders | ❌ |
| Ações de status | Payments | ❌ |
| Ações de status | Refunds | ❌ |
| Ações de status | Checkouts | ❌ |
| Ajuste de estoque | Movements | ❌ |

### Baixa Prioridade
| Item | Domínio | Status |
|------|---------|--------|
| Sub-CRUD | customer_addresses | ❌ |
| Sub-CRUD | customer_group_memberships | ❌ |
| Sub-CRUD | transaction_items | ❌ |
| Filtros/Ordenação/Paginação backend | Todos | ❌ |
| Navegação por FKs | Todos | ❌ |

---

## Notas

- **UI Table**: Estrutura da tabela (colunas, componente) existe, mas com `data = []`
- **List (Backend)**: Integração real com Tauri/SQLite para buscar dados
- Todas as tabelas atualmente mostram "No X found" pois não há dados do backend

---

## Changelog

| Data | Alteração |
|------|-----------|
| 2026-01-17 | Implementado CRUD completo de Products (List, Create, Update, Delete, FK Navigation) |
| 2026-01-17 | Corrigido status: UI Tables existem mas List (backend) está pendente |
| 2026-01-17 | Documento criado com status inicial |

