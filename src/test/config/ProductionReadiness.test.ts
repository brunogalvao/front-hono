import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';

const rootDir = process.cwd();
const readProjectFile = (path: string) =>
  readFileSync(resolve(rootDir, path), 'utf-8');

describe('public SEO and error resources', () => {
  it('publishes valid crawler resources instead of the SPA document', () => {
    const robots = readProjectFile('public/robots.txt');
    const sitemap = readProjectFile('public/sitemap.xml');
    const llms = readProjectFile('public/llms.txt');

    expect(robots).toContain('User-agent: *');
    expect(robots).toContain(
      'Sitemap: https://finance.aivision.app.br/sitemap.xml'
    );
    expect(robots).not.toContain('<!doctype html>');
    expect(sitemap).toContain('<urlset');
    expect(sitemap).toContain('https://finance.aivision.app.br/privacidade');
    expect(llms).toMatch(/^# Task's Finance/m);
  });

  it('ships accessible static fallbacks for platform errors', () => {
    for (const file of ['public/404.html', 'public/500.html']) {
      const html = readProjectFile(file);
      expect(html).toContain('<main>');
      expect(html).toContain('name="robots" content="noindex, nofollow"');
      expect(html).toContain('href="/"');
    }
  });
});

describe('application-level recovery and privacy', () => {
  const router = readProjectFile('src/routes/tanstack-router.tsx');
  const app = readProjectFile('src/App.tsx');
  const cookieConsent = readProjectFile('src/components/CookieConsent.tsx');

  it('renders dedicated 404 and 500 experiences', () => {
    expect(router).toContain("import('@/pages/NotFoundPage')");
    expect(router).toContain('notFoundComponent: NotFoundPage');
    expect(router).toContain('errorComponent: AppErrorPage');
  });

  it('offers opt-in analytics consent and a privacy route', () => {
    expect(router).toContain("path: '/privacidade'");
    expect(cookieConsent).toContain("chooseConsent('accepted')");
    expect(cookieConsent).toContain("chooseConsent('rejected')");
    expect(cookieConsent).toContain('aria-labelledby="cookie-consent-title"');
    expect(app).not.toContain('@vercel/analytics');
  });
});

describe('monitoring and secret-safe configuration', () => {
  it('keeps monitoring credentials optional and out of source', () => {
    const exampleEnv = readProjectFile('.env.example');
    expect(exampleEnv).toContain('VITE_SENTRY_DSN=');
    expect(exampleEnv).toContain('VITE_GOOGLE_ANALYTICS_ID=');
    expect(exampleEnv).not.toMatch(/AIza[0-9A-Za-z_-]{30,}/);
  });

  it('checks public availability on a schedule', () => {
    const workflow = readProjectFile('.github/workflows/uptime.yml');
    expect(workflow).toContain("cron: '*/15 * * * *'");
    expect(workflow).toContain('https://finance.aivision.app.br/');
    expect(workflow).toContain('https://api.aivision.app.br/api/ping');
    expect(workflow).toContain('--fail');
  });

  it('allows only the configured telemetry endpoints in the CSP', () => {
    const vercelConfig = readProjectFile('vercel.json');
    expect(vercelConfig).toContain('https://www.googletagmanager.com');
    expect(vercelConfig).toContain('https://*.google-analytics.com');
    expect(vercelConfig).toContain('https://*.ingest.sentry.io');
  });
});
