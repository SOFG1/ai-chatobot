<script setup lang="ts">
import { toast } from 'vue3-toastify'
import RedoUrl from '@/assets/icons/redo.svg?url'
import PreviewIconUrl from '@/assets/icons/preview.svg?url'
import BadgeLabel from '@/components/BadgeLabel.vue'
import { type FileUser, IndexingStatus } from '@/types'
import axios, { type AxiosRequestConfig } from 'axios'
import PDFLabel from './PDFLabel.vue'
import TextInput from './form/TextInput.vue'
import { computed, ref } from 'vue'
import { useIsScrollable } from '@/composables/useIsScrollable'
import DeleteConfirmModal from './modals/DeleteConfirmModal.vue'
import { useModal } from 'vue-final-modal'
import { useI18n } from 'vue-i18n'
import DeleteButton from './DeleteButton.vue'
import { useAuthStore } from '@/stores/auth'
import PdfPreviewModalComponent from '@/components/modals/PdfPreviewModal.vue'
import { DateTime } from 'luxon'

const { t } = useI18n()
const props = defineProps<{ files?: FileUser[] }>()
const emit = defineEmits<{
  (e: 'fileDeleted'): void
  (e: 'fileReindexed'): void
}>()

const { token } = useAuthStore()

const searchVal = ref<string>('')
const tableRef = ref<HTMLDivElement>()
const isDeleting = ref<boolean>(false)
const isScrollable = useIsScrollable(tableRef)
const isLoading = ref<boolean>(false)
const documentUrl = ref<string>('')
const selectedFileName = ref<string>('')

const filesToShow = computed(() => {
  return props.files?.filter((f) => f.file_name.includes(searchVal.value))
})

const pdfPreviewModal = useModal({
  component: PdfPreviewModalComponent,
  attrs: {
    onClose() {
      console.log('closing pdf preview modal')
      pdfPreviewModal.close()
      documentUrl.value = ''
      selectedFileName.value = ''
    },
    pdfTitle: selectedFileName,
    pdfSource: documentUrl,
    isLoading: isLoading,
    target: '#pdf-preview-modal'
  }
})

const loadFile = async (fileUser: FileUser) => {
  isLoading.value = true
  selectedFileName.value = fileUser.file_name
  await pdfPreviewModal.open()

  const requestConfig: AxiosRequestConfig = {
    responseType: 'arraybuffer',
    headers: {
      Authorization: 'Bearer ' + token
    }
  }
  // download the file first using the session token
  const response = await axios.get(
    `${import.meta.env.VITE_TXAI_BACKEND_URL}/api/files/download/${fileUser.id}/${fileUser.file_name}`,
    requestConfig
  )

  // open the downloaded file in a new tab
  documentUrl.value = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
  isLoading.value = false
}

const reIndexFile = (file: FileUser) => {
  console.log('Reindexing file:', typeof file, file)
  axios
    .patch(import.meta.env.VITE_TXAI_BACKEND_URL + '/api/files/' + file.id + '/reindex')
    .then((resp) => {
      console.log('file reindexed', resp)
      toast(t('files.toasts.file-reindex-success', { fileName: file.file_name }), {
        autoClose: 3000,
        type: 'success'
      })
      emit('fileReindexed')
    })
    .catch((err) => {
      toast(t('files.toasts.file-reindex-error', { fileName: file.file_name }), {
        autoClose: 3000,
        type: 'error'
      })
      console.error(err)
    })
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
        deleteFile(file.id)
          .then(() => {
            modal.close()
          })
          .catch((err) => {
            modal.close()
            toast(t('files.toasts.file-deletion-error'), {
              autoClose: 3000,
              type: 'error'
            })
            console.error(err)
          })
      },
      onClose() {
        modal.close()
      }
    }
  })
  await modal.open()
}

const deleteFile = async (fileId: string) => {
  try {
    isDeleting.value = true
    await axios.delete(`${import.meta.env.VITE_TXAI_BACKEND_URL}/api/files/${fileId}`)
    toast(t('files.toasts.file-deletion-success'), {
      autoClose: 3000,
      type: 'success'
    })
    emit('fileDeleted')
  } catch (err) {
    toast(t('files.toasts.file-deletion-error'), {
      autoClose: 3000,
      type: 'error'
    })
    console.error(err)
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="container">
    <div id="pdf-preview-modal"></div>
    <TextInput v-model="searchVal" :placeholder="t('files.search-placeholder')" />
    <div class="table-wrapper" :class="{ 'no-scroll': !isScrollable }">
      <div class="table-container" ref="tableRef">
        <table class="table">
          <thead>
            <tr>
              <th>{{ $t('files.table.type') }}</th>
              <th>{{ $t('files.table.filename') }}</th>
              <th>{{ $t('files.table.state') }}</th>
              <th>{{ $t('files.table.created') }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!files || files.length === 0">
              <td colspan="5" class="table-no-items">&mdash; {{ $t('files.table.no-files') }} &mdash;</td>
            </tr>
            <tr v-else v-for="file in filesToShow" :key="file.id">
              <td>
                <PDFLabel />
              </td>
              <td>{{ file.file_name }}</td>
              <td>
                <BadgeLabel
                  v-if="file.file?.indexing_status === IndexingStatus.INDEXED"
                  content="READY"
                  color="#27D175"
                />
                <BadgeLabel
                  v-if="file.file?.indexing_status === IndexingStatus.PENDING"
                  content="INDEXING"
                  color="#FFA257"
                />
                <BadgeLabel
                  v-if="file.file?.indexing_status === IndexingStatus.FAILED"
                  content="FAILED"
                  color="#E52B50"
                />
              </td>
              <td>{{ DateTime.fromISO(file.created, { zone: 'utc' }).setLocale('de').toRelative() }}</td>
              <td>
                <button
                  class="table-action-btn"
                  @click="reIndexFile(file)"
                  v-if="file.file?.indexing_status === IndexingStatus.FAILED"
                >
                  <img :src="RedoUrl" alt="logo-icon-url" />
                </button>
                <button class="table-action-btn" @click="loadFile(file)">
                  <img :src="PreviewIconUrl" alt="preview-icon-url" />
                </button>
                <DeleteButton class="table-action-btn" @click="showConfirmDelete(file)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  max-width: 986px;

  #pdf-preview-modal {
    background-color: purple;

    &:deep(.final-modal-content) {
      width: 100%;
      height: 100%;
      max-width: 60vw;
    }
  }
}

.table-wrapper {
  margin-top: 24px;
}

img {
  width: 24px;
  height: 24px;
  cursor: pointer;
  line-height: 1;
  margin-right: 12px;
}
</style>
