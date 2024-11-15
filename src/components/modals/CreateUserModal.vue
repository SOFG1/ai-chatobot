<script setup lang="ts">
import { ref } from 'vue'
import { VueFinalModal } from 'vue-final-modal'
import { useUsersStore } from '@/stores/users'
import type { CreateUserData } from '@/types'
import { toast } from 'vue3-toastify'
import { roleOptions } from '@/constants'
import { useI18n } from 'vue-i18n'
import TsaiDropdown from '@/components/form/TsaiDropdown.vue'

const i18n = useI18n()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'close'): void
}>()

const { t } = useI18n()
const usersStore = useUsersStore()

const username = ref<string>('')
const name = ref<string>('')
const email = ref<string>('')
const password = ref<string>('')
const avatar = ref<string>('')
const role = ref<'Admin' | 'User'>('Admin')

const isLoading = ref<boolean>(false)
const errors = ref<{ [key: string]: string }>({})

const handleChangeRole = (e: any) => (role.value = e.value)

const handleCreate = async () => {
  errors.value = {}
  const data: CreateUserData = {
    username: username.value,
    name: name.value,
    email: email.value,
    password: password.value,
    scopes: role.value === 'Admin' ? ['*'] : ['conversations', 'chatbots', 'files', 'groups']
  }
  if (avatar.value) data.avatar = avatar.value
  try {
    isLoading.value = true
    await usersStore.createUser(data)
    emit('close')
    toast(t('create-user-component.toasts.creation-success'), {
      autoClose: 3000,
      type: 'success'
    })
  } catch (e: any) {
    const detail = e?.response?.data?.detail
    let message = t('create-user-component.toasts.creation-error')
    if (detail && detail?.error_code) {
      message = t(detail?.error_code, detail?.extra)
      console.log('Error on create group: ' + detail)
    } else {
      console.log('Unexpected error on create group.')
    }

    toast(message, {
      autoClose: 3000,
      type: 'error'
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <VueFinalModal
    class="final-modal"
    content-class="final-modal-content"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <button class="final-modal-close" @click="$emit('close')" />
    <div class="content">
      <h1>{{ $t('create-user-component.title') }}</h1>
      <div class="form-group">
        <label for="user-name">{{ $t('create-user-component.username-label') }}</label>
        <input
          :placeholder="t('create-user-component.username-placeholder')"
          class="tsai-input"
          type="text"
          id="user-name"
          v-model="username"
        />
        <p v-if="errors.username" class="error-msg">{{ errors.username }}</p>
      </div>
      <div class="form-group">
        <label for="email">{{ $t('create-user-component.email-label') }}</label>
        <input
          :placeholder="t('create-user-component.email-placeholder')"
          class="tsai-input"
          type="text"
          id="email"
          v-model="email"
        />
        <p v-if="errors.email" class="error-msg">{{ errors.email }}</p>
      </div>
      <div class="form-group">
        <label for="name">{{ $t('create-user-component.display-name-label') }}</label>
        <input
          :placeholder="t('create-user-component.display-name-placeholder')"
          class="tsai-input"
          type="text"
          id="name"
          v-model="name"
        />
        <p v-if="errors.name" class="error-msg">{{ errors.name }}</p>
      </div>
      <div class="form-group">
        <label for="password">{{ $t('create-user-component.password-label') }}</label>
        <input
          :placeholder="t('create-user-component.password-placeholder')"
          class="tsai-input"
          type="password"
          id="password"
          v-model="password"
          autocomplete="new-password"
        />
        <p v-if="errors.password" class="error-msg">{{ errors.password }}</p>
      </div>
      <div class="form-group">
        <label for="avatar">{{ $t('create-user-component.avatar-url-label') }}</label>
        <input
          class="tsai-input"
          :placeholder="t('create-user-component.avatar-url-placeholder')"
          type="text"
          id="avatar"
          v-model="avatar"
          autocomplete="new-password"
        />
        <p v-if="errors.avatar" class="error-msg">{{ errors.avatar }}</p>
      </div>
      <!-- <ScopesDropdown v-model="scopes" /> -->
      <TsaiDropdown
        :placeholder="t('create-user-component.role-label')"
        @update:model-value="handleChangeRole"
        :label="t('create-user-component.role-label')"
        :options="roleOptions"
      />
      <div class="button-section">
        <button
          class="tsai-button primary save-btn"
          role="button"
          type="button"
          @click="handleCreate"
          :disabled="isLoading"
        >
          {{ $t('create-user-component.create-action') }}
        </button>
        <!-- <button class="tsai-button secondary save-btn" role="button" type="button" @click="$emit('close')">
                    Cancel
                </button> -->
      </div>
    </div>
  </VueFinalModal>
</template>

<style lang="scss" scoped>
.content {
  width: 430px;
}

.form-group {
  margin-bottom: 20px;
}

h1 {
  margin-bottom: 34px;
  line-height: 1;
}

.title {
  margin-bottom: 20px;
}

.primary {
  margin-left: 0;
}

.save-btn {
  margin-top: 8px;
}

@media screen and (max-width: 786px) {
  h1 {
    margin-bottom: 20px;
  }

  .form-group {
    margin-bottom: 18px;
  }

  .content {
    width: 450px;
    max-width: 390px;
  }
}

@media screen and (max-width: 540px) {
  .content {
    max-width: 310px;
    width: 100%;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .save-btn {
    margin-top: 0;
  }
}
</style>
