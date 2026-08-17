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
});

// ─── pnpm-workspace.yaml ──────────────────────────────────────────────────────

describe('pnpm-workspace.yaml', () => {
  const yaml = readFileSync(resolve(rootDir, 'pnpm-workspace.yaml'), 'utf-8');

  it('permite build apenas para esbuild e core-js', () => {
    expect(yaml.trim()).toBe(
      ['allowBuilds:', '  core-js: true', '  esbuild: true'].join('\n')
    );
  });

  it('não contém placeholders não preenchidos', () => {
    expect(yaml).not.toContain('set this to true or false');
  });
});
