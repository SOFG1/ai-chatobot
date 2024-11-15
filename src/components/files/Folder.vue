<script setup lang="ts">
import { useFilesStore } from '@/stores/files'
import type { FilesDirectory } from '@/types'
import { toast } from 'vue3-toastify'
import { Tippy } from 'vue-tippy'
import { computed, ref } from 'vue'
import { useModal } from 'vue-final-modal'
import { useI18n } from 'vue-i18n'
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal.vue'
import MoveDirectoryModal from '@/components/modals/MoveDirectoryModal.vue'
import ActionButton from '@/components/ActionButton.vue'
import NameModal from '@/components/modals/NameModal.vue'
import { useDropZone } from '@vueuse/core'
import DropZone from '@/components/files/DropZone.vue'
import { useUploadModal } from '@/composables/useUploadModal'
import { useDraggableFilesUtils } from '@/composables/useDraggableFilesUtils'
import { folderNameValidator } from '@/utils/folderNameValidator'

const { t } = useI18n()

const props = defineProps<{ folder: FilesDirectory }>()

const filesStore = useFilesStore()

let tippyInstance: any
const isLoading = ref<boolean>(false)
const folderRef = ref<HTMLDivElement>()
const menuButtonRef = ref()

const { drag } = useDraggableFilesUtils()
const isDragover = ref<boolean>(false) //ID or null

const uploadModal = useUploadModal()

const { isOverDropZone } = useDropZone(folderRef, {
  onDrop,
  // specify the types of data to be received.
  dataTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
})
const { drop } = useDraggableFilesUtils()

const disabledMove = computed<boolean>(() => {
  //Disable move btn if it's a single folder inside root directory
  if (filesStore.currentDirectory!.children.length === 1 && props.folder.id === filesStore.currentDirectory?.id) {
    return true
  }
  return false
})

function onDrop(files: File[] | null, e: any) {
  var data = e.dataTransfer.getData('type')
  if (data === 'move-file' || data === 'move-folder') return
  if (files) {
    for (let i = 0; i < files.length; i++) {
      filesStore.filesToUpload.push({
        file: files[i],
        name: files[i].name,
        size: files[i].size,
        uploaded: false
      })
    }
  }
  uploadModal.open()
  filesStore.location.push(props.folder)
}

const editModal = useModal({
  component: NameModal,
  attrs: {
    title: t('files.folders.edit-modal.title'),
    label: t('files.folders.edit-modal.label'),
    placeholder: t('files.folders.edit-modal.placeholder'),
    buttonText: t('files.folders.edit-modal.action'),
    initialValue: props.folder.name,
    validator: folderNameValidator,
    onClose() {
      editModal.close()
    },
    onSubmit(name: string) {
      isLoading.value = true
      editModal.close()
      filesStore.renameDirectory(props.folder.id, name).finally(() => {
        isLoading.value = false
      })
    }
  }
})

const moveModal = useModal({
  component: MoveDirectoryModal,
  attrs: {
    title: t('files.folders.move-modal.title'),
    text: t('files.folders.move-modal.description'),
    parent_id: props.folder.parent_id,
    folder_id: props.folder.id,
    onClose() {
      moveModal.close()
    },
    onMove(directory_id: string) {
      moveModal.close()
      isLoading.value = true
      filesStore.moveDirectory(props.folder.id, directory_id).finally(() => (isLoading.value = false))
    }
  }
})

const deleteModal = useModal({
  component: DeleteConfirmModal,
  attrs: {
    title: t('files.folders.delete-modal.title'),
    text: t('files.folders.delete-modal.text'),
    processingMessage: 'processing',
    isDeleting: isLoading,
    onConfirm() {
      isLoading.value = true
      filesStore
        .deleteDirectory(props.folder.id)
        .then(() => {
          deleteModal.close()
        })
        .catch((err) => {
          deleteModal.close()
          toast(t('files.folders.toasts.directory-delete-success'), {
            autoClose: 3000,
            type: 'error'
          })
        })
        .finally(() => {
          isLoading.value = false
        })
    },
    onClose() {
      deleteModal.close()
    }
  }
})

