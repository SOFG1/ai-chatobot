import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import type { Chatbot, Citation, Conversation, ConversationIdAndTitle, Message } from '@/types'
import router from '@/router'
import { stream } from 'fetch-event-stream'
import i18n from '@/i18n'

export const useConversationsStore = defineStore('conversations', () => {
  const conversations = ref<ConversationIdAndTitle[]>([])
  const activeConversation = ref<Conversation | null>(null)
  const chatWindowOpen = ref<boolean>(false)
  const requestWaiting = ref<boolean>(false)
  const localStorageSelectedLLM = localStorage.getItem('selectedLLM')
  const selectedLLM = ref<string | null>(localStorageSelectedLLM)
  const openedCitation = ref<Citation | null>(null)

  watch(selectedLLM, (newSelectedLLM) => {
    if (newSelectedLLM != null) {
      localStorage.setItem('selectedLLM', newSelectedLLM)
    }
  })

  async function fetchAllConversations() {
    try {
      const response = await axios.get<ConversationIdAndTitle[]>('/api/conversations')
      conversations.value = response.data
    } catch (error) {
      toast(i18n.global.t('conversations.toasts.error-fetching-conversations'), {
        autoClose: 3000,
        type: 'error'
      })
      console.error('Error fetching conversations:', error)
    }
  }

  function prepareNewConversation(chatbot: Chatbot) {
    activeConversation.value = {
      title: i18n.global.t('conversations.new-chat-default-name'),
      history: [],
      chatbot,
      ts_created: new Date().toISOString(),
      ts_last_updated: new Date().toISOString()
    }
    chatWindowOpen.value = true
  }

  async function fetchConversation(id: string): Promise<Conversation | null> {
    try {
      const response = await axios.get<Conversation>(`/api/conversations/${id}`)
      return response.data
    } catch (error) {
      toast(i18n.global.t('conversations.toasts.error-fetching-conversations'), {
        autoClose: 3000,
        type: 'error'
      })
      console.error('Error fetching conversation:', error)
      return null
    }
  }

  async function startConversationIfNotExists() {
    if (!activeConversation.value) throw new Error('No active conversation')
    try {
      // if id is not empty then it an old conversation
      if (typeof activeConversation.value?.id === 'undefined' || activeConversation.value?.id.length <= 0) {
        const response = await axios.post<Conversation>('/api/conversations', {
          chatbot_id: activeConversation.value.chatbot.id
        })
        const chatbot = activeConversation.value.chatbot
        activeConversation.value = response.data
        activeConversation.value.history = []
        activeConversation.value.chatbot = chatbot
        return true
      }
    } catch (error) {
      toast(i18n.global.t('conversations.toasts.error-starting-conversation'), {
        autoClose: 3000,
        type: 'error'
      })
      console.error('Error starting conversation:', error)
    }
    return false
  }

  async function requestChatting(prompt: string): Promise<void> {
    if (!activeConversation.value) prepareNewConversation(getDefaultChatbot())
    if (!activeConversation.value) throw new Error('No active conversation')

    try {
      requestWaiting.value = true
      const conversationFirstTimeCreated = await startConversationIfNotExists()
      const userMessage: Message = {
        created: new Date().toISOString(),
        role: 'user',
        content: prompt
      }
      activeConversation.value.history.push(userMessage)

      // const lastElement = activeConversation.value.history[activeConversation.value.history.length - 1]
      if (selectedLLM.value === null) {
        toast(i18n.global.t('conversations.toasts.error-llm-not-set'), {
          autoClose: 3000,
          type: 'error'
        })
        return
      }
      const requestBodyStr = JSON.stringify({
        message: prompt.trim(),
        llm: selectedLLM.value
      })

      const assistantMessage: Message = {
        created: new Date().toISOString(),
        role: 'ai',
        content: '',
        id: 'tmp-new',
        llm: selectedLLM?.value ?? undefined,
        order: activeConversation.value.history.length
      }

      activeConversation.value.history.push(assistantMessage)
      activeConversation.value.ts_last_updated = new Date().toISOString()

      const jwtToken = localStorage.getItem('token')
      if (!jwtToken) await router.push({ name: 'login' })

      const url = `${import.meta.env.VITE_TXAI_BACKEND_URL}/api/chat/${activeConversation.value.id}`
      const events = await stream(url, {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}` // use JWT token in Authorization header
        },
        body: requestBodyStr
      })

      const lastMessageEntry: Message | undefined =
        activeConversation.value?.history[activeConversation.value.history.length - 1]
      if (!lastMessageEntry) return

      let responseMetadata
      for await (const ev of events) {
        try {
          switch (ev.event) {
            case 'context':
              lastMessageEntry.citations = JSON.parse(<string>ev.data).citations
              break
            case 'metadata':
              responseMetadata = JSON.parse(<string>ev.data)
              break
            case 'error':
              if (ev.data) {
                lastMessageEntry.content = ev.data
              }
              lastMessageEntry.error = true

              toast(i18n.global.t('conversations.toasts.error-sending-message'), {
                autoClose: 3000,
                type: 'error'
              })
              console.error(`received error from backend while streaming chat response: ${JSON.stringify(ev)}`)
              break
            default:
              lastMessageEntry.content += JSON.parse(<string>ev.data)
              break
          }

          if (responseMetadata) {
            lastMessageEntry.id = responseMetadata.message_id
            lastMessageEntry.created = responseMetadata.created
          }
        } catch (err) {
          console.error('Could not process server sent events.', err)
        }
      }

      if (conversationFirstTimeCreated) {
        generateTitle()
          .then(() => fetchAllConversations())
          .catch((err) => console.log(err))
      }

      return
    } catch (error) {
      // toast(i18n.global.t('conversations.toasts.error-sending-message'), {
      //   autoClose: 3000,
      //   type: 'error'
      // })
      console.error('Error sending message:', error)
      throw error
    } finally {
      requestWaiting.value = false
    }
  }

  function addErrorMessage() {
    if (activeConversation.value) {
      activeConversation.value.history.push({
        role: 'ai',
        content: '<server error>',
        order: activeConversation.value.history.length,
        created: new Date().toISOString()
      })
    }
  }

  async function deleteConversation(id: string) {
    axios
      .delete(`/api/conversations/${id}`)
      .then(() => {
        if (activeConversation.value?.id === id) {
          detachConversation() // fetches all conversations, too.
        } else {
          fetchAllConversations()
        }
      })
      .catch((err) => console.log('could not delete conversation', err))
  }

  async function renameConversation(id: string, title: string) {
    axios
      .patch(`/api/conversations/${id}/title`, { title })
      .then(() => {
        console.log('conversation renamed', id)
      })
      .catch((err) => console.log('could not rename conversation', err))
  }

  async function generateTitle(conversationId: string = activeConversation?.value?.id!) {
    if (!activeConversation.value) throw new Error('No active conversation')
    await axios.post(`/api/conversations/${conversationId}/title`, { llm: selectedLLM.value })
  }

  function detachConversation() {
    chatWindowOpen.value = false
    activeConversation.value = null
    fetchAllConversations().catch((err) => console.log(err))
  }

  async function attachConversation(conversation: Conversation) {
    chatWindowOpen.value = true
    activeConversation.value = conversation
    await router.push({ name: 'home' })
  }

  function getDefaultChatbot() {
    const ENTERPRISE_SEARCH_STATIC_CHATBOT: Chatbot = {
      owner_id: '',
      name: i18n.global.t('chatbot.preset.name'),
      description: i18n.global.t('chatbot.preset.description'),
      system_prompt: i18n.global.t('chatbot.preset.system-prompt'),
      citations_mode: false,
      id: '5dd4e868-96fc-4ef6-98b4-4589dd94b1bd',
      files: [],
      color: '#404999',
      icon: 'default',
      groups: [],
      individuals: []
    }

    return ENTERPRISE_SEARCH_STATIC_CHATBOT
  }

  return {
    conversations,
    activeConversation,
    chatWindowOpen,
    requestWaiting,
    selectedLLM,
    fetchAllConversations,
    prepareNewConversation,
    requestChatting,
    addErrorMessage,
    generateTitle,
    fetchConversation,
    detachConversation,
    attachConversation,
    getDefaultChatbot,
    openedCitation,
    deleteConversation,
    renameConversation
  }
})
