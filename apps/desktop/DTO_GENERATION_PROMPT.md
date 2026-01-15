# Prompt de Refatoração: Definição de DTOs para Commands Tauri

Este documento serve como um guia/prompt para a criação da camada de **DTOs (Data Transfer Objects)**, garantindo uma comunicação limpa e tipada entre o Frontend e o Backend (Commands) do Inventy.

---

## 🎯 Objetivo

Criar structs em Rust que representem o formato exato dos dados enviados pelo Frontend. Isso evita que o Frontend precise conhecer detalhes internos do banco de dados (como campos de sincronização ou auditoria).

---

## 🤖 Prompt para IA (Copiar e Colar)

> **Tarefa**: Criar a camada de DTOs para o projeto Tauri/Rust do Inventy.
>
> **Instruções de Estrutura**:
>
> 1.  Crie os arquivos em `src-tauri/src/dtos/`.
> 2.  Crie um `mod.rs` para exportar todos os DTOs.
> 3.  Cada DTO deve usar `#[derive(Debug, Serialize, Deserialize)]`.
>
> **Diretrizes de Design**:
>
> - **Campos de Entrada**: Inclua apenas o que o Frontend envia. Remova campos gerados pelo backend como `_status`, `created_at`, `updated_at`.
> - **Obrigatoriedade**: Use `Option<T>` para campos que podem ser nulos ou omitidos no formulário.
> - **Agregados**: O DTO deve conter as entidades filhas. Por exemplo, `CreateProductDTO` deve ter um campo `categories: Vec<CreateProductCategoryDTO>`.
>
> **Entidades Solicitadas**:
>
> 1.  **Product**:
>     - `CreateProductDTO`: Todos os dados de `Product` + `categories`.
>     - `UpdateProductDTO`: Id obrigatório + campos opcionais para patch.
> 2.  **Customer**:
>     - `CreateCustomerDTO`: Dados de `Customer` + `addresses` + `group_ids`.
> 3.  **Transaction**:
>     - `CreateTransactionDTO`: Dados de cabeçalho + `items` (apenas `product_id` e `quantity`).
> 4.  **Shipment**:
>     - `CreateShipmentDTO`: Dados de envio + `items`.
> 5.  **User**:
>     - `CreateUserDTO`: Dados de cadastro + `role_ids`.
> 6.  **Inquiry**:
>     - `CreateInquiryDTO`: Dados do chamado + `first_message`.
>
> **Métodos de Conversão**:
> Para cada DTO, implemente um método `pub fn into_models(self) -> (MainModel, Vec<DependentModel>)` que:
>
> - Gere um `Uuid` (ou receba um do front).
> - Configure campos padrão (`_status: "created"`, `created_at: Utc::now()`).
> - Retorne as structs prontas para serem enviadas aos **Repositories**.
>
> **Resultado Esperado**:
>
> - Código limpo, tipado e pronto para ser usado nos `#[tauri::command]`.
