import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// process.cwd() retorna a raiz do projeto quando o vitest é executado via pnpm test
const rootDir = process.cwd();

// ─── package.json ─────────────────────────────────────────────────────────────

describe('package.json', () => {
  const pkg = JSON.parse(
    readFileSync(resolve(rootDir, 'package.json'), 'utf-8')
  );

  it('usa pnpm como packageManager', () => {
    expect(pkg.packageManager).toMatch(/^pnpm@/);
  });

  it('define versão mínima de pnpm nos engines', () => {
    expect(pkg.engines?.pnpm).toBeDefined();
  });

  it('tem script preinstall bloqueando npm/yarn', () => {
    expect(pkg.scripts?.preinstall).toContain('only-allow pnpm');
  });

  it('gera os metadados de versão no build padrão', () => {
    expect(pkg.scripts?.build).toContain('scripts/generate-version.js');
  });
});

// ─── pnpm-workspace.yaml ──────────────────────────────────────────────────────

describe('pnpm-workspace.yaml', () => {
  const yaml = readFileSync(resolve(rootDir, 'pnpm-workspace.yaml'), 'utf-8');

  it('permite build apenas para esbuild, core-js e workerd', () => {
    expect(yaml).toContain(
      [
        'allowBuilds:',
        '  core-js: true',
        '  esbuild: true',
        '  workerd: true',
      ].join('\n')
    );
    expect(yaml).not.toMatch(/^  (?!core-js|esbuild|workerd)[^:\n]+: true$/m);
  });

  it('fixa versões transitivas com correções de segurança', () => {
    expect(yaml).toContain('overrides:');
    expect(yaml).toContain('  nanoid: ^3.3.18');
    expect(yaml).toContain('  picomatch: ^4.0.4');
    expect(yaml).toContain('  postcss: ^8.5.26');
    expect(yaml).toContain('  rollup: ^4.59.0');
  });

  it('não contém placeholders não preenchidos', () => {
    expect(yaml).not.toContain('set this to true or false');
  });
});

// ─── Cloudflare Workers ──────────────────────────────────────────────────────

describe('wrangler.jsonc', () => {
  const config = readFileSync(resolve(rootDir, 'wrangler.jsonc'), 'utf-8');

  it('publica o build Vite no Worker correto', () => {
    expect(config).toContain('"name": "front-hono"');
    expect(config).toContain('"directory": "./dist"');
  });

  it('mantém fallback de navegação para a SPA', () => {
    expect(config).toContain('"not_found_handling": "single-page-application"');
  });
});

describe('continuous integration', () => {
  const workflow = readFileSync(
    resolve(rootDir, '.github/workflows/build.yml'),
    'utf-8'
  );
  const versionScript = readFileSync(
    resolve(rootDir, 'scripts/generate-version.js'),
    'utf-8'
  );

  it('deixa o deploy a cargo da integração nativa da Vercel', () => {
    expect(workflow).not.toContain('VERCEL_TOKEN');
    expect(workflow).not.toContain('vercel deploy');
    expect(workflow).toContain('pnpm run test:run && pnpm run build');
  });

  it('usa os metadados de commit fornecidos pela Vercel', () => {
    expect(versionScript).toContain('VERCEL_GIT_COMMIT_SHA');
    expect(versionScript).toContain('VERCEL_GIT_COMMIT_MESSAGE');
    expect(versionScript).toContain('VERCEL_GIT_COMMIT_REF');
  });
});
