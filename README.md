# 📊 Task's Finance

Sistema de controle financeiro pessoal com autenticação, registro de receitas e despesas, parcelas, grupos e análise por IA.

> React 19 + Supabase + TailwindCSS + ShadCN UI — deploy contínuo na Vercel.

---

## 🚀 Tecnologias

| Camada | Tecnologia |
|---|---|
| UI | React 19 + Vite 6 |
| Estilo | TailwindCSS v4 + ShadCN UI + Animate UI |
| Roteamento | TanStack Router |
| Server state | TanStack Query |
| Backend | Supabase (Auth + Database + Edge Functions) |
| IA | Claude (Anthropic) via Supabase Edge Function |
| Deploy | Vercel + GitHub Actions |
| Testes | Vitest + Testing Library |
| Pacotes | `pnpm` (>=11) |

---

## ⚙️ Pré-requisitos e instalação

| Ferramenta | Versão |
|---|---|
| Node.js | 24.x |
| pnpm | >= 11 |

> Este projeto usa **exclusivamente `pnpm`**. Rodar `npm install` ou `yarn` vai falhar no `preinstall` com erro intencional.

```bash
# 1. Instalar pnpm (caso não tenha)
npm install -g pnpm

# 2. Instalar dependências
pnpm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# edite .env.local com suas credenciais do Supabase

# 4. Iniciar em desenvolvimento
pnpm dev
```

### Comandos disponíveis

```bash
pnpm dev              # Servidor de desenvolvimento (porta 5173)
pnpm dev:with-version # Dev com sistema de versão ativo
pnpm build            # TypeScript check + build de produção
pnpm preview          # Preview do build local
pnpm lint             # ESLint
pnpm format           # Prettier
pnpm test             # Testes em modo watch
pnpm test:run         # TypeScript check + todos os testes (CI)
```

---

## 🛠️ Funcionalidades

- Autenticação com **GitHub**, **Google (OAuth)** e **e-mail com código OTP**
- Registro e gestão de **receitas mensais**
- Controle de **despesas**, **parcelas** e **gastos recorrentes**
- **Grupos** — compartilhamento de finanças com controle de permissões por papel
- **Consultor IA** — análise financeira personalizada com Claude
- Interface responsiva com suporte a **dark mode**
- Autenticação segura com **Row Level Security (RLS)**

---

## 🤖 Consultor IA

Análise financeira personalizada gerada pelo modelo Claude da Anthropic, com streaming em tempo real.

- Diagnóstico do período com resumo de receitas x despesas
- Alertas de comportamentos problemáticos e sugestões de corte
- Recomendações de investimento para o mercado brasileiro (Tesouro Direto, CDB, FIIs, etc.)

### Configuração da `ANTHROPIC_API_KEY`

A chave é usada **exclusivamente** na Supabase Edge Function — nunca exposta ao frontend.

**Desenvolvimento local** — crie `supabase/.env` (não commitar):
```
ANTHROPIC_API_KEY=sk-ant-...sua-chave-aqui...
```

**Produção** — acesse **Supabase Dashboard → Project Settings → Edge Functions → Secrets**:
```
ANTHROPIC_API_KEY = sk-ant-...sua-chave-aqui...
```

**Deploy da Edge Function:**
```bash
supabase functions deploy financial-advisor
```

> Chave disponível em https://console.anthropic.com/

---

## 🔄 Sistema de Versão

Exibe informações do commit atual na interface (`beta - v1.0.0+abc123`).

- **GitHub Actions** captura automaticamente o git hash em cada build
- **Fallback** para desenvolvimento local sem git
- **Tags** suportadas para releases (ex: `v1.0.0`)

```bash
pnpm dev:with-version    # Dev com versão ativa
pnpm build:with-version  # Build com versão (CI faz automaticamente)
```

> Documentação completa em [VERSION_SYSTEM.md](./VERSION_SYSTEM.md).

---

## 🧪 Testes

Vitest + happy-dom para testes unitários de componentes, páginas e utilitários.

| Lib | Papel |
|---|---|
| `vitest` | Runner, compatível com Vite |
| `happy-dom` | Ambiente DOM rápido |
| `@testing-library/react` | Renderização de componentes |
| `@testing-library/jest-dom` | Matchers (`toBeInTheDocument`, etc.) |

```bash
pnpm test        # Modo watch
pnpm test:run    # TypeScript check + testes completos (usado no CI)
```

> `pnpm test:run` executa `tsc -b` antes do Vitest — erro de TypeScript cancela imediatamente.

### Estrutura

```
src/test/
├── setup.ts
├── components/
│   ├── ForgotPassword.test.tsx
│   └── RegisterUserForm.test.tsx
├── pages/
│   └── Login.test.tsx
└── utils/
    ├── expenses.test.ts
    ├── format.test.ts
    ├── getInitials.test.ts
    ├── permissions.test.ts
    ├── phoneSchema.test.ts
    └── taskSchema.test.ts
```

---

## 🚢 Deploy

Deploy automático na **Vercel** a cada push na `main`.

Os testes e o TypeScript check rodam **antes do build** — qualquer falha cancela o deploy:

```json
// vercel.json
"buildCommand": "pnpm run test:run && pnpm run build"
```

```bash
# Deploy manual (se necessário)
vercel --prod
```

---

## 🛢️ Infraestrutura local

### Supabase

```bash
supabase start                          # Iniciar
supabase stop                           # Pausar
supabase stop --project-id front-hono   # Parada forçada
supabase restart                        # Reiniciar
supabase update                         # Atualizar
```

### Docker

```bash
docker-compose up -d    # Iniciar
docker-compose down     # Parar
docker-compose logs -f  # Logs em tempo real
```

---

## 🔧 Ferramentas de desenvolvimento

### Speckit — workflow de especificação

```
/speckit.constitution   → princípios do projeto (qualidade, testes, padrões)
/speckit.specify        → descreve O QUE construir (sem falar de tech stack)
/speckit.clarify        → perguntas para eliminar ambiguidades
/speckit.plan           → define o stack e gera o plano técnico
/speckit.tasks          → quebra o plano em tarefas ordenadas
/speckit.implement      → executa a implementação
```
