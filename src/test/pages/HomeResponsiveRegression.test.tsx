import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const homeSource = readFileSync('src/pages/Home.tsx', 'utf8');
const finalCtaSource = readFileSync('src/components/CtaFinal.tsx', 'utf8');
const footerSource = readFileSync('src/components/Footer.tsx', 'utf8');

describe('home responsive regressions', () => {
  it('contains horizontal overflow at the public page boundary', () => {
    expect(homeSource).toContain('min-h-screen overflow-x-hidden');
    expect(homeSource).toContain('text-[clamp(');
    expect(homeSource).not.toContain('whitespace-nowrap');
    expect(homeSource).toContain('min-w-0 flex-wrap');
    expect(homeSource).toContain('<h1 className="min-w-0">');
  });

  it('keeps the existing-account CTA visible in light and dark themes', () => {
    expect(finalCtaSource).toContain('bg-white');
    expect(finalCtaSource).toContain('text-zinc-950');
    expect(finalCtaSource).toContain("t('ctaFinal.hasAccount')");
  });

  it('keeps Tasks Finance first and AI Vision as the product attribution', () => {
    expect(
      footerSource.indexOf('<Logo', footerSource.indexOf('return'))
    ).toBeLessThan(footerSource.indexOf('<a', footerSource.indexOf('return')));
    expect(footerSource).toContain('assets.aivision.app.br/aivision/');
  });
});
