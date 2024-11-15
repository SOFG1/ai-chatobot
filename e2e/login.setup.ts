import { test as setup, expect } from '@playwright/test'
import { STORAGE_USER_STATE } from '../playwright.config.js'

setup('login as admin shows welcome message on home screen', async ({ page }) => {

  await page.goto('/login')

  await page.getByPlaceholder('E-Mail oder Benutzername').click()
  await page.getByPlaceholder('E-Mail oder Benutzername').fill(process.env.ADMIN_ACCOUNT_EMAIL)
  await page.getByPlaceholder('E-Mail oder Benutzername').press('Tab')
  await page.getByLabel('Passwort').click()
  await page.getByLabel('Passwort').fill(process.env.ADMIN_ACCOUNT_PASSWORD)
  await page.getByRole('button', { name: 'Einloggen' }).click()
  await expect(page.getByRole('heading', { name: 'Willkommen, Admin!' })).toBeVisible()
  await page.context().storageState({ path: STORAGE_USER_STATE })
})
