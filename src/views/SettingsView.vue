<script setup lang="ts">
import LogoIcon from '@/assets/icons/logo-icon.svg'
import GeneralSettings from '@/components/settings/GeneralSettings.vue'
import GroupsSettings from '@/components/settings/GroupsSettings.vue'
import UserSettings from '@/components/settings/UserSettings.vue'
import { useAuthStore } from '@/stores/auth'
import { computed, ref } from 'vue'

type TabType = 'general' | 'users' | 'groups'

const authStore = useAuthStore()
const currentTab = ref<TabType>('general')

const tabsList = computed(() => {
  const tabs = ['general']
  const scopesList = authStore.user?.scopes?.split(',')
  if (scopesList?.includes('users') || scopesList?.includes('*')) {
    tabs.push('users')
  }
  if (scopesList?.includes('groups') || scopesList?.includes('*')) {
    tabs.push('groups')
  }
  return tabs
})
</script>

<template>
  <main class="settings-view tsai-view">
    <div class="view-title">
      <LogoIcon class="logo-icon" />
      <h1>{{ $t('settings.title') }}</h1>
    </div>
    <div class="settings">
      <div class="tabs">
        <button
          v-for="tab in tabsList"
          :key="tab"
          class="tab"
          :class="{ active: currentTab === tab }"
          @click="currentTab = tab"
        >
          {{ $t(`settings.${tab}-tab`) }}
        </button>
      </div>
      <div class="content">
        <div v-if="currentTab === 'general'">
          <GeneralSettings />
        </div>
        <div v-if="currentTab === 'users'">
          <UserSettings />
        </div>
        <div v-if="currentTab === 'groups'">
          <GroupsSettings />
        </div>
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
@import '@/assets/mixins';

.settings {
  margin-top: 20px;
}

@media screen and (max-width: 786px) {
  .settings {
    margin-top: 20px;
  }
}

@media screen and (max-width: 500px) {
  .tabs {
    margin-bottom: 34px;
  }
}
</style>
