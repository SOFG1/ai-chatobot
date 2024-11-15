<script setup lang="ts">
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import type { ERROR_422_RESPONSE, UserChangePasswordRequest } from '@/types'
import { computed, reactive, ref } from 'vue'
import { toast } from 'vue3-toastify'
import { useI18n } from 'vue-i18n'

defineEmits<{
  (e: 'close'): void
}>()

const authStore = useAuthStore()

const i18n = useI18n()

const changePasswordState = reactive({
  currentPassword: {
    value: '',
    error: '',
    validate() {
      if (!this.value) {
        this.error = i18n.t('settings.password.error-current-password')
        return false
      }
      this.error = ''
      return true
    }
  },
  newPassword: {
    value: '',
    error: '',
    validate() {
      if (!this.value) {
        this.error = i18n.t('settings.password.error-new-password')
        return false
      }
      this.error = ''
      return true
    }
  },
  confirmPassword: {
    value: '',
    error: '',
    validate() {
      if (!this.value) {
        this.error = i18n.t('settings.password.error-repeat-password')
        return false
      }
      if (this.value !== changePasswordState.newPassword.value) {
        this.error = i18n.t('settings.password.error-mismatch-password')
        return false
      }
      this.error = ''
      return true
    }
  }
})
const changePasswordError = ref<string>('')

const saveBtnDisabled = computed(() => {
  return false
})

const submitChangePassword = async () => {
  if (
    !changePasswordState.currentPassword.validate() ||
    !changePasswordState.newPassword.validate() ||
    !changePasswordState.confirmPassword.validate()
  ) {
    return
  }

  try {
    const req: UserChangePasswordRequest = {
      old_password: changePasswordState.currentPassword.value,
      new_password: changePasswordState.newPassword.value
    }

    await authStore.changePassword(req)
    await router.push({ name: 'logout' })
  } catch (error: any) {
    toast(i18n.t('password.toasts.change-password-error'), {
      type: 'error',
      autoClose: 3000
    })
    if (error?.response?.status === 400) {
      changePasswordError.value = error?.response?.data?.detail
      return
    } else if (error?.response?.status === 422) {
      const errors = error.response.data.detail.map((c: ERROR_422_RESPONSE) => ({
        loc: c.loc,
        msg: c.msg
      }))
      if (errors.find((c: any) => c.loc.includes('old_password'))) {
        changePasswordState.currentPassword.error = errors.find((c: any) => c.loc.includes('old_password'))?.msg
      }
      if (errors.find((c: any) => c.loc.includes('new_password'))) {
        changePasswordState.newPassword.error = errors.find((c: any) => c.loc.includes('new_password'))?.msg
        changePasswordState.confirmPassword.error = errors.find((c: any) => c.loc.includes('new_password'))?.msg
      }
      return
    } else {
      console.error(error)
      return
    }
  }
}
</script>

<template>
  <div class="form-group">
    <label for="current-password">{{ $t('settings.password.current-password-label') }}</label>
    <input
      class="tsai-input"
      type="password"
      id="current-password"
      autocomplete="new-password"
      v-model="changePasswordState.currentPassword.value"
      required
    />
    <p class="error-message" v-html="changePasswordState.currentPassword.error"></p>
  </div>
  <div class="form-group">
    <label for="new-password">{{ $t('settings.password.new-password-label') }}</label>
    <input
      class="tsai-input"
      type="password"
      id="new-password"
      v-model="changePasswordState.newPassword.value"
      required
      autocomplete="new-password"
    />
    <p class="error-message" v-html="changePasswordState.newPassword.error"></p>
  </div>
  <div class="form-group">
    <label for="repeated-new-password">{{ $t('settings.password.repeat-password-label') }}</label>
    <input
      class="tsai-input"
      type="password"
      id="repeated-new-password"
      v-model="changePasswordState.confirmPassword.value"
      autocomplete="new-password"
      required
    />
    <p class="error-message" v-html="changePasswordState.confirmPassword.error"></p>
  </div>
  <p v-if="changePasswordError" class="error-message" :style="{ marginBottom: '10px' }">
    {{ changePasswordError }}
  </p>
  <div class="btn-box">
    <button
      class="tsai-button primary"
      role="button"
      type="button"
      :disabled="saveBtnDisabled"
      @click="submitChangePassword"
    >
      {{ $t('settings.password.change-password') }}
    </button>
    <!-- <button class="tsai-button secondary" role="button" type="button" @click="$emit('close')">
            Cancel
        </button> -->
  </div>
</template>

<style lang="scss" scoped>
.title {
  font-family: Mulish, sans-serif;
  font-weight: 600;
  font-size: 20px;
  margin-bottom: 10px;
}

p {
  &.error-message {
    color: var(--color-red) !important;
  }
}

.form-group {
  margin-bottom: 20px;
}

.btn-box {
  display: flex;
  gap: 12px;
  margin-top: 28px;
}

@media screena and (max-width: 786px) {
  .form-group {
    margin-bottom: 18px;
  }
}

@media screena and (max-width: 500px) {
  .form-group {
    margin-bottom: 16px;
  }
}
</style>
