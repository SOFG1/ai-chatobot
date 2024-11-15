<script setup lang="ts">
import EditPassword from '@/components/navbar/profile/EditPassword.vue'
import EditProfile from '@/components/navbar/profile/EditProfile.vue'
import { ref } from 'vue'
import { VueFinalModal } from 'vue-final-modal'

const tab = ref<'profile' | 'security'>('profile')

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <VueFinalModal
    class="final-modal"
    content-class="final-modal-content"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <button class="final-modal-close" @click="emit('close')" />
    <div class="content">
      <h1>{{ $t('settings.account.title') }}</h1>
      <small>{{ $t('settings.account.description') }}</small>
      <div class="tabs">
        <button class="tab" :class="{ active: tab === 'profile' }" @click="tab = 'profile'">
          {{ $t('settings.account.profile-tab-label') }}
        </button>
        <button class="tab" :class="{ active: tab === 'security' }" @click="tab = 'security'">
          {{ $t('settings.account.security-tab-label') }}
        </button>
      </div>
      <EditProfile v-if="tab === 'profile'" @close="emit('close')" />
      <EditPassword v-if="tab === 'security'" @close="emit('close')" />
    </div>
  </VueFinalModal>
</template>

<style lang="scss" scoped>
h3 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
}

.content {
  width: 450px;
}

.tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 26px;
  margin-top: 16px;
}

.tsai-button {
  min-width: 90px;
  padding-inline: 10px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Mulish', sans-serif;
}

.secondary {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

@media screen and (max-width: 786px) {
  .content {
    width: 410px;
  }
}

@media screen and (max-width: 550px) {
  .tabs {
    margin-bottom: 20px;
  }

  .content {
    width: 100%;
    max-width: 310px;
  }
}
</style>
