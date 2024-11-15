import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import axios, { AxiosError } from 'axios'
import { toast } from 'vue3-toastify'
import type { Chatbot, CreateChatbot } from '@/types'
import i18n from '@/i18n'

export const useChatbotsStore = defineStore('chatbots', () => {
  const ownChatbots = ref<Chatbot[]>([])
  const sharedChatbots = ref<Chatbot[]>([])
  const allChatbots = computed(() => ownChatbots.value.concat(sharedChatbots.value) || [])

  //This function updates chatbot if it exists, if not adds it
  function refreshChatbot(chatbot: Chatbot) {
    const index = ownChatbots.value.findIndex((c) => c.id === chatbot.id)
    if (index >= 0) {
      ownChatbots.value[index] = chatbot
    }
    if (index < 0) {
      ownChatbots.value.push(chatbot)
    }
  }

  async function fetchChatbots() {
    try {
      const response = await axios.get<Chatbot[]>('/api/chatbots')
      ownChatbots.value = response.data
    } catch (error) {
      toast(i18n.global.t('chatbot.toasts.error-fetching-chatbots'), {
        autoClose: 3000,
        type: 'error'
      })
      console.error('Error fetching chatbots:', error)
    }
  }

  async function fetchSharedChatbots() {
    try {
      const response = await axios.get<Chatbot[]>('/api/chatbots/shared')
      sharedChatbots.value = response.data
    } catch (error) {
      toast(i18n.global.t('chatbot.toasts.error-fetching-chatbots'), {
        autoClose: 3000,
        type: 'error'
      })
      console.error('Error fetching shared chatbots:', error)
    }
  }

  async function getChatbotById(uuid: string): Promise<Chatbot | null> {
    try {
      const response = await axios.get<Chatbot>(`/api/chatbots/${uuid}`)
      const chatbot = response.data
      refreshChatbot(chatbot)
      return chatbot
    } catch (error) {
      let errorMessage = i18n.global.t('chatbot.toasts.chatbot-loading-failed')
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          errorMessage = i18n.global.t('chatbot.toasts.chatbot-not-found-uuid', { uuid: uuid })
        } else if(error.response?.data?.detail?.error_code) {
          errorMessage = i18n.global.t(error.response?.data?.detail?.error_code, error.response?.data?.detail?.extra)
        }
      } else {
        console.error('An unexpected error occurred while fetching chatbot:', error)
      }
      toast(errorMessage, {
        autoClose: 3000,
        type: 'error'
      })
      return null
    }
  }

  async function createChatBot(chatbotData: CreateChatbot) {
    try {
      const response = await axios.post('/api/chatbots', chatbotData)
      refreshChatbot(response.data)
    } catch (error) {
      let errorMessage = i18n.global.t('chatbot.toasts.chatbot-loading-failed')
      if (error instanceof AxiosError && error.error.response?.data?.detail?.error_code) {
        errorMessage = i18n.global.t(error.response?.data?.detail?.error_code, error.response?.data?.detail?.extra)
        console.error('Error creating chatbot:', error.response.data.message || error.message)
      } else {
        console.error('An unexpected error occurred while creating chatbot:', error)
      }
      toast(errorMessage, {
        autoClose: 3000,
        type: 'error'
      })
      throw error
    }
  }

  async function updateChatbot(id: string, chatbotData: CreateChatbot): Promise<Chatbot | null> {
    try {
      const response = await axios.patch<Chatbot>(`/api/chatbots/${id}`, chatbotData)
      // TODO: Backend fix; returned chatbot missing files array
      refreshChatbot(response.data)
      return response.data
    } catch (error) {
      let errorMessage = i18n.global.t('chatbot.toasts.chatbot-loading-failed')
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          errorMessage = i18n.global.t('chatbot.toasts.chatbot-not-found')
          console.error(`Chatbot with ID ${chatbot.id} not found`)
        } else if( error.error.response?.data?.detail?.error_code) {
          errorMessage = i18n.global.t(error.response?.data?.detail?.error_code, error.response?.data?.detail?.extra)
          console.error('Error updating chatbot:', error.response?.data.message || error.message)
        }
      } else {
        console.error('An unexpected error occurred while updating chatbot:', error)
      }
      toast(errorMessage, {
        autoClose: 3000,
        type: 'error'
      })
      throw error
    }
  }

  async function shareChatBotUser(chatBotId: string, userId: string) {
    try {
      const response = await axios.post(`/api/chatbots/${chatBotId}/user/${userId}`)
      // TODO: Backend fix; returned chatbot missing files array
      refreshChatbot(response.data)
      toast(i18n.global.t('chatbot.toasts.share-chatbot-success'), {
        autoClose: 3000,
        type: 'success'
      })
    } catch (error) {
      let errorMessage = i18n.global.t('chatbot.toasts.chatbot-loading-failed')
      if (error instanceof AxiosError && error.error.response?.data?.detail?.error_code) {
        errorMessage = i18n.global.t(error.response?.data?.detail?.error_code, error.response?.data?.detail?.extra)
        console.error('Error sharing chatbot:', error.response.data.message || error.message)
      } else {
        console.error('An unexpected error occurred while sharing chatbot:', error)
      }
      toast(errorMessage, {
        autoClose: 3000,
        type: 'error'
      })
    }
  }

  async function shareChatBotGroup(chatBotId: string, groupId: string) {
    try {
      const response = await axios.post(`/api/chatbots/${chatBotId}/group/${groupId}`)
      refreshChatbot(response.data)
      toast(i18n.global.t('chatbot.toasts.share-chatbot-success'), {
        autoClose: 3000,
        type: 'success'
      })
    } catch (error) {
      let errorMessage = i18n.global.t('chatbot.toasts.chatbot-loading-failed')
      if (error instanceof AxiosError && error.error.response?.data?.detail?.error_code) {
        errorMessage = i18n.global.t(error.response?.data?.detail?.error_code, error.response?.data?.detail?.extra)
        console.error('Error sharing chatbot:', error.response.data.message || error.message)
      } else {
        console.error('An unexpected error occurred while sharing chatbot:', error)
      }
      toast(errorMessage, {
        autoClose: 3000,
        type: 'error'
      })
    }
  }

  async function unshareChatBotUser(chatBotId: string, userId: string) {
    try {
      const response = await axios.delete(`/api/chatbots/${chatBotId}/user/${userId}`)
      refreshChatbot(response.data)
      toast(i18n.global.t('chatbot.toasts.unshare-chatbot-success'), {
        autoClose: 3000,
        type: 'success'
      })
    } catch (error) {
      let errorMessage = i18n.global.t('chatbot.toasts.unshare-chatbot-error')
      if (error instanceof AxiosError && error.error.response?.data?.detail?.error_code) {
        errorMessage = i18n.global.t(error.response?.data?.detail?.error_code, error.response?.data?.detail?.extra)
        console.error('Error unsharing chatbot:', error.response.data.message || error.message)
      } else {
        console.error('An unexpected error occurred while unsharing chatbot:', error)
      }
      toast(errorMessage, {
        autoClose: 3000,
        type: 'error'
      })
    }
  }

  async function unshareChatBotGroup(chatBotId: string, groupId: string) {
    try {
      const response = await axios.delete(`/api/chatbots/${chatBotId}/group/${groupId}`)
      refreshChatbot(response.data)
      toast(i18n.global.t('chatbot.toasts.unshare-chatbot-success'), {
        autoClose: 3000,
        type: 'success'
      })
    } catch (error) {
      let errorMessage = i18n.global.t('chatbot.toasts.unshare-chatbot-error')
      if (error instanceof AxiosError && error.error.response?.data?.detail?.error_code) {
        errorMessage = i18n.global.t(error.response?.data?.detail?.error_code, error.response?.data?.detail?.extra)
        console.error('Error unsharing chatbot:', error.response.data.message || error.message)
      } else {
        console.error('An unexpected error occurred while unsharing chatbot:', error)
      }
      toast(errorMessage, {
        autoClose: 3000,
        type: 'error'
      })
    }
  }

  async function deleteChatbot(chatbot_id: string) {
    try {
      const response = await axios.delete<Chatbot>(`/api/chatbots/${chatbot_id}`)
      ownChatbots.value = ownChatbots.value.filter((c) => c.id !== chatbot_id)
      sharedChatbots.value = sharedChatbots.value.filter((c) => c.id !== chatbot_id)
    } catch (error) {
      let errorMessage
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          errorMessage = `Chatbot with ID ${chatbot_id} not found`
          console.error(`Chatbot with ID ${chatbot_id} not found`)
        } else {
          console.error('Error deleting chatbot:', error.response?.data.message || error.message)
          errorMessage = error.response?.data.message || error.message || 'Error deleting chatbot'
        }
      } else {
        errorMessage = 'An unexpected error occurred while deleting chatbot'
        console.error('An unexpected error occurred while deleting chatbot:', error)
      }
      toast(errorMessage, {
        autoClose: 3000,
        type: 'error'
      })
    }
  }

  return {
    ownChatbots,
    sharedChatbots,
    allChatbots,
    fetchChatbots,
    fetchSharedChatbots,
    createChatBot,
    getChatbotById,
    updateChatbot,
    shareChatBotUser,
    unshareChatBotUser,
    shareChatBotGroup,
    unshareChatBotGroup,
    refreshChatbot,
    deleteChatbot
  }
})
