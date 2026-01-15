## 12. Lojas (Shops)

Se o projeto é **Open Source** e **sem assinatura (Self-Hosted)**, a função da tabela `shops` muda drasticamente.

Ela deixa de ser uma tabela de "Gestão de Clientes Pagantes" (Billing/SaaS) e passa a ser uma tabela de **"Configuração da Instância"** ou **"Entidade Operacional"**.

Mesmo sendo open source, você deve manter essa tabela. **Por que?**

1. **Multi-Empresa:** Quem baixar seu software pode querer gerenciar 3 lojas diferentes (filiais) na mesma instalação.
2. **Configuração Centralizada:** É aqui que ficam as regras do negócio, separadas do código.

Aqui está a estrutura da tabela `shops` para um contexto Open Source/Self-Hosted:

---

### O Conceito: "Configuração em vez de Restrição"

Como não há planos (Basic vs Pro), não precisamos bloquear _features_. O foco é **customização** e **infraestrutura**.

### 1. Identidade e Acesso (Core)

- `id` (UUID): A chave primária.
- `name` (String): O nome da loja/empresa.
- `description` (Text): Descrição interna (útil se o usuário tiver várias lojas).
- `slug` (String): Identificador na URL (mesmo em localhost, ajuda a separar contextos).
- `is_default` (Boolean): Se o sistema for instalado para apenas uma loja, esta flag diz qual é a principal (evita ter que passar ID na URL o tempo todo).

### 2. Infraestrutura e Manutenção (O lado "SysAdmin")

Em projetos open source, o dono da loja geralmente é também o admin do servidor.

- `status` (Enum): `active`, `maintenance`, `disabled`.
- _Uso:_ Se o dono estiver atualizando o banco de dados, ele muda para `maintenance` e o frontend mostra uma página de "Voltamos já".

- `storage_limit_mb` (Integer): Opcional. Útil para evitar que uploads de imagens estourem o disco do servidor VPS barato.
- `max_users` (Integer): Opcional. Apenas para controle administrativo, não financeiro.

### 3. Feature Flags (Controle de Módulos)

Como não há planos para limitar recursos, você usa esta coluna para o usuário **desligar** o que não usa para limpar a interface.

- `enabled_features` (JSONB):
- Exemplo: `{"crm": true, "inventory": true, "pos": false, "blog": false}`.
- Se o usuário só quer usar o sistema para Estoque, ele desliga o módulo de Blog e a interface fica mais limpa.

### 4. Integrações de Sistema (Self-Hosted Pain)

Em SaaS, você configura o e-mail (SMTP) para todos. No Open Source, cada loja tem que configurar o seu.

- `smtp_settings` (JSONB): Configuração de e-mail própria da loja.
- `{"host": "smtp.gmail.com", "port": 587, "user": "...", "secure": true}`.

- `storage_settings` (JSONB): Onde salvar os arquivos.
- `{"provider": "local"}` ou `{"provider": "s3", "bucket": "minha-loja"}`.

### 5. Localização e Aparência (Igual ao SaaS)

Isso não muda. A loja precisa de identidade.

- `currency`, `language`, `timezone`.
- `branding` (JSONB): Logo, cores, CSS customizado.

---

### SQL Definitive (Open Source Edition)

```sql
CREATE TABLE shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identidade
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255), -- Para sair nas Notas Fiscais/Relatórios
    slug VARCHAR(60) UNIQUE NOT NULL,
    is_default BOOLEAN DEFAULT FALSE, -- A loja "principal" da instalação

    -- Controle Operacional
    status VARCHAR(20) DEFAULT 'active', -- active, maintenance (página de erro amigável), archived

    -- Módulos (O usuário liga/desliga o que quer usar)
    features_config JSONB DEFAULT '{
        "use_inventory": true,
        "use_pos": false,
        "use_b2b": false
    }',

    -- Configurações Técnicas (Vitais para Self-Hosted)
    mail_config JSONB, -- Credenciais de SMTP desta loja
    storage_config JSONB, -- Credenciais S3/Minio ou Local Path

    -- Preferências de Negócio
    settings JSONB DEFAULT '{}', -- Comportamento do checkout, impostos, etc.
    branding JSONB DEFAULT '{}', -- Logos e Cores

    -- Localização
    currency CHAR(3) DEFAULT 'BRL',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    locale VARCHAR(10) DEFAULT 'pt-BR',

    -- Metadados
    owner_id UUID, -- Quem instalou/criou
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

```
