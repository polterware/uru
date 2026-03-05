<p align="center">
  <img src="./docs/images/header.png" alt="URU header" />
</p>

# URU

Gerencie seu negocio sem depender de SaaS caro. O URU e um app desktop open-source que centraliza catalogo de produtos, estoque, pedidos, vendas, pagamentos e relatorios em uma unica interface conectada ao [Supabase](https://supabase.com).

## O que o URU faz

- **Catalogo de produtos** — cadastre, edite e organize seus itens com campos flexiveis
- **Gestao de estoque** — acompanhe quantidades, movimentacoes e alertas de estoque baixo
- **Pedidos e vendas** — registre vendas, acompanhe status e historico de transacoes
- **Analytics** — dashboards visuais com metricas do negocio (receita, produtos mais vendidos, tendencias)
- **Controle de acesso** — tres perfis (admin, operador, analista) com permissoes diferentes
- **App desktop nativo** — roda como aplicacao nativa no Windows, macOS e Linux via Tauri

### Para quem e tecnico

- Toda logica de negocio roda no Supabase (sem banco local)
- Dados protegidos por regras de acesso no banco (Row Level Security)
- Operacoes criticas (reserva de estoque, finalizacao de venda, estornos) usam funcoes transacionais no servidor
- Autenticacao via JWT com Supabase Auth

## Screenshots

<p align="center">
  <img src="./docs/images/example.png" alt="Console de dados com navegacao por tabelas" width="700" />
  <br />
  <em>Console de dados com navegacao por tabelas</em>
</p>

<p align="center">
  <img src="./docs/images/example2.png" alt="Dashboard de analytics" width="700" />
  <br />
  <em>Dashboard de analytics com metricas do negocio</em>
</p>

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | [React 19](https://react.dev) · [TanStack Router](https://tanstack.com/router) · [TanStack Table](https://tanstack.com/table) |
| Estilo | [Tailwind CSS 4](https://tailwindcss.com) · [Radix UI](https://www.radix-ui.com) · [shadcn/ui](https://ui.shadcn.com) |
| Estado | [Zustand](https://zustand.docs.pmnd.rs) |
| Graficos | [Recharts](https://recharts.org) |
| Desktop | [Tauri 2](https://v2.tauri.app) |
| Backend | [Supabase](https://supabase.com) (Auth, Database, RLS, RPC) |
| Build | [Vite](https://vite.dev) · [TypeScript](https://www.typescriptlang.org) |

## Pre-requisitos

### Obrigatorios

- [Node.js 20+](https://nodejs.org)
- [pnpm](https://pnpm.io/installation)
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)

### Para build desktop

- [Rust toolchain](https://rustup.rs)
- [Dependencias do Tauri](https://v2.tauri.app/start/prerequisites/) (variam por sistema operacional)

### Opcionais

- [Docker](https://www.docker.com) — apenas para o comando `db local-reset`

## Quick Start

```bash
pnpm install
pnpm uru setup
```

O assistente de setup vai verificar pre-requisitos, criar `.env.local` interativamente, instalar dependencias, linkar seu projeto Supabase e aplicar as migrations.

Depois do setup:

```bash
pnpm uru dev
```

## CLI Commands

Todas as operacoes do projeto passam pelo CLI `pnpm uru`:

| Comando | Descricao |
|---------|-----------|
| `pnpm uru` | Menu interativo |
| `pnpm uru setup` | Assistente de primeiro setup |
| `pnpm uru dev` | Iniciar servidor de desenvolvimento (web ou desktop) |
| `pnpm uru db` | Menu de operacoes do banco |
| `pnpm uru db push` | Aplicar migrations (nao destrutivo) |
| `pnpm uru db lint` | Validar migrations |
| `pnpm uru db reset` | Resetar banco remoto linkado (destrutivo, pede confirmacao) |
| `pnpm uru db local-reset` | Resetar stack local Docker |
| `pnpm uru check` | Rodar Prettier + ESLint fix |
| `pnpm uru --help` | Mostrar todos os comandos |

### Flags do banco

- `--relink` — forca `supabase link` antes de rodar comandos de banco
- `SUPABASE_DB_PASSWORD` (variavel de ambiente) — evita prompts de senha durante link/reset/push

## Outros Scripts

- `pnpm build` — build de producao web
- `pnpm preview` — preview do build
- `pnpm test` — rodar testes via Vitest

## Estrutura do Projeto

```
src/
  routes/          # Rotas da aplicacao (/login, /products, /orders, /inventory, /settings)
  lib/
    supabase/      # Cliente Supabase, autenticacao e tratamento de erros
    db/
      repositories/  # Camada de acesso a dados (queries e mutations via Supabase)
supabase/
  migrations/      # Contrato do banco: schema, politicas de acesso (RLS) e funcoes (RPC)
src-tauri/
  src/lib.rs       # Shell desktop (sem logica de negocio)
cli/               # Toolkit CLI interativo para setup e operacoes do projeto
```

## Modelo de Seguranca

O URU protege seus dados em multiplas camadas. Cada usuario tem um perfil (admin, operador ou analista) que determina o que ele pode ver e fazer. As regras de acesso sao aplicadas diretamente no banco de dados, entao mesmo que alguem tente acessar a API diretamente, so vai conseguir ver os dados permitidos para o perfil dele.

- **Autenticacao**: Supabase Auth com tokens JWT
- **Perfis de acesso**: `admin` (acesso total), `operator` (operacoes do dia-a-dia), `analyst` (somente leitura)
- **Row Level Security (RLS)**: politicas por tabela que filtram dados baseado no perfil do usuario
- **Funcoes transacionais (RPC)**: operacoes criticas como reserva de estoque e finalizacao de venda rodam no servidor para garantir consistencia

## Contribuindo

1. Faca um fork do repositorio
2. Crie uma branch para sua feature ou fix (`git checkout -b minha-feature`)
3. Faca suas alteracoes
4. Rode `pnpm uru check` para garantir formatacao e lint
5. Abra um Pull Request

Encontrou um bug ou tem uma sugestao? [Abra uma issue](https://github.com/ericpbarcelos/uru/issues).

## Troubleshooting

- **`Supabase is not configured...`**
  - Verifique se `.env.local` tem `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
  - Reinicie `pnpm dev` depois de editar variaveis de ambiente

- **Erros de autenticacao ou rede no app desktop**
  - Verifique firewall/VPN/proxy
  - Confirme que a URL e chave do projeto Supabase estao corretas
  - Tente reiniciar o app

- **Build desktop falha**
  - Confirme que o Rust toolchain esta instalado (`rustc --version`)
  - Instale as [dependencias do Tauri](https://v2.tauri.app/start/prerequisites/) para seu OS

- **`pnpm uru db push` falha**
  - Verifique se o projeto Supabase esta linkado (`pnpm uru db --relink`)
  - Confirme que `SUPABASE_DB_PASSWORD` esta definida ou informe a senha quando solicitado

## Licenca

Este projeto e open-source. Veja o arquivo de licenca no repositorio para detalhes.
