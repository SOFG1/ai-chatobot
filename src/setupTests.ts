import { beforeAll, afterEach, afterAll } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { config } from '@vue/test-utils'
import i18n from '@/i18n'
import { createTestingPinia } from '@pinia/testing'

config.global.plugins = [
  i18n,
  createTestingPinia()
]

export const restHandlers = [
  http.get('/api/users', ({ request }) => {
    return HttpResponse.json(usersResponse)
  })
]

const server = setupServer(...restHandlers)

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

//  Close server after all tests
afterAll(() => server.close())

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers())

const usersResponse = [
  {
    username: 'admin',
    name: 'Masiar Ighani',
    id: '46e534d5-39b1-4c25-a6be-7f853d2d719e',
    avatar: 'https://www.gravatar.com/avatar/a366ecfb1650eb43dd080fcaba2e6c3b189d81a5a958cbaf974beac5f467e3c8'
  },
  {
    username: 'Jenni',
    name: 'Amy',
    id: '0191dc01-c2d7-7b27-9268-82b3f7ae25cc',
    avatar: 'https://www.skillbyte.de/wp-content/uploads/2024/06/cropped-favicon-192x192.png'
  },
  {
    username: 'test',
    name: 'TestUser',
    id: '0191ffa4-1285-7fa4-9215-6a2f9781bdf4',
    avatar: 'http://3.bp.blogspot.com/-7mdL3BahEYg/VkzN5T46pGI/AAAAAAABgr4/jOID7NXkdGE/s1600/funny-cat-gifs-181-09.gif'
  }
]
