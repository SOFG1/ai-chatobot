import { render, screen } from '@testing-library/vue'
import UsersTable from './UsersTable.vue'
import { describe, expect, it } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import i18n from '@/i18n'

describe('UsersTable', () => {
  it('initial state shows empty message', async () => {
    render(UsersTable, {
      props: {
        users: usersResponse
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              users: {
                users: [],
                userGroups: []
              }
            },
            stubActions: false
          }),
          i18n
        ]
      }
    })

    const noText = screen.queryByTestId('no-users')

    expect(noText).toBeDefined()
  })

  it('preloaded users are shown in table', async () => {
    render(UsersTable, {
      props: {
        users: usersResponse
      },
      global: {
        plugins: [
          createTestingPinia({
            stubActions: false
          }),
          i18n
        ]
      }
    })

    const entries = screen.getAllByTestId('column-username')
    const nodata = screen.queryByTestId('no-users')

    expect(nodata).toBeNull()
    expect(entries.length).toBe(3)
  })
})

const usersResponse = [
  {
    username: 'admin',
    name: 'Masiar Ighani',
    id: '46e534d5-39b1-4c25-a6be-7f853d2d719e',
    avatar: 'https://www.gravatar.com/avatar/a366ecfb1650eb43dd080fcaba2e6c3b189d81a5a958cbaf974beac5f467e3c8',
    created: '0',
    scopes: 'admin'
  },
  {
    username: 'test2',
    name: 'TestUser2',
    id: '0191dc01-c2d7-7b27-9268-82b3f7ae25cc',
    avatar: 'https://www.skillbyte.de/wp-content/uploads/2024/06/cropped-favicon-192x192.png',
    created: '0',
    scopes: 'user'
  },
  {
    username: 'test',
    name: 'TestUser',
    id: '0191ffa4-1285-7fa4-9215-6a2f9781bdf4',
    avatar: 'http://3.bp.blogspot.com/-7mdL3BahEYg/VkzN5T46pGI/AAAAAAABgr4/jOID7NXkdGE/s1600/funny-cat-gifs-181-09.gif',
    created: '0',
    scopes: 'user'
  }
]
