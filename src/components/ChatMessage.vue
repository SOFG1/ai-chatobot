<script setup lang="ts">
import type { Message } from '@/types'
import LoadingSvg from '@/assets/img/loading.svg'
import { computed, ref } from 'vue'
import { marked } from 'marked'
import CitationBox from '@/components/citation/CitationBox.vue'
import { useAuthStore } from '@/stores/auth'
import { useConversationsStore } from '@/stores/conversations'
import TsaiAvatar from './TsaiAvatar.vue'
import CitationTooltips from '@/components/citation/CitationTooltips.vue'
import { DateTime } from 'luxon'

// Stores
const conversationsStore = useConversationsStore()
const authStore = useAuthStore()

const props = defineProps<{
  message: Message
}>()

const messageData = computed(() => {
  let content =
    props.message.role === 'user'
      ? (marked.parse(props.message.content.replace(/\n/g, '  \n')) as string)
      : (marked.parse(props.message.content) as string)

  // Match all footnotes with regex and capture the digit(s) inside square brackets
  const matches = props.message.content.matchAll(/\[(\d+)]/g)

  // Get the entire match (like '[2]') and the captured group (the number '2')
  const footnotes = Array.from(matches).map((i) => ({
    fullMatch: i[0], // The full match, like "[2]"
    number: i[1] // The captured group, like "2"
  }))

  // Replace footnotes [x] in content with tooltip reference (el)
  footnotes.forEach((f, index) => {
    const el = `<span class="footnote footnote-${props.message.id}-${index}">${f.number}</span>`
    content = content?.replace(f.fullMatch, el)
  })

  // Generate tooltip data based on the captured footnote numbers
  let tooltips = footnotes.map((f, index) => ({
    selector: `.footnote-${props.message.id}-${index}`,
    citation: Number(f.number) - 1 // Citation index based on the captured number
  }))

  return { content, tooltips }
})

const usedCitationsInMessage = computed(() => {
  const tooltips = messageData.value.tooltips
  if (tooltips.length && Array.isArray(props.message.citations)) {
    return props.message.citations.map((citation, idx) => ({
      originalIndex: idx,
      citation: tooltips.some((tooltip) => tooltip.citation === idx) ? citation : undefined
    }))
  }
  return []
})

const defaultChatbotName = 'TextSenseAI'
const isHoveringMessage = ref(false)

const chatbotName = computed(() => {
  return conversationsStore.activeConversation?.chatbot.name ?? defaultChatbotName
})

const assistantBackgroundColor = computed(() => {
  return conversationsStore.activeConversation?.chatbot.color ?? '#cbf1f9'
})

function getMessageTime(isoString: string) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return DateTime.fromISO(isoString, { zone: timeZone }).toFormat('dd.MM.yyyy, HH:mm')
}
</script>

<template>
  <div class="chat-message" data-testId="chat-message-avatar">
    <TsaiAvatar
      v-if="message.role === 'user'"
      class="chat-message-icon"
      :name="authStore.user?.name as string"
      :url="authStore.user?.avatar"
    />
    <TsaiAvatar
      v-if="message.role === 'ai'"
      class="chat-message-icon assistant"
      :name="chatbotName"
      :color="assistantBackgroundColor"
    />
    <div
      class="chat-message-text"
      @mouseenter.passive="isHoveringMessage = true"
      @mouseleave.passive="isHoveringMessage = false"
    >
      <div class="chat-message-title">
        <strong v-if="message.role === 'user'">{{ authStore.user?.name }} </strong>
        <strong v-else-if="message.role === 'ai'">{{ chatbotName }}</strong>
        <span v-if="isHoveringMessage" class="timestamp">{{ getMessageTime(message.created) }}</span>
      </div>

      <span v-if="message.role === 'ai' && message.content === ''" data-testId="loading-message-icon">
        <LoadingSvg />
      </span>
      <!-- <span v-if="message.role === 'ai' && message.error" class="error" data-testId="error-message-text">
        {{ message.content }}
      </span> -->
      <div v-html="messageData.content" :class="{ error: message.error }" data-testId="chat-message-text" />
      <CitationTooltips :citations="props.message.citations || []" :tooltips="messageData.tooltips" />
      <div v-if="message.role === 'ai'" class="chat-message-citation">
        <div class="citation-container" v-if="usedCitationsInMessage.length">
          <CitationBox
            v-for="(citation, idx) in usedCitationsInMessage"
            :key="idx"
            :citation="citation.citation"
            :citation-position="citation.originalIndex + 1"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-message {
  width: 100%;
  display: flex;
  align-items: self-start;
  font-family: Mulish, sans-serif;
  margin-bottom: 20px;

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    margin: 0.8em 0;
    line-height: 1.2;
  }

  :deep(h1) {
    font-size: 1.6rem;
  }

  :deep(h2) {
    font-size: 1.44rem;
  }

  :deep(h3) {
    font-size: 1.28rem;
  }

  :deep(h4),
  :deep(h5),
  :deep(h6) {
    margin: 0.5em 0;
    font-size: 1.12rem;
  }

  :deep(p) {
    margin: 0.5em 0;
  }

  :deep(a) {
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  :deep(img) {
    max-width: 100%;
  }
}

.chat-message-title {
  display: flex;
  margin-bottom: 0.125em;

  .timestamp {
    align-self: flex-end;
    font-size: 12px;
    pointer-events: none;
    color: var(--color-light-grey);
    padding-bottom: 0.12em;
    margin-left: 0.5rem;
  }
}

.chat-message-text {
  flex-grow: 1;
}

.chat-message-text > div {
  font-family: Mulish, sans-serif;
  font-size: 16px;
  line-height: 1.2;
  color: var(--color-dark-grey);
}

.chat-message-text > div a {
  color: var(--color-purple-2) !important;
  display: none;
}

.citation-container {
  display: flex;
  align-self: flex-start;
  flex-wrap: wrap;
  flex-direction: row;
  gap: 20px;
  margin-top: 20px;
}

strong {
  font-weight: 700;
}

:deep(.chat-message-text > div > p:first-of-type) {
  margin: 0;
}

.chat-message-icon {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  line-height: 38px;
  font-size: 1.1rem;
  color: var(--color-message-grey);
  font-weight: 500;
  user-select: none;
  margin-right: 12px;
}

div.error {
  color: var(--color-red);
}

:deep(.footnote) {
  position: relative;
  height: 14px;
  font-size: 9px;
  padding: 5px;
  min-width: 14px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 50%;
  font-weight: 700;
  background: var(--gradient-secondary);
}

@media screen and (max-width: 786px) {
  .chat-message {
    margin-bottom: 38px;
  }

  .citation-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .citation-item {
    width: 100%;
  }
}

@media screen and (max-width: 600px) {
  .citation-container {
    grid-template-columns: 1fr;
  }
}

@media screen and (max-width: 500px) {
  .chat-message-icon {
    height: 24px;
    width: 24px;
  }
}
</style>
