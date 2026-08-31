import { expect, type Page } from 'playwright/test';

export const authFile = 'e2e/.auth/user.json';

type TestCredentials = Readonly<{
  email: string;
  password: string;
}>;

export function getTestCredentials(): TestCredentials {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Defina E2E_USER_EMAIL e E2E_USER_PASSWORD para executar o E2E autenticado.'
    );
  }

  return { email, password };
}

export async function signIn(page: Page, credentials: TestCredentials) {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill(credentials.email);
  await page.locator('input[name="password"]').fill(credentials.password);
  await page
    .locator('form')
    .getByRole('button', { name: /entrar|sign in/i })
    .click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
}
