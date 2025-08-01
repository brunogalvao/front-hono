# Sistema de Versão com GitHub Actions

Este projeto implementa um sistema de versão automático que mostra informações do commit atual na interface do usuário.

## Como Funciona

### 1. GitHub Actions Workflow

- O workflow `.github/workflows/build.yml` é executado em cada push/PR
- Captura informações do git (commit hash, mensagem, data, branch, tags)
- Gera um arquivo `version.json` com todas as informações
- Faz o build da aplicação incluindo essas informações

### 2. Hook useVersion

- O hook `src/hooks/use-version.ts` carrega as informações de versão
- Tenta carregar do arquivo `/version.json` (criado pelo GitHub Actions)
- Se não encontrar, usa informações de fallback para desenvolvimento

### 3. Interface

- O componente `AppSidebar` usa o hook para mostrar a versão
- Exibe "beta - v1.0.0+abc123" (onde abc123 é o commit hash)

## Uso

### Desenvolvimento Local

```bash
# Gerar informações de versão localmente
npm run build:with-version

# Ou executar o script diretamente
node scripts/generate-version.js
```

### Produção (GitHub Actions)

- Faça push para a branch `main` ou `develop`
- O GitHub Actions executará automaticamente
- A versão será atualizada com informações do commit

### Tags para Releases

```bash
# Criar uma tag para release
git tag v1.0.0
git push origin v1.0.0

# A versão será exibida como "v1.0.0" em vez de "beta - v1.0.0+abc123"
```

## Estrutura do version.json

```json
{
  "version": "beta - v1.0.0+abc123",
  "commitSha": "abc123",
  "commitShaFull": "abc123def456...",
  "commitMessage": "feat: add new feature",
  "commitDate": "2024-01-15",
  "branchName": "main",
  "tagName": "",
  "buildInfo": "Build: abc123 | 2024-01-15",
  "buildTime": "2024-01-15T10:30:00Z"
}
```

## Customização

### Alterar o formato da versão

Edite o arquivo `.github/workflows/build.yml` na seção "Get version info":

```bash
# Para um formato diferente
echo "version=Release ${{ steps.version.outputs.tag_name }}" >> $GITHUB_OUTPUT
```

### Adicionar mais informações

Adicione novos campos no `version.json` e atualize o hook `useVersion` para usá-los.

## Troubleshooting

### Versão não atualiza

1. Verifique se o GitHub Actions está executando
2. Confirme se o arquivo `version.json` está sendo copiado para `dist/`
3. Verifique se o hook está carregando corretamente

### Erro no desenvolvimento local

- Execute `node scripts/generate-version.js` para gerar o arquivo localmente
- Verifique se o git está inicializado e tem commits

### Erro de dependências (npm ci)

Se você encontrar erros de conflito de dependências no GitHub Actions:

1. **Problema**: `framer-motion` não compatível com React 19
2. **Solução**: O workflow usa `npm ci --legacy-peer-deps` para resolver conflitos
3. **Local**: Execute `npm install` para atualizar dependências localmente

### Fallback funcionando

Se você vê "beta - v1.0.0" em produção, significa que o arquivo `version.json` não foi encontrado. Verifique:

1. Se o GitHub Actions executou com sucesso
2. Se o arquivo está sendo copiado para `dist/`
3. Se o Vite está configurado corretamente
