<script setup lang="ts">
import LogoIcon from '@/assets/icons/logo-icon.svg'
import ChatWindow from '@/components/ChatWindow.vue'
import { useConversationsStore } from '@/stores/conversations'
import { useAuthStore } from '@/stores/auth'
import { useUtilsStore } from '@/stores/utils'
import CitationFile from '@/components/citation/CitationFile.vue'

const authStore = useAuthStore()
const conversationsStore = useConversationsStore()
const utilsStore = useUtilsStore()

setTimeout(() => (utilsStore.animateLogo = false), 1000)
</script>

<template>
  <main class="tsai-view home-view">
    <div class="flex-box flex-direction-column full-height">
      <div class="tsai-view-header">
        <div class="view-title" v-if="conversationsStore.activeConversation">
          <LogoIcon class="logo-icon" :class="{ 'animate-logo-icon': utilsStore.animateLogo }" />
          <h1>{{ conversationsStore.activeConversation.chatbot.name }}</h1>
        </div>
        <div class="view-title" v-else>
          <LogoIcon class="logo-icon" :class="{ 'animate-logo-icon': utilsStore.animateLogo }" />
          <h1>{{ $t('home.welcome', { username: authStore.user?.name }) }}</h1>
        </div>

        <p class="view-description" v-if="conversationsStore.activeConversation" style="margin-bottom: 26px">
          {{ conversationsStore.activeConversation.chatbot.description }}
        </p>
        <p class="view-description" v-else>
          {{ $t('home.intro') }}
        </p>
      </div>
      <div class="full-height home-view-content">
        <ChatWindow />
      </div>
    </div>
  </main>
  <Transition>
    <CitationFile v-if="conversationsStore.openedCitation" />
  </Transition>
</template>

<style scoped lang="scss">
.logo-icon {
  animation-iteration-count: 1;
}

.home-view {
  height: 100%;
  max-width: 986px;
  overflow-y: auto;
}

@media screen and (min-width: 786px) {
  .home-view-content {
    overflow-y: auto;
  }
}

@media screen and (max-width: 786px) {
  .home-view-content {
    height: calc(100vh - 260px);
  }
}
</style>
