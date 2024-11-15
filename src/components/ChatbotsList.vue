<script setup lang="ts">
import { ContentLoader } from 'vue-content-loader'
import ChatbotPreviewBox from '@/components/ChatbotPreviewBox.vue'
import Icon1 from '@/assets/icons/card-icon-1.svg'
import Icon2 from '@/assets/icons/card-icon-2.svg'
import Icon3 from '@/assets/icons/card-icon-3.svg'

import type { Chatbot } from '@/types'

const iconsList = [Icon1, Icon2, Icon3]

const getIcon = (i: number) => {
  const num = i % 3
  return iconsList[num]
}

withDefaults(
  defineProps<{
    chatbots: Chatbot[]
    isLoading: boolean
    isEditable?: boolean //currently unused
  }>(),
  {
    isEditable: false
  }
)

const emit = defineEmits<{
  (e: 'select', chatbot: Chatbot): void
}>()

function handleClick(chatbot: Chatbot) {
  emit('select', chatbot)
}
</script>

<template>
  <div class="chatbots-list">
    <content-loader
      v-if="isLoading"
      style="max-width: 422px"
      viewBox="0 0 402 113"
      :speed="2"
      primaryColor="#f3f3f3"
      secondaryColor="#f6ebff"
    >
      <rect x="0" y="0" rx="8" ry="8" width="190" height="113" />
      <rect x="1" y="1" rx="8" ry="8" width="189" height="112" />
      <rect x="212" y="0" rx="8" ry="8" width="190" height="113" />
      <rect x="213" y="1" rx="8" ry="8" width="189" height="112" />
    </content-loader>
    <ChatbotPreviewBox
      v-else
      v-for="(chatbot, i) in chatbots"
      :key="chatbot.id"
      @click="handleClick(chatbot)"
      :title="chatbot.name"
      :color="chatbot.color"
      :description="chatbot.description"
      :Icon="getIcon(i)"
      :file-count="chatbot.files?.length"
      :individuals="chatbot.individuals"
      :owner_id="chatbot.owner_id"
      :chatbot_id="chatbot.id"
    />
  </div>
</template>

<style scoped lang="scss">
.chatbots-list {
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
  padding-bottom: 22px;
}

@media screen and (max-width: 786px) {
  .chatbots-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@media screen and (max-width: 500px) {
  .chatbots-list {
    grid-template-columns: 1fr;
  }
}
</style>
