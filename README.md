# 📊 Task's Finance

Sistema de controle financeiro com autenticação de múltiplos métodos.

> Projeto React com autenticação, cadastro de rendimentos e visual moderno usando Tailwind + ShadCN + Animate UI.

---

## 🚀 Tecnologias Utilizadas

- ⚛️ **React 19** + **Vite**
- 🎨 **TailwindCSS** + **ShadCN UI** + **Animate UI**
- 🔐 **Supabase Auth** (GitHub, Google, E-mail/OTP)
- 💾 **Supabase Database** (SQL)
- 📦 Gerenciador de pacotes: `pnpm`
- 📈 **Vercel Analytics**
- 🔄 **GitHub Actions** (Sistema de versão automático)

---

## 🛠️ Funcionalidades

- Login com **GitHub**, **Gmail (OAuth)** ou **e-mail com código OTP**
- Registro de **rendimentos mensais**
- Edição e exclusão de rendimentos
- Interface limpa e responsiva
- Autenticação segura com **RLS**
- **Sistema de versão automático** com informações do commit

---

## 🔄 Sistema de Versão

O projeto inclui um sistema de versão automático que mostra informações do commit atual na interface:

- **Versão dinâmica**: Exibe "beta - v1.0.0+abc123" (onde abc123 é o commit hash)
- **GitHub Actions**: Captura automaticamente informações do git em cada build
- **Fallback**: Funciona em desenvolvimento local com informações de fallback
- **Tags**: Suporte a releases com tags (ex: v1.0.0)

### Uso Rápido

```bash
# Desenvolvimento local
pnpm dev:with-version

# Build com versão
pnpm build:with-version

# Produção (automático via GitHub Actions)
git push origin main
```

Veja a documentação completa em [VERSION_SYSTEM.md](./VERSION_SYSTEM.md).

---

## 🤖 Consultor IA (AI Financial Advisor)

O módulo **Consultor IA** oferece análise financeira personalizada gerada pelo modelo Claude da Anthropic, com streaming em tempo real.

### Funcionalidades

- Diagnóstico do período com resumo de receitas x despesas
- Alertas de comportamentos problemáticos e sugestões de corte
- Recomendações de investimento contextualizadas para o mercado brasileiro (Tesouro Direto, CDB, FIIs, etc.)

### Configuração da ANTHROPIC_API_KEY

A chave da API Anthropic é utilizada **exclusivamente** na Supabase Edge Function. Ela nunca é exposta ao frontend.

**1. Para desenvolvimento local com Supabase CLI:**

Crie ou edite o arquivo `supabase/.env` (nunca commite este arquivo):

```
ANTHROPIC_API_KEY=sk-ant-...sua-chave-aqui...
```

**2. Para produção (Supabase Dashboard):**

Acesse **Project Settings → Edge Functions → Secrets** e adicione:

```
ANTHROPIC_API_KEY = sk-ant-...sua-chave-aqui...
```

**3. Deploy da Edge Function:**

```bash
supabase functions deploy financial-advisor
```

> A chave pode ser obtida em https://console.anthropic.com/

---

## 🧪 Testes

O projeto utiliza **Vitest** com **happy-dom** para testes unitários de utilitários e lógica da aplicação.

### Stack de testes

| Lib | Papel |
|---|---|
| `vitest` | Runner de testes, compatível com Vite |
| `happy-dom` | Ambiente DOM rápido (substituto do jsdom) |
| `@testing-library/react` | Renderização de componentes React |
| `@testing-library/jest-dom` | Matchers extras (`toBeInTheDocument`, etc.) |

### Comandos

```bash
# Modo watch (desenvolvimento)
pnpm test

# TypeScript check + todos os testes (CI / pré-deploy)
pnpm test:run
```

> `pnpm test:run` executa `tsc -b` antes do Vitest — qualquer erro TypeScript cancela a execução imediatamente, impedindo que código quebrado chegue à Vercel.

### Estrutura

```
src/test/
├── setup.ts                        # Configuração global (@testing-library/jest-dom + i18n)
├── components/
│   ├── ForgotPassword.test.tsx     # Testes do formulário de recuperação de senha
│   └── RegisterUserForm.test.tsx   # Testes do formulário de cadastro
├── pages/
│   └── Login.test.tsx              # Testes da página de login (email, GitHub, Google)
└── utils/
    ├── expenses.test.ts            # Cálculo de despesas e detecção de recorrentes
    ├── format.test.ts              # Formatação de moeda (BRL / USD)
    ├── getInitials.test.ts         # Geração de iniciais do usuário
    ├── permissions.test.ts         # Controle de acesso por papel (canWrite, canEdit…)
    ├── phoneSchema.test.ts         # Validação de formato de telefone
    └── taskSchema.test.ts          # Validação de schema de tarefas (Zod)
```

### Deploy na Vercel

Os testes (incluindo TypeScript check) são executados automaticamente **antes do build**. Se o TypeScript ou qualquer teste falhar, o deploy é cancelado.

```json
// vercel.json
"buildCommand": "pnpm run test:run && pnpm run build"
```

---

# Comandos Docker do Supabase

- **Start**: `supabase start`
- **Pausar**: `supabase stop`
- **Forcar Parada**: `supabase stop --project-id front-hono`
- **Reiniciar**: `supabase restart`
- **Atualizar**: `supabase update`

# Comandos Docker
- **Iniciar**: `docker-compose up -d`
- **Parar**: `docker-compose down`
- **Logs**: `docker-compose logs -f`


# Comnandos Speckit

```
/speckit.constitution   → princípios do projeto (qualidade, testes, padrões)
/speckit.specify        → descreve O QUE quer construir (sem falar de tech stack)
/speckit.clarify        → Claude faz perguntas pra eliminar ambiguidades
/speckit.plan           → aí sim define o stack e gera o plano técnico
/speckit.tasks          → quebra o plano em tarefas ordenadas
/speckit.implement      → executa tudo
```
