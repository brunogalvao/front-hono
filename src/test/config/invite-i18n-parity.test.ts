import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import ptBR from '@/locales/pt-BR/invite.json';
import en from '@/locales/en/invite.json';

function flatten(value: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, nested]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return nested && typeof nested === 'object' && !Array.isArray(nested)
      ? flatten(nested as Record<string, unknown>, path)
      : [path];
  });
}

describe('workspace invitation i18n', () => {
  it('keeps exact pt-BR/en key parity', () => {
    expect(flatten(ptBR).sort()).toEqual(flatten(en).sort());
  });

  it('keeps new invitation UI copy in locale files except Zod schema messages', () => {
    const files = [
      'src/components/workspace/InviteForm.tsx',
      'src/components/workspace/PendingInviteList.tsx',
      'src/pages/auth/InviteLandingPage.tsx',
      'src/pages/auth/AcceptInvitePage.tsx',
    ];
    const hardcodedUiCopy =
      /['"`](?:Convite|Enviar convite|Reenviar convite|Cancelar convite|Falha no envio|Workspace invitation|Send invitation)['"`]/;

    for (const file of files) {
      const source = readFileSync(file, 'utf8').replace(
        /\.email\(['"`][^'"`]+['"`]\)/g,
        '.email(ZOD_MESSAGE)'
      );
      expect(source, file).not.toMatch(hardcodedUiCopy);
    }
  });
});
