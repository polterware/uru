## 10. Atendimento (Inquiries)

Para a aba de **Contato**, se você pensar apenas como "um formulário que envia um e-mail", você estará criando um site de padaria de 1999.

Em um sistema **super generalista**, a "Aba de Contato" é a porta de entrada para três mundos gigantescos:

1. **Suporte (Helpdesk):** "Meu produto veio quebrado."
2. **Vendas (CRM/Leads):** "Quero um orçamento para 500 peças."
3. **Legal/Institucional:** "Quero trabalhar aí" ou "Apaguem meus dados (LGPD)".

Portanto, não chame a tabela de `contact_messages`. Chame de **`inquiries`** (Solicitações/Atendimentos) ou **`tickets`**. Ela deve funcionar como um hub de mensageria centralizado.

Aqui está a modelagem definitiva para gerenciar o contato com o mundo externo.

---

### 1. A Tabela Mestre: `inquiries` (O Cabeçalho do Atendimento)

Esta tabela representa a **thread** (o fio da meada). Ela agrupa toda a conversa sobre um assunto específico.

- `id` (UUID): Identificador único (o famoso "Número de Protocolo").
- `protocol_number` (String): Um ID amigável para o humano (ex: "20241020-ABCD").
- **A Classificação (Triagem Automática):**
- `type` (Enum): Define o fluxo de trabalho.
- Values: `support` (problema), `lead` (venda), `general` (dúvida), `partnership` (parceria), `data_privacy` (LGPD).

- `priority` (Enum): `low`, `normal`, `high`, `urgent`.
- `status` (Enum): O ciclo de vida.
- Values: `new` (ninguém viu), `open` (em análise), `pending_customer` (esperando resposta do cliente), `resolved` (concluído), `closed` (arquivado).

- **A Origem (Omnichannel):**
- `source` (Enum): De onde veio isso?
- Values: `contact_form`, `email`, `whatsapp`, `phone_call` (registrado manualmente), `live_chat`, `instagram_dm`.

- **Quem é o Solicitante (Snapshot vs Vínculo):**
- `user_id` / `customer_id` (UUID): Vínculo opcional se a pessoa já for cadastrada.
- `requester_snapshot` (JSONB): **Obrigatório.**
- Mesmo se o usuário for logado, guarde o contato _daquele momento_.
- `{"name": "Maria", "email": "maria@gmail.com", "phone": "..."}`.
- Isso permite que não-clientes (Leads) entrem em contato sem criar conta no sistema.

- **Roteamento Interno:**
- `department` (String): "Financeiro", "Comercial", "Suporte Técnico".
- `assigned_to_staff_id` (UUID): Qual funcionário é o "dono" desse problema agora.

- **Contexto Rico:**
- `subject` (String): O título da mensagem.
- `metadata` (JSONB): Onde a mágica acontece.
- _No E-commerce:_ `{"order_id": "..."}` (Estou reclamando deste pedido).
- _No Software:_ `{"browser": "Chrome", "os": "Windows 11"}` (Bug report).
- _No Imobiliário:_ `{"property_ref": "AP-202"}` (Tenho interesse neste apê).

---

### 2. A Tabela de Diálogo: `inquiry_messages` (O Chat)

Nunca guarde a mensagem no cabeçalho. Um contato quase sempre vira um "vai e volta". Essa tabela guarda o histórico cronológico.

- `id` (UUID): PK.
- `inquiry_id` (FK): Vínculo com o protocolo.
- **O Autor:**
- `sender_type` (Enum): `customer`, `staff`, `system` (bot/auto-reply).
- `sender_id` (UUID): ID do usuário ou funcionário (se houver).

- **O Conteúdo:**
- `body` (Text): A mensagem em si (suporte a Markdown ou HTML).
- `internal_note` (Boolean): Se `true`, é uma nota que só os funcionários veem ("O cliente está nervoso, cuidado").

- **Anexos (Evidências):**
- `attachments` (JSONB): Array de links.
- `[{"url": "s3://...", "name": "print_erro.png", "type": "image/png"}]`.

- **Rastreabilidade:**
- `read_at` (Timestamp): Quando o destinatário leu (o "check azul" do WhatsApp).
- `channel_message_id` (String): ID externo (se veio do WhatsApp/Email) para threading.

---

