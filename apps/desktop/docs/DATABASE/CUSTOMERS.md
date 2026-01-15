## 8. Clientes (Customers)

Para completar a nossa arquitetura "super generalista", o **Cliente** (Customer) talvez seja a entidade mais mal compreendida.

O erro comum é tratar Cliente apenas como uma "Pessoa Física com CPF". Mas e se o cliente for uma **Empresa** (B2B)? E se for uma **ONG**? E se for um **Departamento do Governo**? E se for um **Hóspede** que compra anonimamente?

Para ser universal, a tabela de clientes precisa separar **Acesso (Login)** de **Identidade (Perfil)** e **Contexto (Comportamento)**.

Aqui está a modelagem definitiva para `customers`.

---

### 1. A Estrutura Base: Pessoas e Organizações

A primeira grande decisão: **Pessoa Física vs. Jurídica**.
Em vez de tabelas separadas, usamos uma única tabela com "estratégia de camaleão".

```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tipo Fundamental
    type VARCHAR(20) NOT NULL DEFAULT 'individual',
    -- 'individual' (B2C), 'business' (B2B), 'government', 'organization'

    -- Identidade Base
    email VARCHAR(255) UNIQUE, -- Chave principal de contato (pode ser NULL para clientes de loja física anônimos)
    phone VARCHAR(50), -- Com DDI (+55...)

    -- O Camaleão (Nomes)
    first_name VARCHAR(100), -- "João" ou NULL se for empresa
    last_name VARCHAR(100),  -- "Silva" ou NULL se for empresa
    company_name VARCHAR(255), -- "Tech Solutions Ltda" ou NULL se for pessoa

    -- Documentos (O pesadelo global resolvido)
    tax_id VARCHAR(50), -- O número em si (CPF, CNPJ, SSN, VAT ID)
    tax_id_type VARCHAR(20), -- O tipo (br_cpf, br_cnpj, us_ssn, eu_vat)
    state_tax_id VARCHAR(50), -- Inscrição Estadual (Para B2B)

    -- Gestão de Conta
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, blocked, guest (não tem login)
    currency CHAR(3) DEFAULT 'BRL', -- Moeda preferida
    language CHAR(2) DEFAULT 'pt', -- Idioma preferido (en, es)

    -- Marketing e Segmentação
    tags TEXT[], -- ["vip", "bad_payer", "wholesale", "influencer"]
    accepts_marketing BOOLEAN DEFAULT FALSE,

    -- Grupos e Segmentos
    customer_group_id UUID, -- Link para tabela de grupos (Ex: "Revendedores Ouro" que têm 10% off)

    -- Métricas Acumuladas (Cache para performance)
    total_spent DECIMAL(15, 2) DEFAULT 0, -- LTV (Lifetime Value)
    orders_count INTEGER DEFAULT 0,
    last_order_at TIMESTAMP,

    -- Extensibilidade
    notes TEXT, -- "Cliente chato, cuidado", "Prefere ser chamado de Dr."
    metadata JSONB, -- IDs externos, integração ERP
    custom_attributes JSONB, -- "Data de Aniversário", "Nome do Cão", "Time de Futebol"

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

```

---

### 2. Aprofundando nos Atributos Generalistas

#### A. O "Camaleão" de Nomes

- **B2C (Varejo):** Preenche `first_name` e `last_name`. `company_name` fica NULL.
- **B2B (Atacado):** Preenche `company_name`. Pode usar `first_name` para o "Nome do Comprador/Representante".
- **Nome de Exibição:** No backend (código), você cria um _getter_ virtual:

```javascript
get displayName() {
    return this.company_name || `${this.first_name} ${this.last_name}`;
}

```

#### B. Documentos Globais (`tax_id`)

Nunca crie colunas chamadas `cpf` ou `cnpj`. Se sua empresa expandir para a Argentina amanhã, você terá que criar `dni`.

- **Solução:** Par `valor` + `tipo`.
- Exemplo Brasil: `tax_id: "123.456.789-00"`, `tax_id_type: "br_cpf"`.
- Exemplo Europa: `tax_id: "DE123456789"`, `tax_id_type: "eu_vat"`.
- Isso permite validação dinâmica baseada no tipo.

