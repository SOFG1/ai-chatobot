<script setup lang="ts">
import SidebarItem from '@/components/SidebarItem.vue'
import SearchIcon from '@/assets/icons/search.svg'
import ChatbotIcon from '@/assets/icons/chatbots.svg'
import FilesIcon from '@/assets/icons/files.svg'
import SettingsIcon from '@/assets/icons/settings.svg'
import { computed, ref } from 'vue'
import SidebarConversationItem from '@/components/SidebarConversationItem.vue'
import { useConversationsStore } from '@/stores/conversations'
import { useUtilsStore } from '@/stores/utils'
import type { ConversationIdAndTitle } from '@/types'
import TsaiContextMenu from '@/components/TsaiContextMenu.vue'
import { useModal } from 'vue-final-modal'
import { vOnClickOutside } from '@vueuse/components'
import { useAuthStore } from '@/stores/auth'
import { useTsaiContextMenu } from '@/composables/useTsaiContextMenu'
import { useI18n } from 'vue-i18n'
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal.vue'
import RenameConversationModal from '@/components/modals/RenameConversationModal.vue'
import NavbarLogo from '@/components/NavbarLogo.vue'

const i18n = useI18n()

// Stores
const authStore = useAuthStore()
const conversationsStore = useConversationsStore()
conversationsStore.fetchAllConversations()
const utilsStore = useUtilsStore()

// Refs
const contextMenuOptions = ref([
  {
    name: i18n.t('conversations.rename-context-action'),
    type: 'rename',
    icon: 'rename',
    action: () => renameConversation()
  },
  {
    name: i18n.t('conversations.delete-context-action'),
    type: 'delete',
    icon: 'trash',
    action: () => deleteConversation()
  }
])
const { contextMenuVisible, contextMenuPosition, onContextMenuTriggerClick, onOptionClicked } = useTsaiContextMenu(
  contextMenuOptions,
  85
)
const contextMenuCurrentConv = ref<ConversationIdAndTitle | null>(null)

//Scopes
const scopesList = computed(() => {
  return authStore.user?.scopes.split(',')
})

// Computed
const sortedConversations = computed(() => {
  return (
    conversationsStore.conversations?.slice()?.sort((a, b) => {
      // Sorting in descending order based on ts_last_updated timestamp
      return new Date(b.ts_last_updated).getTime() - new Date(a.ts_last_updated).getTime()
    }) || []
  )
})
const homeTitle = computed(() => {
  return conversationsStore.activeConversation?.chatbot.name || conversationsStore.getDefaultChatbot().name
})

// Functions
async function selectConversation(id: string) {
  const conv = await conversationsStore.fetchConversation(id)
  closeSideBar()
  if (conv) await conversationsStore.attachConversation(conv)
}

function onMenuIconClick(event: MouseEvent, convIdAndTitle: ConversationIdAndTitle) {
  contextMenuCurrentConv.value = convIdAndTitle
  onContextMenuTriggerClick(event)
}

function onContextMenuClickOutside() {
  contextMenuVisible.value = false
  contextMenuCurrentConv.value = null
}

function onHomeClick() {
  conversationsStore.detachConversation()
  closeSideBar()
}

function closeSideBar() {
  if (utilsStore.sideBarOpened) {
    utilsStore.sideBarOpened = false
  }
}

async function renameConversation() {
  const newChatDefaultName = i18n.t('conversations.new-chat-default-name')
  if (!contextMenuCurrentConv.value) {
    throw new Error('contextMenuCurrentConv must be an set')
  }
  console.log('confirming: renaming conversation', contextMenuCurrentConv.value.id)
  const modal = useModal({
    component: RenameConversationModal,
    attrs: {
      title: i18n.t('conversations.rename-modal.title'),
      value: contextMenuCurrentConv.value.title,
      onConfirm(newTitle: string) {
        ;(contextMenuCurrentConv.value as ConversationIdAndTitle).title = newTitle
        conversationsStore.renameConversation(contextMenuCurrentConv.value?.id as string, newTitle).then(() => {
          modal.close()
        })
      },
      onClose() {
        modal.close()
      }
    },
    slots: {
      default:
        '<p>' +
        i18n.t('conversations.rename-modal.description', {
          chatName: contextMenuCurrentConv.value.title || newChatDefaultName
        }) +
        '</p>'
    }
  })
  await modal.open()
}

