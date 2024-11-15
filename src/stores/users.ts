import { defineStore } from 'pinia'
import axios from 'axios'
import type { CreateUserData, Group, User } from '@/types' // Assuming you have types defined
import { toast } from 'vue3-toastify'

interface UsersState {
  users: User[]
  userGroups: Group[]
}

export const useUsersStore = defineStore<
  'users',
  UsersState,
  {}, // Getters - not used in this example
  {
    initialize: () => Promise<void>
    load: (offset: number, limit: number) => Promise<User[]>
    createUser: (data: CreateUserData) => Promise<any>
    deleteUser: (id: string) => Promise<any>
    editUserScopes: (id: string, scopes: string[]) => Promise<any>
    fetchGroups: () => void
  }
>('users', {
  state: () => ({
    users: [],
    userGroups: []
  }),
  actions: {
    async initialize() {
      await this.load(0, 10)
    },

    async load(offset: number, limit: number) {
      try {
        const response = await axios.get<User[]>(`/api/users?offset=${offset ?? 0}&limit=${limit ?? 10}`)
        this.users = response.data
        return response.data
      } catch (error) {
        console.error('Error fetching users:', error)
        throw error
      }
    },

    async createUser(data: CreateUserData) {
      const response = await axios.post<User>('/api/users', data)
      this.users.push(response.data)
      return response.data
    },

    async deleteUser(id: string) {
      const response = await axios.delete(`/api/users/${id}`)
      console.log(this.users, id)
      this.users = this.users.filter((u) => u.id !== id)
      console.log(this.users)
      return response.data
    },

    async editUserScopes(id: string, scopes: string[]) {
      try {
        const response = await axios.patch(`/api/users/${id}/scopes`, { scopes })
        const index = this.users.findIndex((u) => u.id === id)
        this.users[index] = response.data
        toast(i18n.t('settings.user-table.toasts.role-change-success'), {
          type: 'success',
          autoClose: 3000
        })
        return response.data
      } catch (e: any) {
        let msg
        if (e.response.data?.detail?.error_code) {
          msg = i18n.t(e.response.data?.detail?.error_code, e.response.data?.detail?.extra)
        }
        toast(i18n.t('settings.user-table.toasts.role-change-error', { errorMsg: msg }), {
          type: 'error',
          autoClose: 3000
        })
        throw e
      }
    },
    async fetchGroups() {
      try {
        const response = await axios.get<Group[]>('/api/users/groups')
        this.userGroups = response.data
        return response.data
      } catch (error) {
        console.error('Error fetching groups:', error)
      }
    }
  }
})
