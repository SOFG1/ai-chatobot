<script setup lang="ts">
import TsaiAvatar from '@/components/TsaiAvatar.vue'
import ChangeAvatarModal from '@/components/modals/ChangeAvatarModal.vue'
import { useAuthStore } from '@/stores/auth'
import type { UserChangeAvatarRequest } from '@/types'
import { ref } from 'vue'
import { useModal } from 'vue-final-modal'
import { useI18n } from 'vue-i18n'

const i18n = useI18n()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const authStore = useAuthStore()

// TODO: Avatar upload implementation
const avatarUploadImplemented = false

const avatarUrl = ref<string>(authStore.user?.avatar ?? '')
const name = ref<string>(authStore.user?.name || '')

const submitChangeAvatar = async (value: string) => {
  const req: UserChangeAvatarRequest = {
    avatar: value
  }
  await authStore.changeAvatar(req)
  await changeAvatarModal.close()
}

const changeAvatarModal = useModal({
  component: ChangeAvatarModal,
  attrs: {
    title: i18n.t('settings.edit-profile.avatar-modal.title'),
    value: avatarUrl.value,
    onConfirm(value: string) {
      console.log(value)
      submitChangeAvatar(value)
    },
    onClose() {
      changeAvatarModal.close()
    }
  },
  slots: { default: '<small>' + i18n.t('settings.edit-profile.avatar-modal.description') + '</small>' }
})
</script>

<template>
  <p class="title">{{ $t('settings.edit-profile.avatar-label') }}</p>
  <div class="box">
    <TsaiAvatar class="avatar" :url="authStore.user?.avatar" :name="authStore.user?.name as string" />
    <button v-if="avatarUploadImplemented" class="tsai-button small secondary" @click="changeAvatarModal.open">
      {{ $t('settings.edit-profile.change-avatar-action') }}
    </button>
  </div>
  <div class="form-group">
    <label for="user-name">{{ $t('settings.edit-profile.username-label') }}</label>
    <input class="tsai-input" type="text" id="user-name" v-bind:value="authStore.user?.username" :disabled="true" />
  </div>
  <div class="form-group" style="margin-bottom: 10px">
    <label for="name">{{ $t('settings.edit-profile.display-name-label') }}</label>
    <input class="tsai-input" type="text" id="name" v-model="name" />
  </div>
  <p class="text">{{ $t('settings.edit-profile.display-name-description') }}</p>
  <div class="button-section">
    <button
      class="tsai-button primary name-btn"
      role="button"
      type="button"
      :disabled="!name || authStore.isLoading === 'name'"
      @click="() => authStore.changeName(name)"
    >
      {{ $t('settings.edit-profile.save-action') }}
    </button>
    <button class="tsai-button secondary name-btn" role="button" type="button" @click="$emit('close')">
      {{ $t('settings.edit-profile.cancel-action') }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.title {
  font-family: Mulish, sans-serif;
  font-weight: 600;
  font-size: 20px;
  margin-bottom: 10px;
}

.box {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.avatar {
  height: 54px;
  width: 54px;
  margin-right: 24px;
  border: 1px solid var(--color-light-grey);
}

.name-btn {
  // height: 36px;
  // width: 82px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.text {
  font-size: 16px;
  font-family: Mulish, sans-serif;
  color: var(--color-light-grey);
  margin-bottom: 28px;
  line-height: 1.2;
}

@media screen and (max-width: 786px) {
  .form-group {
    margin-bottom: 18px;
  }
}

@media screen and (max-width: 500px) {
  .form-group {
    margin-bottom: 16px;
  }
  .button-section {
    flex-direction: column-reverse;
  }
}
</style>
