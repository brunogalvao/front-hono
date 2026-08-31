import { expect, test, type Locator, type Page } from 'playwright/test';

type SupportedTheme = 'light' | 'dark';
type SupportedLanguage = 'pt-BR' | 'en';

type RouteContract = Readonly<{
  path: string;
  heading: RegExp;
  collection?: boolean;
  createButton?: RegExp;
  inlineForm?: 'income' | 'invite';
}>;

const themes: readonly SupportedTheme[] = ['light', 'dark'];
const languages: readonly SupportedLanguage[] = ['pt-BR', 'en'];

const routes: readonly RouteContract[] = [
  {
    path: '/admin/transactions',
    heading: /^(Transações|Transactions)$/,
    collection: true,
    createButton: /^(Nova Transação|New Transaction)$/i,
  },
  {
    path: '/admin/income',
    heading: /^(Rendimentos|Income)$/,
    collection: true,
    inlineForm: 'income',
  },
  {
    path: '/admin/installments',
    heading: /^(Parcelamentos|Installments)$/,
    collection: true,
    createButton: /^(Novo Parcelamento|New Installment)$/i,
  },
  {
    path: '/admin/recurring',
    heading: /^(Despesas Recorrentes|Recurring Expenses)$/,
    collection: true,
    createButton: /^(Nova Recorrência|New Recurring)$/i,
  },
  {
    path: '/admin/history',
    heading: /^(Histórico|History)$/,
    collection: true,
  },
  {
    path: '/admin/settings/members',
    heading:
      /^(Gerenciamento de Permissões|Gerenciamento de Membros|Permissions Management|Members Management)$/,
    inlineForm: 'invite',
  },
] as const;

test('home preserva responsividade e CTA secundário nos dois temas', async ({
  page,
}) => {
  test.slow();

  for (const theme of themes) {
    for (const language of languages) {
      await test.step(`${theme} / ${language}`, async () => {
        await page.goto('/');
        await applyPreferences(page, theme, language);

        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await expect(
          page.getByRole('link', {
            name: /^(Já tenho conta|I already have an account)$/,
          })
        ).toBeVisible();
        await assertNoGlobalOverflow(page);
      });
    }
  }
});

async function applyPreferences(
  page: Page,
  theme: SupportedTheme,
  language: SupportedLanguage
) {
  await page.evaluate(
    ({ nextTheme, nextLanguage }) => {
      localStorage.setItem('finance-theme', nextTheme);
      localStorage.setItem('finance-language', nextLanguage);
    },
    { nextTheme: theme, nextLanguage: language }
  );
  await page.reload();
}

async function assertNoGlobalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth === window.innerWidth
      )
    )
    .toBe(true);
}

async function assertAccessibleNames(controls: Locator) {
  const count = await controls.count();
  for (let index = 0; index < count; index += 1) {
    await expect.soft(controls.nth(index)).toHaveAccessibleName(/\S/);
  }
}

async function assertMobileTouchTargets(controls: Locator) {
  const count = await controls.count();
  for (let index = 0; index < count; index += 1) {
    const control = controls.nth(index);
    const box = await control.boundingBox();
    if (!box) continue;
    expect.soft(box.width).toBeGreaterThanOrEqual(44);
    expect.soft(box.height).toBeGreaterThanOrEqual(44);
  }
}

async function assertCollectionPresentation(page: Page, isMobile: boolean) {
  const selector = isMobile
    ? '[data-slot="mobile-record-list"]:visible, [data-slot="collection-empty-state"]:visible, [data-slot="collection-loading"]:visible'
    : '[data-slot~="desktop-table"]:visible, [data-slot="collection-empty-state"]:visible, [data-slot="collection-loading"]:visible';

  await expect(page.locator(selector).first()).toBeVisible({ timeout: 15_000 });
}

async function assertInlineForm(
  content: Locator,
  form: RouteContract['inlineForm'],
  isMobile: boolean
) {
  const controls =
    form === 'income'
      ? content.locator(
          '#income-description, #income-amount, button[aria-label]:visible'
        )
      : content.locator('form input:visible, form button:visible');

  await expect(controls.first()).toBeVisible();
  await assertAccessibleNames(controls);
  if (isMobile) await assertMobileTouchTargets(controls);
}

for (const route of routes) {
  test(`${route.path} atende ao contrato responsivo autenticado`, async ({
    page,
  }, testInfo) => {
    test.slow();
    const isMobile = testInfo.project.name.startsWith('mobile-');

    for (const theme of themes) {
      for (const language of languages) {
        await test.step(`${theme} / ${language}`, async () => {
          await page.goto(route.path);
          await applyPreferences(page, theme, language);

          await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
          await expect(page.locator('html')).toHaveClass(
            new RegExp(`(?:^|\\s)${theme}(?:\\s|$)`)
          );
          await expect(
            page.getByRole('heading', { level: 1, name: route.heading })
          ).toBeVisible({ timeout: 15_000 });

          const content = page.locator('[data-slot="admin-content"]');
          await expect(content).toBeVisible();
          await assertNoGlobalOverflow(page);

          if (route.collection) {
            await assertCollectionPresentation(page, isMobile);
          }

          const visibleActions = content.locator(
            'button:visible, a[href]:visible'
          );
          await assertAccessibleNames(visibleActions);

          if (route.inlineForm) {
            await assertInlineForm(content, route.inlineForm, isMobile);
          }

          if (route.createButton) {
            const create = content.getByRole('button', {
              name: route.createButton,
            });
            if ((await create.count()) > 0) {
              await create.click();
              const dialog = page.getByRole('dialog');
              await expect(dialog).toBeVisible();
              await assertNoGlobalOverflow(page);

              const dialogControls = dialog.locator(
                'button:visible, input:visible, textarea:visible, [role="combobox"]:visible'
              );
              await assertAccessibleNames(dialogControls);
              if (isMobile) await assertMobileTouchTargets(dialogControls);

              await page.keyboard.press('Escape');
              await expect(dialog).toBeHidden();
            }
          }
        });
      }
    }
  });
}
