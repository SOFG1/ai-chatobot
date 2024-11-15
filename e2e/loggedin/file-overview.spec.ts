import { test, expect } from '@playwright/test'

test('user can search for uploaded files', async ({ page }) => {
  await page.goto('/app/home')
  await page.getByRole('link', { name: 'Dateien' }).click()

  await page.getByRole('textbox', { name: 'Suchen' }).click()
  await page.getByRole('textbox', { name: 'Suchen' }).fill('ur')

  await expect(page.getByText('urlaub.md.pdf')).toBeVisible()
  await expect(page.getByText('bei-krankheit.md.pdf')).not.toBeVisible()

  await page.getByRole('textbox', { name: 'Suchen' }).click()
  await page.getByRole('textbox', { name: 'Suchen' }).fill('')
  await expect(page.getByText('urlaub.md.pdf')).toBeVisible()
  await expect(page.getByText('bei-krankheit.md.pdf')).toBeVisible()

  // filter works:
  await page
    .locator('div')
    .filter({ hasText: /^Indexstatus$/ })
    .click()
  await page.getByRole('option', { name: 'Failed' }).locator('div').click()
  await expect(page.getByText('failed', { exact: true })).toBeVisible()
  await expect(page.getByText('urlaub.md.pdf')).not.toBeVisible()
  await expect(page.getByText('bei-krankheit.md.pdf')).not.toBeVisible()

  await page
    .locator('div')
    .filter({ hasText: /^failed$/ })
    .first()
    .click()
  await expect(page.getByText('urlaub.md.pdf')).toBeVisible()
  await expect(page.getByText('bei-krankheit.md.pdf')).toBeVisible()

  await expect(page.getByText('Indexstatus')).toBeVisible()
  await expect(page.getByText('urlaub.md.pdf')).toBeVisible()
  await expect(page.getByText('bei-krankheit.md.pdf')).toBeVisible()

  let files = await page.getByTestId('file-item').all()
  await expect(files[0].getByText('urlaub.md.pdf')).toBeVisible()
  await expect(files[1].getByText('bei-krankheit.md.pdf')).toBeVisible()

  await page
    .locator('div')
    .filter({ hasText: /^Sortierung$/ })
    .click()
  await page.getByRole('option', { name: 'Last change' }).locator('span').first().click()
  files = await page.getByTestId('file-item').all()
  await expect(files[0].getByText('bei-krankheit.md.pdf')).toBeVisible()
  await expect(files[1].getByText('urlaub.md.pdf')).toBeVisible()

  await page.getByRole('main').locator('div').filter({ hasText: 'DateienIndexstatusReady' }).getByRole('button').click()
  files = await page.getByTestId('file-item').all()
  await expect(files[0].getByText('urlaub.md.pdf')).toBeVisible()
  await expect(files[1].getByText('bei-krankheit.md.pdf')).toBeVisible()
})

test.skip('TODO: user can open preview of pdf', async ({ page }) => {
  await page.goto('/app/home')
  await page.getByRole('link', { name: 'Dateien' }).click()

  // open pdf preview
  const page1Promise = page.waitForEvent('popup')
  await (await page.getByTestId('file-item').all())[0].getByTestId('file-open-preview').click()

  const page1 = await page1Promise
   expect(page1).toBeDefined()
})
