# Tutorial de Criação de Serviços (Best Practices)

Este guia define o padrão para a implementação da **Camada de Serviço (Services)** no backend Rust do projeto. Enquanto os Repositórios lidam com o "COMO" salvar (SQL), os Serviços lidam com o "O QUE" salvar (Regras de Negócio).

## Responsabilidades do Serviço

Conforme definido em `ARCHITECTURE.md` e nos padrões do projeto, o Serviço é a barreira de integridade antes dos dados chegarem ao banco.

### 1. Preparação de Dados (Data Marshalling)

O SQLite é _type-less_ em muitos aspectos e não possui tipos nativos para UUIDs, JSON ou Arrays. O Serviço deve **transformar** dados ricos em tipos primitivos compatíveis com o banco **antes** de chamar o Repositório.

| Tipo Conceitual | Tipo no Repositório (SQLite) | Responsabilidade do Serviço                                           |
| :-------------- | :--------------------------- | :-------------------------------------------------------------------- |
| **UUID**        | `String`                     | Gerar `Uuid::new_v4().to_string()` para novos registros.              |
| **JSON Object** | `String`                     | Serializar objetos Rust/DTOs usando `serde_json::to_string()`.        |
| **Array**       | `String`                     | Serializar vetores para JSON String ou CSV manual (preferência JSON). |
| **Date**        | `DateTime<Utc>`              | Gerar timestamps com `Utc::now()` ou converter datas de input.        |

### 2. Geração de IDs e Timestamps

Nunca delegue a criação de IDs primários ou timestamps críticos para o banco de dados se isso impactar a sincronização.

- Gere o ID no Service para garantir que você já o tenha para retornar ao frontend sem "round-trip" desnecessário ou para usar em transações complexas.
- Use `Utc::now()` para garantir consistência de fuso horário.

## Exemplo Prático de Implementação

Imagine um cenário de criação de Produto (`CreateProductDTO` vem do Frontend/Command).

```rust
use uuid::Uuid;
use chrono::Utc;
use serde_json;
use crate::models::product::Product;
use crate::repositories::product::ProductRepository;

pub struct ProductService {
    repo: ProductRepository,
}

impl ProductService {
    pub async fn create_product(&self, dto: CreateProductDTO) -> Result<Product, ServiceError> {
        // 1. Geração de UUID
        let new_id = Uuid::new_v4().to_string();

        // 2. Serialização de Tipos Complexos (JSON -> String)
        let metadata_json = match dto.metadata {
            Some(data) => Some(serde_json::to_string(&data)?),
            None => None,
        };

        // 3. Montagem do Modelo (Domain Entity)
        let product = Product {
            id: new_id,
            name: dto.name,
            // ... outros campos simples ...

            // Tratamento de tipos especiais
            metadata: metadata_json,

            // 4. Garantia de UTC e Campos de Controle
            created_at: Some(Utc::now()),
            updated_at: Some(Utc::now()),
            sync_status: Some("created".to_string()), // Marcado para Sync

            // Campos opcionais/defaults
            ..Default::default()
        };

        // 5. Persistência via Repositório
        let created_product = self.repo.create(product).await?;

        Ok(created_product)
    }
}
```

## Checklist de Validação

Antes de considerar um Serviço pronto, verifique:

- [ ] **UUID Gerado?**: Eu gerei o ID explicitamente ou estou confiando na sorte?
- [ ] **UTC Always?**: Estou usando `Utc::now()` em vez de `Local::now()`?
- [ ] **Serialização?**: Todos os campos `JSONB` ou `TEXT[]` previstos na arquitetura foram serializados para `String`?
- [ ] **Sync Status?**: Para novos registros, definiu `_status = 'created'`? Para atualizações, mudou para `'updated'`?

## Por que colocar isso no Service e não no Model ou Repo?

1.  **Repo Pureza**: O Repositório deve apenas "executar SQL". Ele não deve decidir qual ID usar ou qual a hora atual.
2.  **Testabilidade**: É mais fácil testar regras de negócio (ex: "não pode criar produto sem nome") no Service sem precisar de um banco de dados real.
3.  **Compatibilidade**: Se um dia trocarmos o banco (ex: para Postgres real em Cloud), o Serviço continua gerando UUIDs e JSONs da mesma forma, apenas o driver do Repo muda.
