<script setup lang="ts">
import { type FileUser, IndexingStatus } from '@/types'
import { Tippy } from 'vue-tippy'
import { useModal } from 'vue-final-modal'
import { computed, ref } from 'vue'
import { toast } from 'vue3-toastify'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import { useFilesStore } from '@/stores/files'
import MoveDirectoryModal from '@/components/modals/MoveDirectoryModal.vue'
import ActionButton from '@/components/ActionButton.vue'
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal.vue'
import NameModal from '@/components/modals/NameModal.vue'
import BadgeLabel from '@/components/BadgeLabel.vue'
import { useDraggableFilesUtils } from '@/composables/useDraggableFilesUtils'
import { formatDate } from '@vueuse/core'
import { PhFilePdf, PhMicrosoftWordLogo } from '@phosphor-icons/vue'
import PdfPreviewModalComponent from '@/components/modals/PdfPreviewModal.vue'
import { fetchAndCacheFile } from '@/utils/files'

const { t } = useI18n()

const props = defineProps<{ file: FileUser }>()

const filesStore = useFilesStore()

const isDeleting = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const previewFileObjectUrl = ref<string>('')
const previewFileName = ref<string>('')
const previewFileSize = ref<number>(0)

let tippyInstance: any

const { drag } = useDraggableFilesUtils()

const pdfPreviewModal = useModal({
  component: PdfPreviewModalComponent,
  attrs: {
    onClose() {
      pdfPreviewModal.close()
      previewFileObjectUrl.value = ''
      previewFileName.value = ''
    },
    pdfTitle: previewFileName,
    pdfSource: previewFileObjectUrl,
    pdfSize: previewFileSize,
    isLoading: isLoading,
    target: `#file-${props.file.id}`
  }
})

const moveModal = useModal({
  component: MoveDirectoryModal,
  attrs: {
    title: t('files.files.move-modal.title'),
    text: t('files.files.move-modal.description'),
    parent_id: props.file.directory.id,
    onClose() {
      moveModal.close()
    },
    onMove(directory_id: string) {
      handleMove(directory_id)
      moveModal.close()
    }
  }
})

const openEditModal = () => {
  const editModal = useModal({
    component: NameModal,
    attrs: {
      title: t('files.files.edit-modal.title'),
      label: t('files.files.edit-modal.label'),
      placeholder: t('files.files.edit-modal.placeholder'),
      buttonText: t('files.files.edit-modal.action'),
      initialValue: props.file.file_name,
      withDate: props.file.expires ? new Date(props.file.expires) : true,
      onClose() {
        editModal.close()
      },
      onSubmit(name: string, date?: Date) {
        isLoading.value = true
        editModal.close()
        filesStore.editFile(props.file.id, name, date).finally(() => {
          isLoading.value = false
        })
      }
    }
  })
  editModal.open()
}

const showConfirmDelete = async (file: FileUser) => {
  const modal = useModal({
    component: DeleteConfirmModal,
    attrs: {
      title: t('files.delete-modal.title'),
      text: t('files.delete-modal.description', { fileName: file.file_name }),
      processingMessage: t('files.delete-modal.processing'),
      isDeleting: isDeleting,
      onConfirm() {
        isDeleting.value = true
        filesStore
          .deleteFile(file.id)
          .then(() => {
            modal.close()
          })
          .catch((err) => {
            modal.close()
            toast(t('files.toasts.file-deletion-error'), {
              autoClose: 3000,
              type: 'error'
            })
          })
          .finally(() => {
            isDeleting.value = false
          })
      },
      onClose() {
        modal.close()
      }
    }
  })
  await modal.open()
}

const downloadFile = async (fileUser: FileUser) => {
  isLoading.value = true
  const objectUrl = await fetchAndCacheFile(fileUser.id, fileUser.file_name, true)

  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = fileUser.file_name
  anchor.click()

  URL.revokeObjectURL(objectUrl)
  isLoading.value = false
}

const viewFile = async (fileUser: FileUser) => {
  isLoading.value = true

  previewFileObjectUrl.value = await fetchAndCacheFile(fileUser.id, fileUser.file_name)
  previewFileName.value = fileUser.file_name
  previewFileSize.value = fileUser.file.file_size

  await pdfPreviewModal.open()

  isLoading.value = false
}

const reIndexFile = (file: FileUser) => {
  axios
    .patch(import.meta.env.VITE_TXAI_BACKEND_URL + '/api/files/' + file.id + '/reindex')
    .then((resp) => {
      toast(t('files.toasts.file-reindex-success', { fileName: file.file_name }), {
        autoClose: 3000,
        type: 'success'
      })
    })
    .catch((err) => {
      toast(t('files.toasts.file-reindex-error', { fileName: file.file_name }), {
        autoClose: 3000,
        type: 'error'
      })
      console.error(err)
    })
}

