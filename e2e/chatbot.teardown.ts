import { expect, test as teardown } from '@playwright/test'

teardown('delete chatbot', async ({ page }) => {
  await page.goto('/app/home')
  await page.getByRole('link', { name: 'Chatbots' }).click()

  await expect(page.getByRole('heading', { name: 'Skillbyte Mitarbeiter FAQ' }).first()).toBeVisible()
  const chatbot = (await page.getByTestId('chatbot-preview').all()).filter((loc) =>
    loc.getByText('Skillbyte Mitarbeiter FAQ')
  )[0]
  await expect(chatbot).toBeVisible()
  await chatbot.hover()
  await chatbot.getByTestId('chatbot-edit').click()

  await page.getByRole('main').getByRole('button').nth(3).click()
  await page.getByRole('strong').click()
  await page.getByRole('button', { name: 'Löschen' }).click()

  await expect(page.getByRole('heading', { name: 'Skillbyte Mitarbeiter FAQ' })).not.toBeVisible()
})
