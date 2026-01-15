## 9. Autenticação (Auth)

A **Autenticação** é o porteiro do seu sistema. Para ser generalista, ela precisa ignorar completamente _quem_ é a pessoa (se é um CEO, um estagiário ou um cliente comprando bala) e focar apenas em _como_ essa pessoa prova que é ela mesma.

O erro número 1 é colocar colunas como `is_admin` ou `permissions` na tabela de usuários. Isso mistura **Autenticação** (Quem sou eu) com **Autorização** (O que posso fazer).

Aqui está a modelagem definitiva para um sistema de identidade moderno (compatível com OAuth2, OIDC, SAML e Passwordless).

---

### 1. A Tabela Mestre: `users` (Identity Provider)

Esta tabela guarda a credencial raiz. Note que ela é "magra". Ela não tem endereço, nem histórico de compras. Ela só serve para Logar.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificador Principal (Login Handle)
    email VARCHAR(255) UNIQUE, -- Essencial para recuperação de conta
    phone VARCHAR(50) UNIQUE, -- Para sistemas Mobile-First (WhatsApp Login)

    -- Segurança de Senha (Local Strategy)
    password_hash VARCHAR(255), -- NUNCA senha pura. Use Argon2 ou Bcrypt. Pode ser NULL se usar apenas Google/Social.
    security_stamp VARCHAR(100), -- Um UUID que muda toda vez que a senha muda. Invalida tokens antigos instantaneamente.

    -- Segurança de Acesso (Lockout Mechanism)
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    failed_login_attempts INTEGER DEFAULT 0, -- Contador para Brute Force
    lockout_end_at TIMESTAMP, -- "Sua conta está bloqueada por 30 min"

    -- Autenticação Multifator (MFA/2FA)
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(100), -- O segredo do Google Authenticator/Authy (TOTP)
    mfa_backup_codes TEXT[], -- Códigos de recuperação de emergência

    -- Auditoria
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(45), -- IPv4 ou IPv6
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- O Elo com o Mundo Real (Polimorfismo Lógico)
    -- Não usamos FK rígida aqui para manter a tabela pura, mas logicamente conecta-se a perfis
    profile_type VARCHAR(20), -- 'customer', 'staff', 'system'
    status VARCHAR(20) DEFAULT 'active' -- active, suspended, banned, pending_deletion
);

```

---

### 2. Tabela de Login Social: `user_identities` (OAuth/SSO)

Hoje em dia, obrigar o usuário a criar senha é perder conversão. Ele quer clicar em "Entrar com Google" ou "Entrar com Apple".
Para ser generalista, um usuário (`users`) pode ter N identidades.

```sql
CREATE TABLE user_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Quem é o provedor?
    provider VARCHAR(50) NOT NULL,
    -- 'google', 'facebook', 'apple', 'github', 'microsoft_azure_ad', 'saml_enterprise'

    -- Quem é o usuário lá?
    provider_user_id VARCHAR(255) NOT NULL, -- O ID numérico/string que o Google manda (sub)

    -- Dados de Conexão (Para renovar acesso)
    access_token TEXT, -- O token para chamar APIs do Google em nome do user (Opcional)
    refresh_token TEXT, -- Para pegar novos tokens
    expires_at TIMESTAMP,

    profile_data JSONB, -- Snapshot do perfil que veio do Google (Avatar, Locale)

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (provider, provider_user_id) -- Garante que um ID do Google só pertença a um user
);

```

---

### 3. Tabela de Sessões: `user_sessions` (Device Management)

Sistemas modernos (como Netflix ou bancos) permitem ver "Dispositivos Conectados" e derrubar um específico. JWTs puros não permitem isso facilmente. Você precisa de uma tabela de sessões ativas (Refresh Tokens).

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Este ID vai dentro do Refresh Token (JTI)
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Impressão Digital do Dispositivo
    user_agent TEXT, -- "Chrome on Windows 10"
    ip_address VARCHAR(45),
    device_type VARCHAR(20), -- 'mobile', 'desktop', 'tablet'
    location VARCHAR(100), -- "São Paulo, BR" (GeoIP)

    -- Validade
    token_hash VARCHAR(255), -- Hash do Refresh Token entregue ao user (segurança extra)
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP, -- Se preenchido, o token foi "morto" manualmente (Logout forçado)

    created_at TIMESTAMP DEFAULT NOW(),
    last_active_at TIMESTAMP -- Para saber "Visto por último há 2 dias"
);

```

---

### 4. Aprofundando nos Conceitos Generalistas

#### A. O `security_stamp` (A Válvula de Segurança)

Imagine que um hacker roubou o Cookie/Token do usuário. O usuário percebe e troca a senha.
Se o Token antigo continuar valendo, a troca de senha foi inútil.
**Como funciona:**

1. Todo Token (JWT) tem o `security_stamp` atual criptografado dentro dele.
2. Quando o usuário muda a senha, o sistema gera um NOVO `security_stamp` aleatório no banco.
3. Quando o hacker tentar usar o token antigo, a API compara o stamp do token com o do banco.
4. Como são diferentes, o sistema rejeita o acesso: "Token inválido/Senha alterada".

#### B. Separação `users` vs `customers` vs `staff`

Essa é a chave da arquitetura limpa.

- **Tabela `users`:** Cuida de login, senha, 2FA. (Segurança).
- **Tabela `customers`:** Cuida de compras, endereço, histórico. (Negócio).
- **Tabela `staff`:** Cuida de salário, departamento, turno. (RH).

**Como conectar?**
Geralmente, no momento do login, o backend faz:

1. Autentica o `user` (ID: 100).
2. Verifica: Esse email está na tabela `customers`? Sim, ID: 500.
3. Verifica: Esse email está na tabela `staff`? Não.
4. Gera o Token com claims: `{uid: 100, role: "customer", customer_id: 500}`.

Isso permite que um dia, o mesmo e-mail seja **Cliente** (compra produtos) e **Staff** (trabalha no suporte), com permissões diferentes, mas uma única senha.

#### C. Passkeys e WebAuthn (O Futuro)

Para suportar Login com Biometria (TouchID/FaceID) sem senha, você precisaria de uma tabela `user_credentials` (padrão FIDO2).
Ela guarda a chave pública gerada pelo celular do usuário. É uma extensão natural dessa arquitetura, funcionando similar à tabela `identities`.

### 5. Controle de Acesso (Authorization - RBAC)

Embora não seja estritamente "Autenticação", o modelo generalista precisa de Roles (Papéis).
Não use colunas booleanas (`is_admin`, `is_manager`). Use uma tabela de ligação.

```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY,
    name VARCHAR(50) UNIQUE, -- 'admin', 'editor', 'customer_support'
    permissions TEXT[] -- ['product:create', 'order:refund', 'user:view']
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id),
    role_id UUID REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

```

### Resumo da Arquitetura

1. **Usuário esqueceu a senha?** Interage com `users` (gera token de reset, atualiza `password_hash` e `security_stamp`).
2. **Usuário logou com Google?** Cria linha em `users` (sem senha) e linha em `user_identities`.
3. **Usuário trocou de celular?** O sistema vê na tabela `sessions` que um novo `device_type` apareceu.
4. **Admin quer banir usuário?** Atualiza `users.status = 'banned'`. O middleware de autenticação checa isso em cada requisição.

## Essa estrutura é usada por gigantes como Auth0, Cognito e Firebase Auth por baixo dos panos.
