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
npm run build:with-version

# Produção (automático via GitHub Actions)
git push origin main
```

Veja a documentação completa em [VERSION_SYSTEM.md](./VERSION_SYSTEM.md).

---
