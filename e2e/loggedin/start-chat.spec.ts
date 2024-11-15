import { test, expect } from '@playwright/test'

test('user can start chatting from start page', async ({ page }) => { 
  // ask question from home screen
  await page.goto('http://localhost:5173/app/home')
  await page.getByPlaceholder('Wie kannst du mir helfen?').click()
  await page.getByPlaceholder('Wie kannst du mir helfen?').fill('Wie kannst du mir helfen?')
  await page.getByRole('img', { name: 'send' }).click()

  await expect(page.getByTestId('chat-window').getByText('Admin', { exact: true })).toBeVisible()
  await expect(page.getByTestId('chat-window').getByText('Enterprise Search', { exact: true })).toBeVisible()
  
  // Loading indicator is shown
  await expect(page.locator('[data-testid="loading-message-icon"]').first()).toBeVisible();

  // check both chat messages are displayed
  const chatMessages = await page.locator('[data-testid="chat-message-text"]').all();
  expect(chatMessages.length).toBe(2)

  await expect(chatMessages[0]).toBeVisible()
  await expect(chatMessages[0]).toHaveText('Wie kannst du mir helfen?')
  await expect(chatMessages[1]).toBeVisible()
  await expect(chatMessages[1]).toContainText('helfen')

  // input new question, check that new answer is given:
  await page.getByTestId('chat-input').click();
  await page.getByTestId('chat-input').fill('Was gilt als Arbeitsunfall?');
  await page.getByRole('img', { name: 'send' }).click()
  await expect(page.locator('[data-testid="loading-message-icon"]').first()).toBeVisible();
  
  const secondQuestionChatMessages = await page.locator('[data-testid="chat-message-text"]').all();
  await expect(secondQuestionChatMessages[2]).toBeVisible()
  await expect(secondQuestionChatMessages[2]).toHaveText('Was gilt als Arbeitsunfall?')
  await expect(secondQuestionChatMessages[3]).toBeVisible()
  await expect(secondQuestionChatMessages[3]).toContainText('Arbeitsunfall')
})