const handleMove = (directory_id: string) => {
  isLoading.value = true
  filesStore.moveFile(props.file.id, directory_id).finally(() => (isLoading.value = false))
}

const expireDate = computed(() => {
  return props.file.expires && formatDate(new Date(props.file.expires), 'YYYY-MM-DD h:mm A')
})
</script>

<template>
  <div
    class="file"
    :id="'file-' + props.file.id"
    :draggable="true"
    @dragstart="(e) => drag(e, props.file.id, 'move-file', props.file.directory.id)"
    data-testId="file-item"
  >
    <div class="file-header">
      <PhMicrosoftWordLogo v-if="props.file.file_name.endsWith('.docx')" :size="24" />
      <PhFilePdf v-else :size="24" />
      <p v-if="!isLoading" class="name">{{ file.file_name }}</p>
      <p v-if="isLoading" class="name">{{ t('files.files.loading') }}</p>
      <Tippy
        class="menu-wrapper"
        placement="bottom-start"
        :duration="0"
        :interactive="true"
        trigger="click"
        @create="tippyInstance = $event"
      >
        <button class="menu" data-testId="file-actions">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <template #content>
          <div class="menu-content" @click="tippyInstance?.hide()">
            <ActionButton
              icon="preview"
              class="menu-btn"
              :text="t('files.files.file-actions.preview')"
              @click="viewFile(file)"
            />
            <ActionButton
              icon="edit"
              class="menu-btn"
              :text="t('files.files.file-actions.edit')"
              @click="openEditModal"
            />
            <ActionButton
              v-if="file.file?.indexing_status === IndexingStatus.FAILED"
              class="menu-btn"
              icon="redo"
              :text="t('files.files.file-actions.reindex')"
              @click="reIndexFile(file)"
            />
            <ActionButton
              class="menu-btn"
              icon="move"
              :text="t('files.files.file-actions.move')"
              @click="moveModal.open"
            />
            <ActionButton
              class="menu-btn"
              icon="download"
              :text="t('files.files.file-actions.download')"
              @click="downloadFile(file)"
            />
            <ActionButton
              icon="delete"
              class="menu-btn"
              :text="t('files.files.file-actions.delete')"
              @click="() => showConfirmDelete(file)"
            />
          </div>
        </template>
      </Tippy>
    </div>
    <div class="logo" @click="viewFile(file)" data-testId="file-open-preview">
      <PhMicrosoftWordLogo v-if="props.file.file_name.endsWith('.docx')" :size="42" />
      <PhFilePdf v-else :size="42" />
      <p v-if="file.expires" class="date">{{ expireDate }}</p>
      <BadgeLabel
        v-if="file.file?.indexing_status === IndexingStatus.INDEXED"
        class="status"
        :content="t('files.files.file-status.ready')"
        color="#27D175"
      />
      <BadgeLabel
        v-if="file.file?.indexing_status === IndexingStatus.PENDING"
        :content="t('files.files.file-status.indexing')"
        class="status"
        color="#FFA257"
      />
      <BadgeLabel
        v-if="file.file?.indexing_status === IndexingStatus.FAILED"
        :content="t('files.files.file-status.failed')"
        class="status"
        color="#E52B50"
      />
    </div>
  </div>
</template>

<style scoped>
.file {
  border-radius: 8px;
  padding: 10px 16px 16px;
  cursor: move;
  background: var(--color-folder-bg);

  &:deep(.final-modal-content) {
    width: 100%;
    height: 100%;
    max-width: 60vw;
  }
}

.file-header {
  display: flex;
  align-items: center;
  height: 32px;
  gap: 13px;
  margin-bottom: 10px;
  padding: 0 2px;
}

.file-header svg {
  flex-shrink: 0;
}

.name {
  font-family: 'Mulish', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.input {
  display: block;
  flex-grow: 1;
  min-width: 0;
  outline: 0;
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
.menu span {
  height: 4px;
  width: 4px;
  border-radius: 50%;
  background-color: var(--color-light-grey);
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

.logo {
  position: relative;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 153px;
  background-color: var(--color-background);
  border-radius: 6px;
}

.status {
  position: absolute;
  right: 10px;
  bottom: 8px;
}

.date {
  color: var(--color-text-02);
  font-size: 10px;
  font-family: Mulish, sans-serif;
  position: absolute;
  left: 12px;
  top: 8px;
  margin: 0;
}

.logo img {
  height: 50px;
  width: 50px;
}
</style>