function allowDrop(ev: any) {
  ev.preventDefault()
}
</script>

<template>
  <div
    class="folder"
    :class="{ dragging: isDragover }"
    @click="filesStore.location.push(folder)"
    ref="folderRef"
    @dragstart="(e) => drag(e, props.folder.id, 'move-folder', props.folder.parent_id)"
    @drop="
      (e) => {
        isDragover = false
        drop(e, folder.id)
      }
    "
    @dragover="allowDrop"
    :draggable="true"
    @dragenter="isDragover = true"
    @dragleave="isDragover = false"
  >
    <i class="gg-folder"></i>
    <p v-if="!isLoading" class="name">{{ folder.name }}</p>
    <p v-if="isLoading" class="name">{{ $t('files.folders.loading') }}</p>
    <Tippy
      class="menu-wrapper"
      @create="tippyInstance = $event"
      placement="bottom-start"
      :duration="0"
      :interactive="true"
      trigger="click"
      :trigger-target="menuButtonRef"
    >
      <button class="menu" @click.stop ref="menuButtonRef">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <template #content>
        <div class="menu-content" @click.stop="tippyInstance.hide">
          <ActionButton
            icon="edit"
            class="menu-btn"
            :text="t('files.folders.folder-actions.edit')"
            @click="editModal.open"
          />
          <ActionButton
            v-if="!disabledMove"
            icon="move"
            class="menu-btn"
            :text="t('files.folders.folder-actions.move')"
            @click="moveModal.open"
          />
          <ActionButton
            icon="delete"
            class="menu-btn"
            :text="t('files.folders.folder-actions.delete')"
            @click="deleteModal.open"
          />
        </div>
      </template>
    </Tippy>
    <DropZone v-if="isOverDropZone" class="dropzone" :is-over="isOverDropZone" />
  </div>
</template>

<style scoped>
.folder {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: var(--color-folder-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 13px 18px;
  cursor: pointer;
}

i {
  flex-shrink: 0;
}

.folder:hover {
  background-color: var(--color-primary);
  .gg-folder {
    color: var(--color-background);
    background-color: var(--color-background);
  }
  .gg-folder::after {
    background-color: var(--color-background);
  }
  .name {
    color: var(--color-background);
  }
  .menu span {
    background-color: var(--color-background);
  }
}

.folder.dragging {
  box-shadow: 0 0 5px var(--color-primary);
}

.gg-folder {
  color: var(--color-dark-grey);
  background-color: var(--color-dark-grey);
}

.gg-folder::after {
  background-color: var(--color-dark-grey);
}

.name {
  font-size: 18px;
  font-family: 'Mulish', sans-serif;
  overflow-x: hidden;
  text-overflow: ellipsis;
}

.menu-wrapper {
  margin-left: auto;
}

.menu {
  height: 24px;
  width: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background-color: transparent;
  border: 0;
  cursor: pointer;
  padding: 3px 0;
  border-radius: 5px;
  transition: 150ms;
  outline: none;
}

.menu:hover {
  background-color: var(--color-background);
}

.menu:hover span {
  background-color: var(--color-primary) !important;
}

.menu span {
  height: 4px;
  width: 4px;
  border-radius: 50%;
  background-color: var(--color-dark-grey);
}

.menu-content {
  background-color: var(--color-background);
  border-radius: 14px;
  box-shadow: 0 0 20px rgb(0, 0, 0, 0.2);
  overflow: hidden;
}

.menu-btn {
  display: flex;
  width: 100%;
  padding: 14px 20px;
}

.menu-btn:hover {
  background-color: var(--color-grey-3);
}

.input {
  width: auto;
  min-width: 0;
}

.dropzone {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.4);
  padding: 2px;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  height: 100%;
  border-radius: 8px;
  min-height: 0;
  height: 100%;
  width: 100%;
  z-index: 1;
}
.dropzone :deep(h4) {
  font-size: 0px;
  line-height: 1;
}
</style>