### 3. Tabela de Avaliação: `inquiry_surveys` (CSAT/NPS)

Em um sistema profissional, todo contato fechado gera uma pesquisa de satisfação.

- `inquiry_id` (FK): Vínculo.
- `score` (Integer): 1 a 5 (CSAT) ou 0 a 10 (NPS).
- `feedback` (Text): "O atendente foi ótimo, mas o produto é ruim."
- `created_at` (Timestamp).

---

### Exemplo de SQL (PostgreSQL)

```sql
CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identidade Visual do Protocolo
    protocol_number VARCHAR(50) UNIQUE NOT NULL, -- Ex: 2024-XA92

    -- Classificação
    type VARCHAR(50) DEFAULT 'general', -- support, sales, partnership
    status VARCHAR(50) DEFAULT 'new', -- new, open, pending, solved, closed, spam
    priority VARCHAR(20) DEFAULT 'normal',

    -- Origem
    source VARCHAR(50) DEFAULT 'web_form', -- email, whatsapp, phone

    -- Solicitante (Híbrido: Vínculo ou Snapshot)
    customer_id UUID REFERENCES customers(id), -- Opcional
    requester_data JSONB NOT NULL,
    -- Ex: {"name": "João", "email": "j@test.com", "phone": "1199..."}

    -- Responsabilidade
    department VARCHAR(50), -- 'sales', 'tech_support'
    assigned_staff_id UUID REFERENCES users(id),

    -- Assunto
    subject VARCHAR(255),

    -- Links Inteligentes
    related_order_id UUID, -- Se for dúvida sobre pedido
    related_product_id UUID, -- Se for dúvida sobre produto
    metadata JSONB, -- Contexto técnico (URL onde estava, Browser, IP)

    -- Prazos (SLA)
    sla_due_at TIMESTAMP, -- Quando isso DEVE ser respondido
    resolved_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE inquiry_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID NOT NULL REFERENCES inquiries(id),

    -- Quem falou?
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('customer', 'staff', 'bot')),
    sender_id UUID, -- Pode ser null se for cliente não cadastrado

    -- O que falou?
    body TEXT,
    is_internal_note BOOLEAN DEFAULT FALSE, -- O cliente não vê isso

    -- Arquivos
    attachments JSONB DEFAULT '[]',

    -- Metadados de Mensageria
    external_id VARCHAR(255), -- ID do email no Gmail ou MessageID do Twilio
    read_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW()
);

```

### Por que esses atributos são "Generalistas"?

1. **Transformação em Lead (Vendas):**

- Alguém preenche o formulário: "Tenho interesse no plano Enterprise".
- Cria-se um `inquiry` do tipo `sales`.
- O vendedor conversa via `inquiry_messages`.
- Se fechar negócio, você tem todo o histórico da negociação vinculado ao futuro Cliente.

2. **Multicanal (Omnichannel):**

- O sistema pode ler uma caixa de e-mail (IMAP) e transformar cada e-mail novo em uma linha na tabela `inquiries`.
- Se o cliente responder o e-mail, o sistema acha o `inquiry` pelo ID no título ("Re: [Protocolo 123]") e insere uma nova linha em `inquiry_messages`.
- Para o atendente, parece um chat.

3. **Formulários Dinâmicos:**

- No seu frontend, você pode ter formulários diferentes.
- Formulário "Trabalhe Conosco" -> Salva no `metadata`: `{"linkedin": "...", "portfolio": "..."}`.
- Formulário "Orçamento" -> Salva no `metadata`: `{"budget": 50000}`.

- O banco de dados não muda, o `metadata` absorve a variação.

4. **Notas Internas (`is_internal_note`):**

- Isso é vital. O cliente manda uma dúvida difícil.
- Atendente A comenta na thread: "Ei Chefe, como respondo isso?" (`internal_note = true`).
- Chefe responde: "Diga que é erro de DNS" (`internal_note = true`).
- Atendente responde ao cliente: "Prezado, verifique seu DNS" (`internal_note = false`).
- O cliente nunca vê a conversa interna, mas fica tudo registrado para auditoria.

### Resumo

A aba "Contato" não é um fim, é um começo. Com essa estrutura, você não está criando apenas um formulário, está criando a base para um **Zendesk** ou **Salesforce** próprio dentro do seu sistema.

---