async function deleteConversation() {
  const newChatDefaultName = i18n.t('conversations.new-chat-default-name')
  if (!contextMenuCurrentConv.value) throw new Error('contextMenuCurrentConv must be an set')
  if (!contextMenuCurrentConv.value) return

  const modal = useModal({
    component: DeleteConfirmModal,
    attrs: {
      title: i18n.t('conversations.delete-modal.title'),
      text: i18n.t('conversations.delete-modal.description', {
        chatName: contextMenuCurrentConv.value.title || newChatDefaultName
      }),
      onConfirm() {
        conversationsStore.deleteConversation(contextMenuCurrentConv.value?.id as string).then(() => {
          modal.close()
        })
      },
      onClose() {
        modal.close()
      }
    }
  })
  await modal.open()
}
</script>

<template>
  <div class="sidebar no-scroll" :class="{ closed: !utilsStore.sideBarOpened }" v-on-click-outside="closeSideBar">
    <button v-if="utilsStore.sideBarOpened" class="close-btn" @click="utilsStore.sideBarOpened = false">
      <i class="gg-close"></i>
    </button>
    <NavbarLogo class="logo" />
    <SidebarItem
      v-if="scopesList?.includes('*') || scopesList?.includes('conversations')"
      :icon="SearchIcon"
      :title="homeTitle"
      routeName="home"
      @click="onHomeClick"
      draggable="false"
    />
    <SidebarItem
      v-if="scopesList?.includes('*') || scopesList?.includes('chatbots')"
      :icon="ChatbotIcon"
      title="Chatbots"
      routeName="chatbots-list"
      @click="closeSideBar"
      draggable="false"
    />
    <SidebarItem
      v-if="scopesList?.includes('*') || scopesList?.includes('files')"
      :icon="FilesIcon"
      title="Dateien"
      routeName="files"
      @click="closeSideBar"
      draggable="false"
    />
    <SidebarItem
      :icon="SettingsIcon"
      title="Einstellungen"
      routeName="settings"
      @click="closeSideBar"
      draggable="false"
    />
    <div class="conversations-section">
      <hr />
      <div class="conversations-list">
        <template v-if="conversationsStore.conversations.length > 0">
          <SidebarConversationItem
            v-for="conv in sortedConversations"
            :key="conv.id"
            @click="selectConversation(conv.id)"
            @onMenuClick="onMenuIconClick($event, conv)"
            :title="conv.title"
            :active="conversationsStore.activeConversation?.id === conv.id"
          />
        </template>
        <template v-else>
          <small>{{ $t('conversations.no-active-chats-label') }}</small>
        </template>
      </div>
    </div>

    <TsaiContextMenu
      :visible="contextMenuVisible"
      :options="contextMenuOptions"
      :position="{ top: contextMenuPosition.top, left: contextMenuPosition.left }"
      @click-outside="onContextMenuClickOutside"
      @option-clicked="onOptionClicked"
    />
  </div>
</template>

<style scoped lang="scss">
.sidebar {
  min-width: 330px;
  max-width: 330px;
  // overflow-y: auto;
  height: 100%;
  padding: 40px;
  border-radius: 0 1.125rem 0 0;
  border: 1px solid var(--color-border);
  background: var(--gradient-secondary);
}

hr {
  margin: 32px 14px;
  border-top: 1px solid var(--color-primary);
}

.conversations-list {
  padding: 0 6px;
  height: 95%;
  overflow-y: auto;
}

small {
  display: block;
  text-align: center;
  color: var(--color-sidebar-grey);
  margin-right: 8px;
}

.conversations-section {
  height: calc(100% - 255px);
  padding-bottom: 0;
}

.close-btn {
  position: absolute;
  top: 40px;
  right: 42px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 24px;
  width: 24px;
  background-color: transparent;
  border: 0;

  i {
    color: var(--color-light-grey);
  }
}

@media screen and (min-width: 785px) {
  .logo {
    display: none;
  }

  .close-btn {
    display: none;
  }
}

@media screen and (max-width: 786px) {
  .sidebar {
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    bottom: 0;
    transition: transform 300ms;
    background-color: var(--color-background);
    box-shadow: 3px 0 25px hsla(0, 0%, 0%, 0.15);
  }

  .sidebar.closed {
    transform: translateX(-100%);
  }

  .conversations-list {
    height: calc(100% - 140px) !important;
  }

  .logo {
    display: block;
    padding: 0;
    margin-bottom: 32px;
  }

  .logo img {
    width: 173px;
  }
}

@media screen and (max-width: 380px) {
  .sidebar {
    min-width: 300px;
  }
}
</style>
