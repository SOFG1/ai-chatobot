<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { VueFinalModal } from 'vue-final-modal'
import { useUsersStore } from '@/stores/users'
import type { DropdownOption } from '@/types/internal'
import { useRoute } from 'vue-router'
import { useChatbotsStore } from '@/stores/chatbots'
import { useAuthStore } from '@/stores/auth'
import TsaiDropdown from '@/components/form/TsaiDropdown.vue'
import TsaiAvatar from '@/components/TsaiAvatar.vue'
import ActionButton from '@/components/ActionButton.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineEmits(['close'])

const authStore = useAuthStore()
const usersStore = useUsersStore()
const chatbotsStore = useChatbotsStore()

const route = useRoute()
const tab = ref<'all' | 'users' | 'groups'>('all')
const selectedItem = ref<DropdownOption>()

const selectedChatBot = computed(() => {
  return chatbotsStore.allChatbots.find((c) => c.id === route.params.id)
})

const usersOptions = computed<DropdownOption[]>(() => {
  return usersStore.users
    .map((u) => ({
      label: u.username,
      value: u.id
    }))
    .filter((o) => {
      return (
        !selectedChatBot.value.individuals.some((u) => u.username === o.label) && o.label !== authStore.user?.username
      )
    })
})

const groupsOptions = computed(() => {
  return usersStore.userGroups
    .map((g) => ({ label: g.name, value: g.id, description: `(${t('chatbot.form.share-modal.group-label')})` }))
    .filter((o) => {
      return !selectedChatBot.value.groups.some((g) => g.id === o.value)
    })
})

const options = computed(() => {
  if (tab.value === 'users') return usersOptions.value
  if (tab.value === 'groups') return groupsOptions.value
  return [...groupsOptions.value, ...usersOptions.value]
})

const shareChatbot = () => {
  const chatbotId = route.params.id
  const itemId = selectedItem?.value?.value
  const isUser = usersOptions.value.find((o) => o.value === itemId)
  if (isUser) {
    chatbotsStore.shareChatBotUser(chatbotId as string, itemId)
  }
  if (!isUser) {
    chatbotsStore.shareChatBotGroup(chatbotId as string, itemId)
  }
}

watch([tab, options], () => {
  if (!options.value || !options.value.length) return
  const selected = (options.value as DropdownOption[]).find((o) => o.value === selectedItem.value?.value)
  if (!selected) selectedItem.value = undefined
})

onMounted(() => {
  usersStore.load(0, 100)
  usersStore.fetchGroups()
})
</script>

<template>
  <VueFinalModal
    class="final-modal"
    content-class="final-modal-content"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <div class="content">
      <button class="final-modal-close" @click="$emit('close')" />
      <div class="content">
        <h1 class="title">{{ $t('chatbot.form.share-modal.title') }}</h1>
        <p class="subtitle">
          {{ $t('chatbot.form.share-modal.subtitle') }}
        </p>
        <div class="tabs">
          <button class="tab" :class="{ active: tab === 'all' }" @click="tab = 'all'">
            {{ $t('chatbot.form.share-modal.all') }}
          </button>
          <button class="tab" :class="{ active: tab === 'users' }" @click="tab = 'users'">
            {{ $t('chatbot.form.share-modal.users') }}
          </button>
          <button class="tab" :class="{ active: tab === 'groups' }" @click="tab = 'groups'">
            {{ $t('chatbot.form.share-modal.groups') }}
          </button>
        </div>
        <TsaiDropdown :label="$t('chatbot.form.share')" v-model="selectedItem" :options="options" :searchable="true" />
        <div class="list">
          <div v-if="tab !== 'users'">
            <div v-for="group in selectedChatBot?.groups" :key="group.id" class="user">
              <TsaiAvatar :name="group.name" :url="group.icon" />
              <p class="name">
                {{ group.name }} <span class="group-desc">({{ t('chatbot.form.share-modal.group-label') }})</span>
              </p>
              <span class="can-use">{{ $t('chatbot.form.share-modal.can-use') }}</span>
              <ActionButton
                icon="delete"
                @click="() => chatbotsStore.unshareChatBotGroup(route.params.id as string, group.id)"
              />
            </div>
          </div>
          <div v-if="tab !== 'groups'">
            <div v-for="user in selectedChatBot?.individuals" :key="user.id" class="user">
              <TsaiAvatar :name="user.username" :url="user.avatar" />
              <p class="name">{{ user.username }}</p>
              <span class="can-use">{{ $t('chatbot.form.share-modal.can-use') }}</span>
              <ActionButton
                icon="delete"
                @click="() => chatbotsStore.unshareChatBotUser(route.params.id as string, user.id)"
              />
            </div>
          </div>
        </div>
        <div class="button-section">
          <button :disabled="!selectedItem" class="tsai-button" @click="shareChatbot">
            {{ $t('chatbot.form.share-modal.share') }}
          </button>
        </div>
      </div>
    </div>
  </VueFinalModal>
</template>

<style lang="scss" scoped>
.form-group {
  min-height: 200px;
}

.subtitle {
  margin-bottom: 20px;
}
.tabs {
  margin-bottom: 20px;
}
.user {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 21px;
}
.name {
  font-size: 18px;
  font-weight: 700;
  font-family: 'Mulish', sans-serif;
}

.group-desc {
  color: var(--color-light-grey);
}
.can-use {
  margin-left: auto;
  font-weight: 700;
  font-family: 'Mulish', sans-serif;
  color: var(--color-light-grey);
}

@media screen and (max-width: 520px) {
  .name {
    font-size: 16px;
  }
  .can-use {
    font-size: 12px;
  }
}
</style>
