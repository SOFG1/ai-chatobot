<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useConversationsStore } from '@/stores/conversations'
import SendIconUrl from '@/assets/icons/send.svg?url'
import ChatbotSelection from '@/components/ChatbotSelection.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Stores
const conversationsStore = useConversationsStore()

// Refs
const chatInput = ref('')
const chatInputRef = ref<HTMLTextAreaElement | null>(null)
const chatHistoryRef = ref<HTMLDivElement | null>(null)
const chatInputWrapperRef = ref<HTMLDivElement | null>(null)
const { activeConversation } = storeToRefs(conversationsStore)
const emit = defineEmits(['windowOpened'])

async function sendMessage() {
  if (!chatInput.value.trim()) return

  if (!conversationsStore.chatWindowOpen) {
    conversationsStore.chatWindowOpen = true
    emit('windowOpened')
  }

  try {
    const userPrompt = chatInput.value
    chatInput.value = ''
    adjustTextareaHeight() // Reset heights after sending message
    await conversationsStore.requestChatting(userPrompt)
    chatInputRef.value?.focus()
  } catch (error) {
    console.error('Error sending message:', error)
    conversationsStore.addErrorMessage()
  }
}

function handleKeyup(event: KeyboardEvent) {
  if (!event.shiftKey && event.key === 'Enter') {
    event.preventDefault()
    sendMessage()
  }
}

function adjustTextareaHeight() {
  const textarea = chatInputRef.value
  const wrapper = chatInputWrapperRef.value

  if (textarea && wrapper) {
    // Reset the height to compute the new height
    textarea.style.height = 'auto'

    // Calculate the new height
    const newHeight = Math.min(textarea.scrollHeight, 200)
    textarea.style.height = `${newHeight}px`

    // Adjust the wrapper height accordingly
    wrapper.style.height = `${newHeight + 20}px` // Adding padding or margin if needed
  }
}

function scrollChatHistoryToBottom(behavior: ScrollBehavior = 'smooth') {
  const el = chatHistoryRef.value
  const scrollHeight = el?.scrollHeight
  el?.scrollTo({ top: scrollHeight, behavior })
}

let scrollDownInterval: NodeJS.Timeout

// Adjust the textarea height on input
watch(chatInput, adjustTextareaHeight)

//Scroll chat to the latest message
watch(
  () => activeConversation.value?.history?.length,
  () => {
    scrollChatHistoryToBottom()
  },
  { flush: 'post' }
)

watch(
  () => conversationsStore.requestWaiting,
  (value) => {
    if (value === true) {
      scrollDownInterval = setInterval(() => {
        scrollChatHistoryToBottom('instant')
      }, 200)
    } else {
      clearInterval(scrollDownInterval)
    }
  },
  { flush: 'post' }
)

watch(
  () => conversationsStore.chatWindowOpen,
  (val) => {
    if (val === true) chatInputRef.value?.focus()
  }
)

onMounted(() => {
  chatInputRef.value?.focus()
  adjustTextareaHeight() // Initialize the height
})
</script>

<template>
  <div class="chat-window" data-testId="chat-window">
    <div ref="chatHistoryRef" :class="['chat-history', { extended: conversationsStore.chatWindowOpen }]">
      <ChatMessage
        v-for="msg in activeConversation?.history.filter((m) => m.role !== 'system')"
        :key="msg.id"
        :message="msg"
        data-testId="chat-message"
      />
      <div id="anchor"></div>
    </div>
    <div :class="['chat-input-wrapper', { extended: conversationsStore.chatWindowOpen }]" ref="chatInputWrapperRef">
      <div class="chat-input-container">
        <textarea
          v-model="chatInput"
          ref="chatInputRef"
          class="chat-input"
          :placeholder="t('chatbot.sample-prompt')"
          :disabled="conversationsStore.requestWaiting"
          @keydown.enter="handleKeyup"
          data-testId="chat-input"
        />
      </div>
      <img :src="SendIconUrl" alt="send" @click="sendMessage" />
    </div>

    <ChatbotSelection v-if="!conversationsStore.chatWindowOpen" />
  </div>
</template>

<style scoped lang="scss">
.chat-input-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 12px;
  overflow: hidden;
  height: auto;

  &.extended {
    margin-top: 0;
    max-height: 25dvh;
  }

  img {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 12px;
    margin: auto;
    cursor: pointer;
  }
}

.chat-input-container {
  position: relative;
  width: 100%;
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  border-radius: var(--8, 0.5rem);
  border: 1px solid var(--color-border);
  background: var(--gradient-primary);
  outline-color: var(--color-border);
  padding: 0 30px 0 15px;
  box-sizing: border-box;
}

.chat-input {
  width: 100%;
  align-content: center;
  border: none;
  background: transparent;
  font-size: 16px;
  font-family: Mulish, sans-serif;
  resize: none;
  padding: 10px 0;
  outline: none;
  overflow-y: auto;
  min-height: 60px;
  max-height: 200px;
  line-height: 1.5;
}

.chat-window {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100%;
  min-width: 300px;
  max-width: 980px;
}

.chat-history {
  transition:
    max-height 0.7s cubic-bezier(0.34, -0.01, 0, 0.99),
    opacity 0.3s cubic-bezier(1, 0.5, 0.8, 1);
  transition-delay: 0.05s;
  max-height: 0;
  visibility: hidden;
  opacity: 0;
  height: 100%;
  overflow-y: auto;

  &.extended {
    max-height: 100% !important;
    visibility: visible;
    opacity: 1;
  }
}

.chat-history * {
  overflow-anchor: none;
}

.chat-history #anchor {
  overflow-anchor: auto;
  height: 1px;
}

@media screen and (max-width: 786px) {
  .chat-window {
    min-width: 0;
  }
}
</style>
