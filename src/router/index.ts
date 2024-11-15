import { createRouter, createWebHistory } from 'vue-router'
import VersionView from '@/views/VersionView.vue'
import ChatbotFormView from '@/views/chatbot/ChatbotFormView.vue'
import Application from '@/pages/ApplicationPage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import { useAuthStore } from '@/stores/auth'
import type { UserScope } from '@/types'
import SettingsView from '@/views/SettingsView.vue'
import FilesView from '@/views/FilesView.vue'
import ChatbotsView from '@/views/ChatbotsView.vue'
import HomeView from '@/views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'root',
    redirect: () => {
      // The function receives the target route as the argument
      // We return a redirect path/location here.
      return { name: 'home' }
    },
    children: [
      {
        path: '/app',
        name: 'app',
        component: Application,
        redirect: () => {
          // The function receives the target route as the argument
          // We return a redirect path/location here.
          return { name: 'home' }
        },
        meta: {
          requiresAuth: true
        },
        children: [
          {
            path: 'home',
            name: 'home',
            component: HomeView,
            meta: {
              permission: 'conversations'
            }
          },
          {
            path: 'chatbots',
            name: 'chatbots',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            // component: ChatbotsView,
            children: [
              {
                path: '',
                name: 'chatbots-list',
                component: ChatbotsView
              },
              {
                path: 'create',
                name: 'chatbots-create',
                component: ChatbotFormView
              },
              {
                path: 'edit/:id',
                name: 'chatbots-edit',
                component: ChatbotFormView
              }
            ],
            meta: {
              permission: 'chatbots'
            }
          },
          {
            path: 'files',
            name: 'files',
            component: FilesView,
            meta: {
              permission: 'files'
            }
          },
          {
            path: 'settings',
            name: 'settings',
            component: SettingsView
          },
          {
            path: 'version',
            name: 'version',
            component: VersionView
          }
        ]
      },
      {
        path: 'login',
        name: 'login',
        component: LoginPage
      },
      {
        path: 'logout',
        name: 'logout'
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // @ts-ignore
  routes
})

// Add a navigation guard to check authentication and permissions before each route is loaded
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  await authStore.initialize()

  if (to.name === 'logout') {
    authStore.logout()
    next({ name: 'login', replace: true })
    return
  }

  // Redirect the user to home if user is logged in and trying to access login page
  if (to.name === 'login' && authStore.isLoggedIn) {
    next({ name: 'app' }) // or 'home' if 'app' is your home route
    return
  }

  // If a route requires authentication and the user is not logged in, redirect to login
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({ name: 'login' })
    return
  }

  //Check permissions
  const scopes = authStore.user?.scopes
  const list = scopes?.split(',')
  if (to.meta.permission && scopes !== '*' && !list?.includes(to.meta.permission as UserScope)) {
    //Navigate to an allowed page
    if (list?.includes('conversations')) return { name: 'home' }
    if (list?.includes('chatbots')) return { name: 'chatbots' }
    if (list?.includes('files')) return { name: 'files' }
    return { name: 'settings' }
  }

  next()
})

export default router
