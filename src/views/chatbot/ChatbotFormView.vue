<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import LogoIcon from '@/assets/icons/logo-icon.svg'
import ChatbotPreviewBox from '@/components/ChatbotPreviewBox.vue'
import TsaiColorPicker from '@/components/form/TsaiColorPicker.vue'
import { useModal, type UseModalReturnType } from 'vue-final-modal'
import FileSelectorModal from '@/components/modals/FileSelectorModal.vue'
import { useChatbotsStore } from '@/stores/chatbots'
import type { CreateChatbot } from '@/types'
import { useRoute, useRouter } from 'vue-router'
import TsaiCheckbox from '@/components/form/TsaiCheckbox.vue'
import { useI18n } from 'vue-i18n'
import { generateRandomColor } from '@/utils/generateRandomColor'
import ShareChatbot from '@/components/ShareChatbot.vue'
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal.vue'

const { t } = useI18n()
// Stores & Router
const chatbotStore = useChatbotsStore()
const router = useRouter()
const route = useRoute()

// Form state
const chatbotId = ref<string>('')
const chatbotName = ref<string>('')
const description = ref<string>('')
const systemPrompt = ref<string>('')
const files = ref<string[]>([])
const color = ref<string>(generateRandomColor())
const citationMode = ref<boolean>(true)
// const icon = ref<string>('')

const isEditMode = computed(() => !!route.params.id)
const i18n = useI18n()

let modal: UseModalReturnType<any>
let deleteChatbotModal: UseModalReturnType<any>

console.log(isEditMode.value)

const openSelectorModal = () => {
  const modal = useModal({
    component: FileSelectorModal,
    attrs: {
      title: i18n.t('chatbot.form.file-modal.title'),
      preselectedFiles: files.value as string[],
      onConfirm(selectedFiles) {
        files.value = selectedFiles
        modal.close()
      },
      onClose() {
        modal.close()
      }
    },
    slots: {
      default: '<small>' + i18n.t('chatbot.form.file-modal.description') + '</small>'
    }
  })
  modal.open()
}

onMounted(async () => {
  if (isEditMode.value) {
    chatbotId.value = route.params.id as string
    try {
      const chatbot = await chatbotStore.getChatbotById(chatbotId.value)
      if (chatbot) {
        chatbotName.value = chatbot.name
        description.value = chatbot.description
        systemPrompt.value = chatbot.system_prompt
        files.value = chatbot.files.map((f) => (typeof f === 'string' ? f : f.id))
        color.value = chatbot.color
        citationMode.value = chatbot.citations_mode
        // Set other fields as needed
      }
    } catch (error) {
      console.error('Failed to fetch chatbot:', error)
      // Handle error (e.g., show error message, redirect)
    }
  }
  modal = useModal({
    component: FileSelectorModal,
    attrs: {
      title: computed(() => i18n.t('chatbot.form.file-modal.title')).value,
      preselectedFiles: files.value as string[],
      onConfirm(selectedFiles) {
        files.value = selectedFiles
        modal.close()
      },
      onClose() {
        modal.close()
      }
    },
    slots: {
      default: '<small>' + i18n.t('chatbot.form.file-modal.description') + '</small>'
    }
  })
  deleteChatbotModal = useModal({
    component: DeleteConfirmModal,
    attrs: {
      title: i18n.t('chatbot.form.delete-modal.title'),
      text: i18n.t('chatbot.form.delete-modal.description', {
        chatName: chatbotName.value
      }),
      onConfirm() {
        chatbotStore.deleteChatbot(chatbotId.value).then(() => {
          deleteChatbotModal.close()
          router.push({ name: 'chatbots-list' })
        })
      },
      onClose() {
        deleteChatbotModal.close()
      }
    }
  })
})

const isFormValid = computed(() => {
  return chatbotName.value && description.value && systemPrompt.value
})

// Function to handle form submission
const handleSubmit = async (event: Event) => {
  event.preventDefault()
  if (isFormValid.value) {
    const chatbot: CreateChatbot = {
      name: chatbotName.value,
      description: description.value,
      system_prompt: systemPrompt.value,
      files: files.value as string[],
      color: color.value,
      citations_mode: citationMode.value,
      icon: 'default'
    }

    try {
      if (isEditMode.value) {
        await chatbotStore.updateChatbot(chatbotId.value, chatbot)
      } else {
        await chatbotStore.createChatBot(chatbot)
      }
      await router.push({ name: 'chatbots-list' })
    } catch (error) {
      console.error(`Failed to ${isEditMode.value ? 'update' : 'create'} chatbot:`, error)
    }
  }
}
</script>

