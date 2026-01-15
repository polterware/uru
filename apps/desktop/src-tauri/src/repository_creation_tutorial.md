# Tutorial de Criação de Repositórios (Best Practices)

Este guia define o padrão ouro para implementação de repositórios Rust no `src-tauri`, combinando segurança, tipagem e consistência.

## O Padrão "Hybrid Safety"

Devemos combinar o melhor de 4 abordagens para garantir código robusto:

1.  **Tipagem Automática**: Usar `query_as` para mapear o retorno do banco direto para Structs.
2.  **Consistência de Dados**: Usar `RETURNING *` no SQL para garantir que o objeto em memória reflete exatamente o estado do banco (ex: datas geradas, defaults).
3.  **Segurança de Binds**: Usar parâmetros numerados (`$1`, `$2`...) em vez de posicionais (`?`) para evitar erros silenciosos ao alterar a ordem dos campos.
4.  **Organização**: Separar o SQL em uma variável string `let sql = ...` para manter a legibilidade do código Rust quando houver muitas colunas.

## Exemplo Prático: Método `create`

```rust
pub async fn create(&self, item: Item) -> Result<Item> {
    // 1. SQL Separado e Legível
    // Note o uso de raw string (r#""#) para suportar múltiplas linhas sem sujeira
    let sql = r#"
        INSERT INTO items (
            id, name, price, status, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6) -- 2. Parâmetros Numerados ($1, $2...)
        RETURNING *                     -- 3. Retorno da Verdade do Banco
    "#;

    // 4. query_as para Tipagem Forte
    sqlx::query_as::<_, Item>(sql)
        .bind(item.id)          // $1 -> Garante que ID vai para o $1, independente da ordem visual
        .bind(item.name)        // $2
        .bind(item.price)       // $3
        .bind(item.status)      // $4
        .bind(item.created_at)  // $5
        .bind(item.updated_at)  // $6
        .fetch_one(&self.pool)
        .await
}
```

## Exemplo Prático: Método `update`

```rust
pub async fn update(&self, item: Item) -> Result<Item> {
    let sql = r#"
        UPDATE items SET
            name = $2,
            price = $3,
            status = $4,
            updated_at = $5
        WHERE id = $1           -- $1 usado no WHERE, mas pode ser o primeiro bind!
        RETURNING *
    "#;

    sqlx::query_as::<_, Item>(sql)
        .bind(item.id)          // $1 -> Vinculado ao WHERE id = $1
        .bind(item.name)        // $2
        .bind(item.price)       // $3
        .bind(item.status)      // $4
        .bind(item.updated_at)  // $5
        .fetch_one(&self.pool)
        .await
}
```

## Comparativo: Por que mudar?

| Abordagem               | Problema Resolvido                                                                                        |
| :---------------------- | :-------------------------------------------------------------------------------------------------------- |
| **`sqlx::query_as`**    | Evita `row.get("col")` manual e erros de digitação de nomes de colunas.                                   |
| **`RETURNING *`**       | Garante que dados gerados pelo banco (Triggers, Auto-increment, Defaults) voltem para o Rust atualizados. |
| **`$1, $2 (Numbered)`** | Evita bugs críticos onde dados são salvos na coluna errada se a ordem mudar no SQL ou no Bind.            |
| **`let sql = ...`**     | Melhora drasticamente a leitura (Code Cleanliness) quando a query tem muitas colunas (20+).               |
