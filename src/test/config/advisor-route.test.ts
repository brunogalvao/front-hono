import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const sidebarSource = readFileSync(
  'src/components/nav/app-sidebar.tsx',
  'utf8'
);
const dashboardSource = readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');
const routerSource = readFileSync('src/routes/tanstack-router.tsx', 'utf8');

describe('canonical AI advisor route', () => {
  it('uses /admin/advisor in the sidebar and dashboard CTA', () => {
    expect(sidebarSource).toContain("url: '/admin/advisor'");
    expect(dashboardSource).toContain('to="/admin/advisor"');
  });

  it('redirects the legacy insights route to the advisor', () => {
    expect(routerSource).toContain("path: '/insights'");
    expect(routerSource).toContain(
      "throw redirect({ to: '/admin/advisor', replace: true })"
    );
  });
});