<template>
  <main class="create-chatbot-view">
    <div class="view-title">
      <LogoIcon class="logo-icon" />
      <h1 v-if="!isEditMode">{{ $t('chatbot.create-title') }}</h1>
      <h1 v-else>{{ $t('chatbot.edit-title') }}</h1>
    </div>
    <p class="view-description">
      {{ $t('chatbot.form.intro') }}
    </p>

    <div class="form">
      <div class="first-col">
        <div class="form-group">
          <label for="chatbotName">{{ $t('chatbot.form.name-label') }}</label>
          <input
            class="tsai-input"
            type="text"
            id="chatbotName"
            v-model="chatbotName"
            :placeholder="t('chatbot.form.name-placeholder')"
          />
        </div>

        <div class="form-group">
          <label for="description">{{ $t('chatbot.form.description-label') }}</label>
          <textarea
            class="tsai-input"
            id="description"
            v-model="description"
            :placeholder="t('chatbot.form.description-placeholder')"
          ></textarea>
        </div>

        <div class="form-group" style="margin-bottom: 32px">
          <label for="systemPrompt">{{ $t('chatbot.form.system-prompt-label') }}</label>
          <textarea
            class="tsai-input"
            id="systemPrompt"
            v-model="systemPrompt"
            style="min-height: 180px"
            :placeholder="t('chatbot.form.system-prompt-placeholder')"
          ></textarea>
        </div>

        <div class="files-buttons">
          <button
            class="tsai-button with-icon file-select-button"
            role="button"
            type="button"
            @click="openSelectorModal"
          >
            <i class="gg-file-document"></i>{{ $t('chatbot.form.connect-files') }}
          </button>
          <p>{{ $t('chatbot.form.connected-files', files.length) }}</p>
        </div>

        <div class="button-section large">
          <button
            class="tsai-button primary large"
            role="button"
            type="submit"
            :disabled="!isFormValid"
            @click="handleSubmit"
          >
            {{ isEditMode ? $t('chatbot.form.save-action') : $t('chatbot.form.create-action') }}
          </button>
          <button
            class="tsai-button secondary large"
            role="button"
            type="button"
            @click="router.push({ name: 'chatbots-list' })"
          >
            {{ $t('chatbot.form.cancel-action') }}
          </button>
          <button
            v-if="isEditMode"
            class="tsai-button secondary large icon-only"
            role="button"
            type="button"
            @click="deleteChatbotModal.open()"
          >
            <i class="gg-trash"></i>
          </button>
        </div>
      </div>

      <div class="second-col">
        <div class="form-group" style="margin-bottom: 20px">
          <label>{{ $t('chatbot.form.preview-label') }}</label>
          <ChatbotPreviewBox :color="color" :title="chatbotName" :description="description" />
        </div>

        <div class="form-group" style="margin-bottom: 20px">
          <TsaiColorPicker v-model="color" />
        </div>

        <div class="form-group">
          <label style="margin-bottom: 0">{{ $t('chatbot.form.citation-mode-label') }}</label>
          <small>{{ $t('chatbot.form.citation-mode-description') }}</small>
          <TsaiCheckbox style="margin-top: 0.5rem" title="Ein" v-model="citationMode" />
        </div>

        <ShareChatbot v-if="isEditMode" />
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
@import '@/assets/mixins';

.form {
  display: flex;
  justify-content: space-between;
  gap: 4rem;
  margin-top: 18px;
  max-width: 1110px;
}

.first-col {
  flex-grow: 1;
  max-width: 644px;
}

.second-col {
  width: 234px;
  max-width: 234px;
}

.second-col .chatbot-preview-box {
  width: 100%;
}

.files-buttons {
  display: flex;
  align-items: center;
  font-family: Mulish, sans-serif;
  margin-bottom: 32px;
}

.files-buttons p {
  margin-left: 1rem;
  white-space: nowrap;
}

.files-buttons button {
  flex-shrink: 0;
  white-space: nowrap;
}

.file-select-button {
  background: linear-gradient(225deg, var(--color-primary) 1.38%, var(--color-primary-dark) 98.62%);
  padding: 14px 27px;
  font-weight: 600;
  font-family: Mulish, sans-serif;
}

.tsai-button.icon-only {
  min-width: auto;

  i {
    --ggs: 0.95;
    color: var(--color-red);
  }
}

@media screen and (max-width: 1080px) {
  .form {
    flex-direction: column;
    gap: 14px;
  }
}

@media screen and (max-width: 786px) {
  .form-group {
    margin-bottom: 20px;
  }
}

@media screen and (max-width: 500px) {
  .second-col {
    width: 100%;
    max-width: 100%;
  }

  .form {
    margin-top: 10px;
  }

  .files-buttons {
    flex-direction: column-reverse;
    gap: 20px;
    align-items: flex-start;
  }
  .files-buttons p {
    margin-left: 0;
  }
}
</style>
