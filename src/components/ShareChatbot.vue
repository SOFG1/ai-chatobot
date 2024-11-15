<script setup lang="ts">
import { useModal } from 'vue-final-modal'
import { useRoute } from 'vue-router'
import { computed, onMounted } from 'vue'
import { useChatbotsStore } from '@/stores/chatbots'
import ShareChatbotModal from '@/components/modals/ShareChatbotModal.vue'
import TsaiAvatar from '@/components/TsaiAvatar.vue'

const chatbotsStore = useChatbotsStore()

const route = useRoute()

const currentChatbot = computed(() => {
  return chatbotsStore.allChatbots.find((c) => c.id === route.params.id)
})

const avatars = computed(() => {
  const users = currentChatbot.value.individuals.map((u) => ({ name: u.name, icon: u?.avatar })) || []
  const groups = currentChatbot.value.groups.map((g) => ({ name: g.name, icon: g.icon })) || []
  return [...users, ...groups]
})

const modal = useModal({
  component: ShareChatbotModal,
  attrs: {
    onClose() {
      modal.close()
    }
  }
})

onMounted(() => chatbotsStore.getChatbotById(route.params.id as string))
</script>

<template>
  <div class="form-group" v-if="currentChatbot">
    <label>{{ $t('chatbot.form.share') }}</label>
    <div class="box">
      <TsaiAvatar v-if="avatars[0]" :name="avatars[0]?.name" :url="avatars[0]?.icon" class="avatar" />
      <TsaiAvatar v-if="avatars[1]" :name="avatars[1]?.name" :url="avatars[1]?.icon" class="avatar" />
      <button class="add-btn" @click="modal.open">+</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.box {
  display: flex;
}
.avatar {
  height: 25px;
  width: 25px;
  z-index: 2;
  font-size: 12px;
  border: 1px solid var(--color-border-grey2);
  &:not(:first-child) {
    z-index: 1;
  }
}
.add-btn {
  height: 25px;
  width: 25px;
  border-radius: 50%;
  color: var(--color-file-grey);
  font-size: 18px;
  font-weight: 600;
  background: var(--color-grey-4);
  border: 0;
  cursor: pointer;
  transition: 150ms;
}
.add-btn:hover {
  transform: scale(1.15);
}
</style>