#### C. O Cliente "Guest" (Convidado)

Muitos clientes compram sem criar senha.

- Eles existem na tabela `customers`? **Sim.**
- O campo `status` é marcado como `guest`.
- Se amanhã ele decidir "criar conta" usando o mesmo e-mail, você apenas muda o status para `active` e define uma senha na tabela de autenticação (separada). O histórico de compras é preservado!

---

### 3. Tabela Satélite: `customer_addresses`

Clientes têm múltiplos endereços. Nunca coloque endereço na tabela principal.

```sql
CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),

    -- Rótulo
    type VARCHAR(20) DEFAULT 'shipping', -- shipping, billing, both
    is_default BOOLEAN DEFAULT FALSE,

    -- Dados
    first_name VARCHAR(100), -- Quem recebe pode ser diferente do dono da conta
    last_name VARCHAR(100),
    company VARCHAR(100),

    address1 VARCHAR(255), -- Rua, Número
    address2 VARCHAR(255), -- Complemento
    city VARCHAR(100),
    province_code VARCHAR(10), -- SP, RJ, CA, NY
    country_code CHAR(2), -- BR, US
    postal_code VARCHAR(20), -- CEP
    phone VARCHAR(50), -- Telefone específico deste local

    metadata JSONB -- "Portão azul", "Deixar na portaria"
);

```

### 4. Tabela de Relacionamentos B2B (A "Hierarquia")

Se você vende para empresas grandes, o "Cliente" é a Coca-Cola, mas quem compra é o "João".

Você pode resolver isso adicionando um `parent_id` na tabela `customers` (Auto-relacionamento).

- **Coca-Cola Matriz (ID 1):** `type=business`, `parent_id=null`.
- **Coca-Cola Filial Sul (ID 2):** `type=business`, `parent_id=1`.
- **João Comprador (ID 3):** `type=individual`, `parent_id=2` (Vinculado à filial).

Isso permite relatórios: "Quanto a Coca-Cola inteira gastou?" (Soma recursiva).

---

### 5. Dados Comportamentais vs. Cadastrais

Um erro comum é misturar o que o cliente **é** com o que o cliente **faz**.

- **O que ele é (Tabela Customers):** Nome, CPF, E-mail.
- **O que ele faz (Métricas/Tags):**
- Não calcule LTV (Lifetime Value) toda vez que abrir o painel.
- Use os campos cacheados `total_spent` e `orders_count`.
- Toda vez que uma `Order` muda para `paid`, um gatilho (trigger ou job) incrementa esses campos no Cliente.
- Isso permite filtros instantâneos: _"Mostre clientes que gastaram mais de R$ 5.000"_.

### 6. Casos de Uso Generalistas

1. **Marketplace / Multi-loja:**

- Se você tem várias lojas, o cliente é único ou por loja?
- Geralmente, adiciona-se `store_id` (se for isolado) ou mantém global (se for SSO - Single Sign On).

2. **Influenciador (Affiliate):**

- O cliente também pode ser um parceiro.
- Use `tags` ("influencer") e `metadata` (`{"commission_rate": 0.10, "coupon_code": "JOAO10"}`).

3. **Cliente "Sujo" (Legado):**

- Importou dados de um sistema velho e faltam campos?
- O schema é flexível (quase tudo é _nullable_), exceto o ID.
- Use `notes` para documentar a importação: "Importado do SAP em 2024".

### Resumo da Arquitetura de Cliente

- **Cliente:** Quem é (Entidade Legal).
- **Endereços:** Onde ele está.
- **User/Auth (Tabela Externa):** Credenciais de login (Senha, 2FA). _Não misture senha na tabela de cliente!_
- **Grupos:** Regras de negócio (Atacado, Varejo, VIP).

## Essa estrutura permite que o mesmo registro no banco represente um adolescente comprando um tênis ou uma multinacional comprando 10 mil licenças de software.
