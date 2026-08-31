import { test as setup } from 'playwright/test';
import { authFile, getTestCredentials, signIn } from './fixtures/auth';

setup('authenticate test user', async ({ page }) => {
  await signIn(page, getTestCredentials());
  await page.context().storageState({ path: authFile });
});
