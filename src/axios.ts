import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export function initBaseUrl() {
  axios.defaults.baseURL = import.meta.env.VITE_TXAI_BACKEND_URL
}

export function setupAxiosInterceptor() {
  const authStore = useAuthStore() // Now called inside a function

  axios.interceptors.request.use(
    (config) => {
      if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`
      }
      return config
    },
    (error) => {
      // Handle request error
      return Promise.reject(error)
    }
  )
}
