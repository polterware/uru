## 1. Produtos (Products)

Criar uma tabela única que suporte **absolutamente qualquer produto** (de um alfinete a um ebook, de uma hora de consultoria a um caminhão de areia) exige uma abordagem híbrida.

Você não pode criar colunas para "Voltagem" ou "Tamanho da Manga", pois isso quebraria a normalização do banco quando você inserisse uma "Maçã".

A solução padrão da indústria (usada por Shopify, Magento, BigCommerce) é dividir em: **Colunas Rígidas** (o que todo produto tem) e **Colunas Flexíveis** (JSON/NoSQL para especificidades).

Aqui está a estrutura definitiva de colunas para esse cenário:

### 1. Identidade e Controle (Core)

Estas colunas são obrigatórias para qualquer item.

- `id` (UUID/Integer): Identificador único do sistema.
- `sku` (String): _Stock Keeping Unit_. O código único universal do produto (ex: "NIKE-AIR-BLK-42").
- `type` (Enum): Define o comportamento do produto.
- Values: `physical`, `digital`, `service`, `subscription`, `bundle`.

- `status` (Enum): Controle de visibilidade.
- Values: `draft`, `active`, `archived`, `out_of_stock`.

- `name` (String): O nome comercial do produto.
- `slug` (String): A URL amigável (ex: `tenis-nike-air`).
- `gtin_ean` (String): Código de barras global (EAN/UPC) – essencial para Google Shopping e marketplace.

### 2. Financeiro e Comercial

Preço e custo se aplicam a tudo.

- `price` (Decimal): O preço de venda base.
- `promotional_price` (Decimal): Preço "de/por" ou oferta.
- `cost_price` (Decimal): Custo de aquisição/produção (para cálculo de margem).
- `currency` (String): Código ISO da moeda (BRL, USD).
- `tax_code` (String): NCM (Brasil) ou HS Code (Global). Obrigatório para emitir nota fiscal e calcular impostos.

### 3. Logística e Dimensões (O "Envio")

Aqui resolvemos a questão de loja física vs. virtual.

- `is_shippable` (Boolean): Se `true`, exige cálculo de frete. Se `false` (serviço/digital), pula o checkout de envio.
- `weight_g` (Integer): Peso em gramas (usado para correios/transportadoras).
- `width_mm` (Integer): Largura.
- `height_mm` (Integer): Altura.
- `depth_mm` (Integer): Profundidade/Comprimento.
- `warehouse_location` (String): Onde está na loja física ou CD (ex: "Corredor B, Prateleira 4").

### 4. A "Mágica" Generalista (Onde tudo cabe)

Esta é a parte mais importante. Em vez de criar colunas, você usa um campo de dados semi-estruturados (JSONB no Postgres, JSON no MySQL).

- `attributes` (JSONB): Armazena as características específicas que variam por categoria.
- _Exemplo Camiseta:_ `{"color": "Azul", "size": "M", "material": "Algodão"}`
- _Exemplo Celular:_ `{"storage": "128GB", "ram": "8GB", "screen": "6.1"}`
- _Exemplo Comida:_ `{"flavor": "Laranja", "calories": "150kcal", "vegan": true}`

- `metadata` (JSONB): Dados técnicos ocultos ou integrações.
- Ex: `{"supplier_id": 99, "google_category_id": 155, "download_url": "s3://..."}`

### 5. Relacionamento e Variação (Pai/Filho)

Para lidar com o problema da "Camiseta que tem P, M e G".

- `parent_id` (FK): Aponta para o produto "pai" se este for uma variação. Se for nulo, é um produto principal.
- `brand_id` (FK): Relacionamento com tabela de marcas.
- `category_id` (FK): Relacionamento com tabela de categorias.

---

### Exemplo de SQL (PostgreSQL)

Aqui está como isso ficaria na prática, cobrindo todos os cenários:

```sql
CREATE TABLE products (
    -- Identidade
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('physical', 'digital', 'service', 'bundle')),
    status VARCHAR(20) DEFAULT 'draft',
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    gtin_ean VARCHAR(20),

    -- Financeiro
    price DECIMAL(10, 2) NOT NULL,
    promotional_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    currency CHAR(3) DEFAULT 'BRL',
    tax_ncm VARCHAR(20), -- Fiscal

    -- Logística
    is_shippable BOOLEAN DEFAULT TRUE,
    weight_g INTEGER DEFAULT 0,
    width_mm INTEGER DEFAULT 0,
    height_mm INTEGER DEFAULT 0,
    depth_mm INTEGER DEFAULT 0,

    -- Dados Flexíveis (A chave do generalismo)
    attributes JSONB, -- Ex: {"cor": "Vermelho", "voltagem": "220v"}
    metadata JSONB,   -- Ex: {"link_download": "..."}

    -- Organização
    category_id UUID,
    brand_id UUID,
    parent_id UUID REFERENCES products(id), -- Para variações (SKUs filhos)

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

```

### Por que essa estrutura funciona para tudo?

1. **Loja Física:** Usa o campo `sku` para bipar no caixa e o `tax_ncm` para a nota fiscal.
2. **Loja Virtual (Produto Físico):** Usa `weight_g` e dimensões para calcular frete nos Correios/Transportadora.
3. **Produto Digital (Ebook/Curso):** `is_shippable` é `false`, `weight_g` é 0, e o link de entrega fica dentro de `metadata` ou uma tabela auxiliar de entregáveis.
4. **Produtos Complexos:** Se for um computador, as 50 especificações técnicas vão para o JSON `attributes`, sem sujar o banco de dados.

---
