---

## 13. Marcas (Brands)

A tabela **`brands`** (ou `manufacturers`) parece simples à primeira vista ("é só o nome do fabricante, certo?"), mas em um sistema **super generalista e Open Source**, ela desempenha um papel duplo crucial:

1. **Filtro de Catálogo:** Ajuda o cliente a achar "Tênis da Nike".
2. **Página de Marketing (Landing Page):** Gera uma página exclusiva (`/marcas/sony`) que serve para SEO e para contar a história daquela marca dentro da sua loja.

Se você estiver construindo um marketplace ou uma loja de departamento, a Marca é uma entidade quase tão importante quanto o Produto.

Aqui está a modelagem definitiva para `brands`.

---

### 1. Identidade e URL (SEO First)

- `id` (UUID): Chave primária.
- `shop_id` (UUID): **Vital.** Mesmo sendo Open Source/Single Tenant, manter o vínculo com a loja (`shops`) permite que, no futuro, você tenha marcas diferentes para "sub-lojas" ou contextos diferentes na mesma instalação.
- `name` (String): O nome visível ("Samsung").
- `slug` (String): A URL amigável (`samsung`). Deve ser única dentro da loja.
- _Uso:_ Permite criar rotas como `sualoja.com/br/marcas/samsung`.

### 2. Identidade Visual (O "Look and Feel")

Para ser generalista, a marca precisa ser bonita na interface.

- `logo_url` (Text): O logo, geralmente quadrado ou retangular pequeno.
- `banner_url` (Text): Uma imagem "Hero" (grande, wide) para o cabeçalho da página da marca.
- _Exemplo:_ Ao clicar em "Apple", o topo da página mostra produtos Apple com uma foto lifestyle bonita no fundo.

### 3. Conteúdo Rico (Storytelling)

- `description` (Text): Um resumo curto para meta tags ou listas (Ex: "Eletrônicos de alta performance").
- `rich_description` (Text/HTML/Markdown): Aqui entra o "Sobre a Marca".
- _Uso:_ Pode conter vídeos, história da fundação, tabelas de garantia. É o conteúdo principal da Landing Page da marca.

- `website_url` (Text): Link para o site oficial do fabricante (útil para "Mais informações").

### 4. Controle e Destaque

- `status` (Enum): `active`, `archived`.
- _Cenário:_ Você parou de vender "Kodak", mas não quer quebrar os links antigos ou o histórico de pedidos. Você arquiva.

- `is_featured` (Boolean): Se essa marca deve aparecer no carrossel "Nossas Marcas Favoritas" na Home.

### 5. Metadados e Flexibilidade (`metadata` JSONB)

Como sempre, o segredo do generalismo.

- `social_links`: `{"instagram": "@nike", "twitter": "..."}`.
- `settings`: `{"show_warranty_info": true, "official_distributor": true}`.
- _Official Distributor:_ Um selo visual para dizer "Somos revendedores autorizados".

---

### SQL Definitive (PostgreSQL)

```sql
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES shops(id), -- Contexto da loja

    -- Identidade Base
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL, -- Indexado para buscas rápidas na URL

    -- Visual
    logo_url TEXT, -- URL da imagem do logo (SVG/PNG)
    banner_url TEXT, -- URL da imagem de capa da página da marca

    -- Conteúdo
    description TEXT, -- Texto simples (SEO description)
    rich_description TEXT, -- HTML/Markdown longo
    website_url VARCHAR(255), -- Site oficial

    -- Controle
    status VARCHAR(20) DEFAULT 'active', -- active, inactive
    is_featured BOOLEAN DEFAULT FALSE, -- Aparece na home?
    sort_order INTEGER DEFAULT 0, -- Para ordenar manualmente quem aparece primeiro

    -- SEO Avançado (Opcional, mas recomendado)
    seo_title VARCHAR(255), -- Title Tag específica
    seo_keywords TEXT[], -- Palavras-chave

    -- Extensibilidade
    metadata JSONB DEFAULT '{}',
    -- Ex: {
    --   "warranty_policy_url": "...",
    --   "support_phone": "0800...",
    --   "social": {"instagram": "..."}
    -- }

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Garante que não existam duas "Adidas" na mesma loja
    UNIQUE (shop_id, slug)
);

```

---

### Por que essa estrutura é "Generalista"?

#### 1. Cenário: Loja de Vinhos (Curadoria)

- **Nome:** "Casa Valduga".
- **Rich Description:** Conta a história da vinícola, o terroir, mostra fotos das uvas.
- **Banner:** Foto das parreiras.
- **Uso:** A marca aqui não é apenas um fabricante, é o _charme_ da venda.

#### 2. Cenário: Loja de Peças de Carro (Técnico)

- **Nome:** "Bosch".
- **Metadata:** `{"support_phone": "0800-BOSCH", "technical_catalog_pdf": "url..."}`.
- **Uso:** O cliente entra na página da marca para baixar manuais ou achar contato de suporte técnico.

#### 3. Cenário: Marketplace de Moda (Showcase)

- **Nome:** "Gucci".
- **Is Featured:** `true` (Fica no topo da Home).
- **Logo:** Preto e branco minimalista.
- **Uso:** A marca serve como um "Shop-in-Shop" (uma loja dentro da loja), agrupando todos os produtos daquela grife.

### Diferença entre `brands` e `suppliers` (Fornecedores)

É importante não confundir:

- **Brand (Marca):** Quem estampa o logo no produto (Ex: Apple). É **Público** (o cliente vê).
- **Supplier (Fornecedor):** De quem você comprou (Ex: Distribuidora XYZ Ltda). É **Privado** (só você vê).

Você pode vender um iPhone (Brand: Apple) que comprou de três fornecedores diferentes. Portanto, não misture os dados de contato comercial (CNPJ do fornecedor, prazo de pagamento) nesta tabela `brands`. Mantenha `brands` focado em **Marketing e Catálogo**.
