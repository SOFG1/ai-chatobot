import { expect, test as teardown } from '@playwright/test'

teardown('delete files', async ({ page }) => {
  await page.goto('/app/home')
  await page.getByRole('link', { name: 'Dateien' }).click()

  await expect(page.getByText('Laden Sie PDF oder DOCX Dateien hoch und verknüpfen Sie diese mit Ihrem Chatbot, um kontextbezogene Antworten zu erhalten.')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Dateien' }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Dateien' }).first()).toBeVisible()

  let files = await page.getByTestId('file-item').all()
  // using while because foreach loop had problems after first file was removed
  while (files.length > 0) {
    const file = files[0]
    await file.getByTestId('file-actions').click()
    await expect(page.getByText('Vorschau')).toBeVisible()
    await page.getByRole('button', { name: 'Löschen' }).click()
    await expect(page.getByText('Datei löschen?')).toBeVisible()
    await page.getByTestId('delete-modal').getByRole('button', { name: 'Löschen' }).click()
    await expect(page.getByText('Die Datei wurde gelöscht.')).toBeVisible()
    await expect(page.getByText('Die Datei wurde gelöscht.')).not.toBeVisible({ timeout: 7 * 6000 })
    files = await page.getByTestId('file-item').all()
  }

  await expect(page.getByText('Keine Dateien gefunden')).toBeVisible()
})
