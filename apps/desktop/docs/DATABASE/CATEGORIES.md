## 14. Categorias (Categories)

A tabela **`categories`** (ou `collections`, `taxonomies`) é a espinha dorsal da navegação. Ela define como o cliente encontra o produto.

Em um sistema **super generalista**, a categoria não pode ser apenas uma lista estática. Ela precisa resolver três problemas complexos:

1. **Hierarquia (Árvore):** Categorias dentro de categorias (Ex: Eletrônicos > Celulares > Acessórios).
2. **SEO e Landing Pages:** Categorias são páginas de destino poderosas para o Google.
3. **Coleções Inteligentes (Smart Categories):** Listas que se preenchem sozinhas (Ex: "Promoção de Verão" que puxa tudo com tag 'verao' e preço < 50).

Aqui está a modelagem definitiva para `categories`.

---

### 1. Estrutura de Árvore (Hierarquia)

O segredo de uma categoria é saber quem é o "Pai" dela.

- `id` (UUID): Chave primária.
- `shop_id` (UUID): Contexto da loja.
- `parent_id` (UUID - Auto-referência): O campo mais importante.
- Se for `NULL`, é uma **Categoria Raiz** (Ex: "Roupas").
- Se tiver um ID, é uma **Subcategoria** (Ex: "Masculino" aponta para "Roupas").
- _Isso permite criar árvores infinitas:_ Roupas > Masculino > Camisas > Manga Longa.

### 2. Identidade e SEO

- `name` (String): O nome visível no menu ("Camisetas").
- `slug` (String): A URL (`camisetas-masculinas`). Deve ser único dentro da loja.
- `description` (Text): Texto curto para o cabeçalho da página (ajuda no SEO e contexto).

### 3. Aparência e Mídia

Categorias modernas têm imagens ricas.

- `image_url` (Text): O "Thumbnail". Usado quando a categoria aparece numa lista de bolinhas na Home.
- `banner_url` (Text): A imagem "Hero". Usada no topo da página da categoria para dar destaque.

### 4. O Cérebro: Manual vs. Automática (`type`)

Aqui elevamos o nível do sistema.

- `type` (Enum):
- `manual`: Você escolhe produto por produto e diz "Este vai na categoria X".
- `automated` (Smart): A categoria se popula sozinha baseada em regras.

- `rules` (JSONB): Se for automática, aqui ficam as condições.
- Exemplo: `[{"column": "price", "operator": "less_than", "value": "100"}, {"column": "tag", "operator": "equals", "value": "oferta"}]`.
- _Resultado:_ Uma categoria chamada "Ofertas Baratas" que se atualiza sozinha sempre que você cadastra um produto barato.

### 5. Controle e Navegação

- `is_visible` (Boolean): Se aparece no menu ou se é uma categoria oculta (Ex: usada apenas para descontos internos).
- `sort_order` (Integer): Para o lojista decidir que "Camisetas" vem antes de "Calças" no menu.
- `template_suffix` (String): Para desenvolvedores de temas.
- Se preenchido (ex: `grid-large`), o frontend carrega um layout diferente para essa categoria específica.

---

### SQL Definitive (PostgreSQL)

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES shops(id),

    -- O Segredo da Hierarquia (Adjacency List)
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,

    -- Identidade
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,

    -- Visual
    image_url TEXT, -- Ícone/Thumb
    banner_url TEXT, -- Capa Grande

    -- Lógica de Preenchimento
    type VARCHAR(20) DEFAULT 'manual', -- manual, automated
    rules JSONB DEFAULT '[]',
    -- Ex: [{"field": "price", "relation": "less_than", "condition": "50"}]

    -- Controle
    is_visible BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,

    -- SEO
    seo_title VARCHAR(255),
    seo_description TEXT,

    -- Metadados e Frontend
    template_suffix VARCHAR(50), -- 'sale-landing', 'grid-minimal'
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (shop_id, slug)
);

-- Tabela de Ligação (Apenas para categorias MANUAIS)
-- Se a categoria for 'automated', você não usa essa tabela, usa uma query dinâmica.
CREATE TABLE product_categories (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0, -- Ordem do produto DENTRO da categoria
    PRIMARY KEY (product_id, category_id)
);

```

---

### Por que essa estrutura é "Generalista" e "Open Source"?

#### 1. Árvore de Navegação vs. Coleções de Marketing

Com essa estrutura, você atende dois casos de uso distintos com a mesma tabela:

- **Taxonomia (Pai/Filho):** Cria a árvore "Eletrônicos > Som > Fones". Isso organiza o site.
- **Coleções (Landing Pages):** Cria uma categoria sem `parent_id` chamada "Dia dos Namorados". Ela não faz parte da árvore oficial, mas serve para campanhas de marketing.

#### 2. O Poder do `parent_id`

Em sistemas simples, categorias são listas soltas. Em sistemas profissionais, elas formam **Breadcrumbs** (Trilhas de Migalhas).

- Ao visitar a categoria "Fones", o sistema olha o `parent_id`, acha "Som", olha o `parent_id`, acha "Eletrônicos".
- Resultado visual no site: `Home / Eletrônicos / Som / Fones`.

#### 3. Categoria Inteligente (Automated)

Isso é um recurso "Enterprise" que você entrega no Open Source.

- Imagine um dono de loja que quer uma aba "Novidades".
- Em vez de adicionar manualmente todo produto novo lá, ele cria uma categoria Automática com regra: `created_at > (HOJE - 30 DIAS)`.
- O sistema faz o resto.

#### 4. Ordenação Visual (`position` na tabela pivô)

Note a tabela `product_categories`. Ela tem um campo `position`.
Isso permite "Merchandising Visual". O lojista pode arrastar e soltar os produtos para dizer: "Quero que este tênis vermelho seja o primeiro da lista, mesmo que não seja o mais novo".

### Dica de Performance (Hierarquia)

Para ler essa árvore (ex: pegar todos os filhos e netos de uma categoria), no PostgreSQL você usará uma query **Recursive CTE**. É performático e padrão da indústria para esse tipo de tabela.
