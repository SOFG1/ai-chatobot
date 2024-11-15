<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useAuthStore } from '@/stores/auth'
import LogoIcon from '@/assets/icons/logo-icon.svg?url'
import type { LLM, UserCredentials } from '@/types'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import { useConversationsStore } from '@/stores/conversations'

const { t } = useI18n()

const router = useRouter()
const conversationsStore = useConversationsStore()

const emailOrUsername = ref('')
const password = ref('')

const logoUrl = getComputedStyle(document.body).getPropertyValue('--logo-url').replace(/"/g, '')

const errors = ref<{ email: string | undefined; password: string | undefined }>({
  email: undefined,
  password: undefined
})

watchEffect(() => {
  if (emailOrUsername.value && password.value) {
    errors.value.email = undefined
    errors.value.password = undefined
  }
})

/**
 * Login function that calls the authStore's login function
 */
async function login() {
  try {
    const authStore = useAuthStore()
    const userCredentials: UserCredentials = {
      username: emailOrUsername.value,
      password: password.value
    }
    await authStore.login(userCredentials)
    await preselectLLMProfile()
    await router.push({ name: 'home' })
  } catch (error) {
    const detail = error?.response?.data?.detail
    let message = t('home.toasts.invalid-credentials')
    if (detail?.error_code) {
      message = t(error.response?.data?.detail?.error_code, error.response?.data?.detail?.extra)
    }
    errors.value.email = message as string
    errors.value.password = message as string
  }
}

async function preselectLLMProfile() {
  const response = await axios.get<LLM[]>('/api/llms')
  if (Array.isArray(response.data) && response.data.length) {
    conversationsStore.selectedLLM = response.data[0].id
  } else {
    console.log('No LLM Profile could be pre-selected')
  }
}
</script>

<template>
  <div class="page">
    <div class="title"><span>Create intelligent & context-rich</span> chatbots</div>
    <div class="login-section">
      <div class="login-form">
        <h1 class="login-title">
          <img :src="LogoIcon" class="logo-icon" style="display: inline" />{{ $t('login.title') }}
        </h1>
        <p class="subtitle">
          {{ $t('login.subtitle') }}
        </p>
        <form @submit.prevent="login">
          <div class="form-group" :class="{ error: errors.email }">
            <label for="email">{{ $t('login.email-or-username-label') }}</label>
            <input
              v-model="emailOrUsername"
              class="tsai-input drop-shadow"
              type="text"
              id="email"
              name="email"
              :placeholder="t('login.email-or-username-placeholder')"
              required
            />
            <p v-if="errors.email" class="error-msg">{{ errors.email }}</p>
          </div>

          <div class="form-group" :class="{ error: errors.password }">
            <label for="password">{{ $t('login.password-label') }}</label>
            <input
              v-model="password"
              class="tsai-input drop-shadow"
              type="password"
              id="password"
              name="password"
              :placeholder="t('login.password-placeholder')"
              required
            />
            <p v-if="errors.password" class="error-msg">{{ errors.password }}</p>
          </div>
          <button class="tsai-button primary large" type="submit">{{ $t('login.login-action') }}</button>
        </form>
      </div>
    </div>
    <div class="logo-text">
      <img :src="logoUrl" alt="logo" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.page {
  position: relative;
  display: flex;
  flex-direction: column;
  padding-top: 41px;
  min-height: 100vh;
}

.page::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  background-image: var(--login-background-image);
  background-size: cover;
  background-position: top left;
  width: 50%;
  z-index: -1;
}

.login-title img {
  position: relative;
  top: 3px;
  height: 33px;
  width: 33px;
}

.title {
  text-align: right;
  color: var(--color-login-title);
  font-size: 42px;
  line-height: 1.2;
  margin-bottom: 103px;
  padding-right: 40px;
  max-width: 420px;
  margin-left: auto;

  span {
    font-weight: 600;
  }
}

.logo-text {
  width: 50%;
  margin-left: auto;
  margin-top: auto;
  padding-top: 70px;
  padding-bottom: 40px;
  padding-left: 40px;
}

.logo-text img {
  width: 18.6875rem;
}

.login-section {
  display: flex;
  z-index: 10;
  width: 50vw;
  flex-direction: column;
  padding: 0 110px;

  h1 {
    font-size: 32px;
    margin-bottom: 8px;
  }

  p {
    margin: 0 0 28px;
    color: var(--color-dark-grey);
  }

  label {
    font-size: 16px;
    margin: 20px 0 10px;
  }

  button {
    margin-top: 28px;
    width: auto;
    border-color: transparent;
  }
}

.login-form {
  max-width: 579px;
  margin: 0 auto;
}

.subtitle {
  font-size: 16px;
}

@media screen and (max-width: 1335px) and (min-width: 1000px) {
  .title {
    max-width: 310px;
    padding-right: 20px;
    font-size: 38px;
  }
}

@media screen and (max-width: 1070px) {
  .logo-text {
    margin-top: -20px !important;
    padding-top: 0;
  }
}

@media screen and (max-width: 1000px) {
  .page {
    min-height: 100vh;
    padding-top: 0;
  }

  .page::after {
    content: '';
    width: 100%;
    height: 60%;
    top: auto;
    bottom: 0;
    background-position: top left;
  }

  .login-section {
    background-color: var(--color-background);
    width: 100%;
    min-height: 50%;
    order: -1;
    margin-bottom: 46px;
    padding: 70px 100px;
  }

  .login-form {
    max-width: 579px;
    margin: 0 auto;
  }

  .login-title {
    text-align: center;
  }

  .subtitle {
    text-align: center;
  }

  .tsai-button {
    width: 100% !important;
  }

  .title {
    font-size: 32px;
    padding-right: 40px;
    margin-bottom: 20px;
  }

  .logo-text {
    width: auto;
    min-height: 300px;
    margin: 0;
    margin-right: 40px;
    padding: 0;
    padding-bottom: 40vh;
    align-self: flex-end;
    text-align: right;
  }

  .logo-text img {
    width: 180px;
  }
}

@media screen and (max-width: 650px) {
  .title {
    max-width: 370px;
  }
}

@media screen and (max-width: 540px) {
  .title {
    max-width: 300px;
  }
  .login-section {
    padding: 29px 20px 40px;
  }

  .login-title {
    position: relative;
    font-size: 20px !important;
  }

  .login-title img {
    top: 10px;
  }

  .subtitle {
    font-size: 14px;
    margin-bottom: 24px !important;
  }

  .login-section label {
    font-size: 16px;
  }

  .tsai-button {
    margin-bottom: 0;
  }

  .title {
    padding-right: 20px;
    font-size: 22px;
  }

  .logo-text {
    margin-right: 20px;
    min-height: 200px;
  }

  .form-group {
    margin-bottom: 0;
  }
}

@media screen and (max-width: 420px) {
  .title {
    max-width: 200px;
  }
  .logo-text {
    padding: 0;
    margin: 0;
    position: absolute;
    bottom: 20px;
    left: 20px;
    min-height: auto;
  }
}
</style>
