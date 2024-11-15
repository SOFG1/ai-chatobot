import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import type { CreateGroupPayload, Group } from '@/types'
import i18n from '@/i18n'
import { handleError } from '@/utils/error'

export const useGroupsStore = defineStore('groups', () => {
  const groups = ref<Group[]>([])

  async function fetchGroups() {
    try {
      const response = await axios.get<Group[]>('/api/groups')
      groups.value = response.data
    } catch (error) {
      toast(i18n.global.t('groups.toasts.fetch-error'), {
        autoClose: 3000,
        type: 'error'
      })
      console.error('Error fetching groups:', error)
    }
  }

  //This function updates group if it exists, if not adds it
  function refreshGroup(group: Group) {
    const index = groups.value.findIndex((g) => g.id === group.id)
    if (index >= 0) {
      groups.value[index] = group
    }
    if (index < 0) {
      groups.value.push(group)
    }
  }

  async function createGroup(data: CreateGroupPayload) {
    try {
      const response = await axios.post<Group>('/api/groups', data)
      console.log(response)
      groups.value.unshift(response.data)
      return response
    } catch (error) {
      console.error('Error creating groups:', error)
      throw error
    }
  }

  async function editGroup(id: string, data: any) {
    const response = await axios.patch<Group>(`/api/groups/${id}`, data)
    refreshGroup(response.data)
    return response
  }

  async function deleteGroup(id: string) {
    await axios.delete<Group>(`/api/groups/${id}`)
    groups.value = groups.value.filter((g) => g.id !== id)
  }

  async function addGroupMember(id: string, user_id: string) {
    try {
      const response = await axios.post<Group>(`/api/groups/${id}/user/${user_id}`)
      refreshGroup(response.data)
      toast(i18n.global.t('groups.add-member.success'), {
        autoClose: 3000,
        type: 'success'
      })
      return response
    } catch (e) {
      handleError(e, 'groups.toasts.add-user-error')
    }
  }

  async function deleteGroupMember(id: string, user_id: string) {
    try {
      const response = await axios.delete<Group>(`/api/groups/${id}/user/${user_id}`)
      console.log(response.data)
      refreshGroup(response.data)
      toast(i18n.global.t('groups.delete-member.success'), {
        autoClose: 3000,
        type: 'success'
      })
      return response
    } catch (e) {
      handleError(e, 'groups.toasts.delete-user-error')
    }
  }

  return {
    groups,
    fetchGroups,
    createGroup,
    addGroupMember,
    deleteGroup,
    editGroup,
    deleteGroupMember
  }
})
