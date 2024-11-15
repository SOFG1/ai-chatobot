import { test, expect } from '@playwright/test'

test('user can create chatbot', async ({ page }) => {
  await page.goto('/app/home')
  await page.getByRole('link', { name: 'Chatbots' }).click()
  await expect(page.getByRole('heading', {name: 'Chatbots'})).toBeVisible()

  await page.getByRole('main').locator('img').click()
  await page.getByPlaceholder('Berater für Hochschulrecht').click()
  await page.getByPlaceholder('Berater für Hochschulrecht').fill('Skillbyte Mitarbeiter FAQ')
  await page.getByPlaceholder('Der Chatbot beantwortet').click()
  await page.getByPlaceholder('Der Chatbot beantwortet').fill('Skillbyte Mitarbeiter FAQ')
  await page.getByPlaceholder('Du bist ein KI Assistent,').click()
  await page
    .getByPlaceholder('Du bist ein KI Assistent,')
    .fill('Du bist ein KI Assistent, der Skillbyte Mitarbeitern Fragen aus der internen FAQ beantwortet.')
  await page.locator('label').filter({ hasText: 'Ein' }).getByRole('img').click()
  await page.getByPlaceholder('#fcbdbd').click()
  await page.getByPlaceholder('#fcbdbd').fill('#1123e8')

  await page.getByRole('button', { name: 'Erstellen' }).click()

  await expect(page.getByRole('heading', { name: 'Skillbyte Mitarbeiter FAQ' }).first()).toBeVisible()
})

test('user can edit chatbot', async ({ page }) => {
  await page.goto('/app/home')
  await page.getByRole('link', { name: 'Chatbots' }).click()
  await expect(page.getByRole('heading', {name: 'Chatbots'})).toBeVisible()
  await expect(page.getByText('Enterprise Search').first()).toBeVisible()

  await page.getByTestId('chatbot-preview').first().hover()
  await page.getByTestId('chatbot-preview').first().getByTestId('chatbot-edit').click()

  await page.getByPlaceholder('Berater für Hochschulrecht').click()
  await page.getByPlaceholder('Berater für Hochschulrecht').fill('Skillbyte Mitarbeiter FAQ Edited')
  await page.getByPlaceholder('Der Chatbot beantwortet').click()
  await page.getByPlaceholder('Der Chatbot beantwortet').fill('Skillbyte Mitarbeiter FAQ Edited Description')
  await page.getByPlaceholder('Du bist ein KI Assistent,').click()
  await page
    .getByPlaceholder('Du bist ein KI Assistent,')
    .fill(
      'Du bist ein KI Assistent, der Skillbyte Mitarbeitern Fragen aus der internen FAQ beantwortet. Antworte in der Höflichkeitsform.'
    )
  await page.getByPlaceholder('#fcbdbd').click()
  await page.getByPlaceholder('#fcbdbd').fill('#262b5e')
  await page.locator('label').filter({ hasText: 'Ein' }).getByRole('img').click()
  await page.getByRole('button', { name: 'Speichern' }).click()

  await expect(page.getByRole('heading', { name: 'Skillbyte Mitarbeiter FAQ Edited' })).toBeVisible()
  await expect(page.getByText('Skillbyte Mitarbeiter FAQ Edited Description')).toBeVisible()

  // open chatbot conversation to see changed title & description
  await (await page.getByTestId('chatbot-preview').all())[0].click()
  await expect(page.getByRole('heading', { name: 'Skillbyte Mitarbeiter FAQ Edited' })).toBeVisible()
  await expect(page.getByText('Skillbyte Mitarbeiter FAQ Edited Description')).toBeVisible()
})

test('user can edit chatbot to add files', async ({ page }) => {
  await page.goto('/app/home')
  await page.getByRole('link', { name: 'Chatbots' }).click()
  await expect(page.getByRole('heading', {name: 'Chatbots'})).toBeVisible()
  await expect(page.getByText('Enterprise Search').first()).toBeVisible()

  await page.getByTestId('chatbot-preview').first().hover()
  await page.getByTestId('chatbot-preview').first().getByTestId('chatbot-edit').click()

  await page.getByRole('button', { name: 'Dateien verbinden' }).click()
  await page.getByRole('dialog').locator('span').nth(2).click()
  await page.getByRole('button', { name: 'Verbinden', exact: true }).click()
  await expect(page.getByText('1 Datei ausgewählt')).toBeVisible()

  await page.getByRole('button', { name: 'Speichern' }).click()
  await expect(page.getByRole('heading', { name: 'Skillbyte Mitarbeiter FAQ' })).toBeVisible()
  await expect(page.getByText('1 Dateien')).toBeVisible()
})
