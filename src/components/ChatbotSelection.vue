<script setup lang="ts">
import ChatbotsList from '@/components/ChatbotsList.vue'
import type { Chatbot } from '@/types'
import { useConversationsStore } from '@/stores/conversations'
import { useUtilsStore } from '@/stores/utils'
import { onBeforeMount } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatbotsStore } from '@/stores/chatbots'

const conversationsStore = useConversationsStore()

function prepareChatbot(chatbot: Chatbot) {
  conversationsStore.prepareNewConversation(chatbot)
}

// Stores
const utilsStore = useUtilsStore()
const chatbotsStore = useChatbotsStore()

onBeforeMount(async () => {
  utilsStore.isLoading = true
  await chatbotsStore.fetchChatbots()
  await chatbotsStore.fetchSharedChatbots()
  utilsStore.isLoading = false
})

const { allChatbots }: { allChatbots: Chatbot[] } = storeToRefs(chatbotsStore)
</script>

<template>
  <div>
    <section>
      <h2 style="margin-top: 32px">{{ $t('home.use-custom-chatbot') }}</h2>
      <div class="chatbot-selection">
        <ChatbotsList @select="prepareChatbot" :chatbots="allChatbots" :is-loading="utilsStore.isLoading" />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.chatbot-selection {
  margin-top: 12px;
}
.chatbots-list {
  max-width: 100%;
  margin: 14px 0 0 0;
}

@media screen and (max-width: 786px) {
  h2 {
    font-size: 20px;
  }
}
</style>
