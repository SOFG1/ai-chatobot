<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import SettingsIcon from '@/assets/icons/settings-white.svg'
import { useModal } from 'vue-final-modal'
import UserSettingsModal from '@/components/modals/UserSettingsModal.vue'
import TsaiAvatar from '@/components/TsaiAvatar.vue'
import TsaiContextMenu from '@/components/TsaiContextMenu.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTsaiContextMenu } from '@/composables/useTsaiContextMenu'
import { useI18n } from 'vue-i18n'

const i18n = useI18n()
const userSettingsModal = useModal({
  component: UserSettingsModal,
  attrs: {
    onClose() {
      userSettingsModal.close()
    }
  },
  slots: { default: '<small>' + i18n.t('settings.avatar-url') + '</small>' }
})

const contextMenuOptions = ref([
  { name: i18n.t('settings.profile-action'), type: 'profile', icon: 'profile', action: () => userSettingsModal.open() },
  {
    name: i18n.t('settings.logout-action'),
    type: 'logout',
    icon: 'log-out',
    action: () => router.push({ name: 'logout' })
  }
])

const router = useRouter()
const authStore = useAuthStore()
const { contextMenuVisible, contextMenuPosition, onContextMenuClickOutside, onOptionClicked } =
  useTsaiContextMenu(contextMenuOptions)

function onProfileSettingsClick(event: MouseEvent) {
  contextMenuVisible.value = true
  // Position from right side equals screen width minus clicked position from left (clientX)
  // Apply small offset to avoid overlapping the profile icon
  contextMenuPosition.value = { top: event.clientY + 15, right: window.innerWidth - event.clientX }
}
</script>

<template>
  <div v-if="authStore.user" class="navbar-profile">
    <div class="profile-container">
      <div class="profile-info">
        <div class="name">{{ authStore.user?.name }}</div>
        <div class="username">{{ authStore.user?.username }}</div>
      </div>
      <span class="avatar">
        <!-- <img :src="authStore.user?.avatar" alt="avatar" /> -->
        <TsaiAvatar :url="authStore.user.avatar" :name="authStore.user?.name" />
        <button class="settings-btn" @click="onProfileSettingsClick">
          <SettingsIcon />
          <TsaiContextMenu
            :visible="contextMenuVisible"
            :options="contextMenuOptions"
            :position="contextMenuPosition"
            @click-outside="onContextMenuClickOutside"
            @option-clicked="onOptionClicked"
          />
        </button>
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.navbar-profile {
  margin-right: 2rem;
  margin-left: auto;
}

.profile-container {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .profile-info {
    margin-right: 1rem;

    .name {
      font-size: 20px;
      text-align: right;
      line-height: 1.2;
    }

    .username {
      font-size: 12px;
      text-align: right;
      line-height: 1.2;
      font-weight: 300;
    }
  }

  .avatar {
    position: relative;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    text-align: center;
    border: 0;
    width: 40px;
    overflow: visible !important;
    height: 40px;

    > img {
      display: block;
      border: 1px solid var(--color-light-grey);
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
  }

  .settings-btn {
    position: absolute;
    bottom: -6px;
    right: -7px;
    height: 26px;
    width: 26px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background-color: var(--color-primary);
    border: 0;
    z-index: 10;
    padding: 0;
    cursor: pointer;
  }
}

@media screen and (max-width: 786px) {
  .navbar-profile {
    margin-right: 0;
  }

  .username {
    display: none;
  }
}

@media screen and (max-width: 500px) {
  .name {
    display: none;
  }
}
</style>
