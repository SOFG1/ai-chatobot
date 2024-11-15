import { test, expect } from '@playwright/test'

test('user can upload files', async ({ page }) => {
  await page.goto('/app/home')
  await page.getByRole('link', { name: 'Dateien' }).click()
  await expect((await page.getByRole('heading', { name: 'Dateien' }).all())[0]).toBeVisible()

  // TODO Jenni: there has to be a better way setting this up - maybe in playwright.config.ts & cache data?
  const alreadyUploadedFiles =!(await page.getByText('Keine Dateien gefunden').isVisible())
  if (alreadyUploadedFiles) {
    console.log('Files already set up')
    return
  }

  // ensure empty state of account
  await expect(page.getByText('Keine Ordner gefunden')).toBeVisible()
  await expect(page.getByText('Keine Dateien gefunden')).toBeVisible()

  await (await page.getByTestId('files-add-button').all())[1].click()
  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByTestId('file-upload-zone').click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(['./playwright/urlaub.md.pdf', './playwright/bei-krankheit.md.pdf'])

  await page.getByRole('button', { name: 'Hochladen' }).click()
  await expect(page.getByText('Die Datei urlaub.md.pdf wurde hochgeladen.')).toBeVisible()
  await expect(page.getByText('Die Datei bei-krankheit.md.pdf wurde hochgeladen.')).toBeVisible()

  const firstItem = (await page.getByTestId('file-item').all())[0]
  await expect(firstItem.getByText('urlaub.md.pdf')).toBeVisible()
  await expect(firstItem.getByText('Wird indexiert')).toBeVisible()
  await expect(firstItem.getByText('Bereit')).toBeVisible({ timeout: 15 * 1000 })
})
