import type { FilesDirectory, FilesDirectoryUser, FileUser } from '@/types'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useAuthStore } from './auth'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import i18n from '@/i18n'
import type { FileToUpload } from '@/types/internal'
import type { ModelValue } from '@vuepic/vue-datepicker'

function convertDirectory(directory: FilesDirectoryUser): FilesDirectory {
  const { id, canonical, name, parent_id } = directory
  return { id, canonical, name, parent_id }
}

export const useFilesStore = defineStore('files', () => {
  const authStore = useAuthStore()
  const currentDirectory = ref<FilesDirectoryUser | null>(null)
  const isFetchingDirectory = ref<boolean>(false)
  const location = ref<FilesDirectory[]>([])
  const files = ref<FileUser[]>([])
  const filesToUpload = ref<FileToUpload[]>([])
  const isUploading = ref<boolean>(false)
  const isMoving = ref<boolean>(false)

  function updateDirectory(directory: FilesDirectory) {
    const index = currentDirectory.value!.children.findIndex((d) => d.id === directory.id)
    currentDirectory.value!.children[index] = directory
  }

  function updateFile(file: FileUser) {
    const index = currentDirectory.value!.files.findIndex((f) => f.id === file.id)
    currentDirectory.value!.files[index] = file
  }

  //Reset to root location
  function resetLocation() {
    location.value = [authStore.user!.root_directory]
  }

  // action to fetch files
  async function fetchFiles() {
    try {
      const response = await axios.get<FileUser[]>('/api/files')
      files.value = response.data
    } catch (error) {
      toast(i18n.global.t('files.toasts.file-fetching-error'), {
        autoClose: 3000,
        type: 'error'
      })
    }
  }

  //When fetchInBackground === false no need to change loader state
  async function fetchCurrentDirectory(fetchInBackground?: boolean) {
    if (!location.value.length) return
    try {
      if (!fetchInBackground) isFetchingDirectory.value = true
      const response = await axios.get<FilesDirectoryUser>(`/api/directories/${location.value.at(-1)?.id}`)
      if (!fetchInBackground) isFetchingDirectory.value = false
      currentDirectory.value = response.data
    } catch (error) {
      toast(i18n.global.t('files.toasts.directory-fetching-error'), {
        autoClose: 3000,
        type: 'error'
      })
      console.error('Error fetching directory', error)
    }
  }

  async function createDirectory(directory_name: string) {
    if (!location.value.length) return
    try {
      const response: { data: FilesDirectoryUser } = await axios.post<FilesDirectoryUser>(`/api/directories`, {
        name: directory_name,
        parent_id: currentDirectory.value?.id
      })
      currentDirectory.value?.children.push(convertDirectory(response.data))
    } catch (error) {
      toast(i18n.global.t('files.toasts.directory-create-error'), {
        autoClose: 3000,
        type: 'error'
      })
    }
  }

  async function renameDirectory(id: string, name: string) {
    try {
      const response: { data: FilesDirectoryUser } = await axios.patch<FilesDirectoryUser>(`/api/directories/${id}`, {
        name
      })
      updateDirectory(convertDirectory(response.data))
    } catch (e) {
      toast(i18n.global.t('files.toasts.directory-rename-error'), {
        autoClose: 3000,
        type: 'error'
      })
    }
  }

  async function moveDirectory(id: string, parent_id: string) {
    try {
      isMoving.value = true
      await axios.patch<FilesDirectoryUser>(`/api/directories/${id}`, {
        parent_id
      })
      const filtered = currentDirectory.value!.children.filter((d) => d.id !== id)
      currentDirectory.value!.children = filtered
    } catch (e) {
      toast(i18n.global.t('files.toasts.directory-move-error'), {
        autoClose: 3000,
        type: 'error'
      })
    } finally {
      isMoving.value = false
    }
  }

  async function deleteDirectory(id: string) {
    try {
      await axios.delete(`/api/directories/${id}`)
      const filtered = currentDirectory.value!.children.filter((d) => d.id !== id)
      currentDirectory.value!.children = filtered
      toast(i18n.global.t('files.toasts.directory-delete-success'), {
        autoClose: 3000,
        type: 'success'
      })
    } catch (e) {
      toast(i18n.global.t('files.toasts.directory-delete-error'), {
        autoClose: 3000,
        type: 'error'
      })
    }
  }

  async function uploadFiles(expires?: ModelValue) {
    for (const fileData of filesToUpload.value) {
      try {
        isUploading.value = true
        const formData = new FormData()
        formData.append('file', fileData.file)
        const directory_id = location.value.at(-1).id || currentDirectory?.value?.id
        formData.append('directory_id', directory_id as string)
        if (expires instanceof Date) {
          formData.append('expires', expires.toISOString())
        }
        const res = await axios.post('/api/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        toast(i18n.global.t('files.toasts.file-upload-success', { fileName: fileData.name }), {
          type: 'success',
          autoClose: 4000
        })
        currentDirectory.value?.files.push(res.data)
        fileData.uploaded = true
      } catch (error: any) {
        const message = error?.response?.data?.detail?.error_code || 'Error occurred'
        toast(i18n.global.t(message), {
          type: 'error',
          autoClose: 4000
        })
        throw error
      } finally {
        isUploading.value = false
      }
    }
  }

  async function deleteFile(id: string) {
    try {
      await axios.delete(`/api/files/${id}`)
      const filtered = currentDirectory.value!.files.filter((f) => f.id !== id)
      currentDirectory.value!.files = filtered
      toast(i18n.global.t('files.toasts.file-deletion-success'), {
        type: 'success',
        autoClose: 4000
      })
    } catch (e) {
      toast(i18n.global.t('files.toasts.file-deletion-error'), {
        autoClose: 3000,
        type: 'error'
      })
    }
  }

  async function editFile(id: string, file_name: string, date?: Date) {
    const data: any = { file_name }
    if (date) data.expires = date.toISOString()
    try {
      const response = await axios.patch(`/api/files/${id}`, data)
      updateFile(response.data)
      toast(i18n.global.t('files.toasts.file-rename-success'), {
        autoClose: 3000,
        type: 'success'
      })
    } catch (e) {
      toast(i18n.global.t('files.toasts.file-rename-error'), {
        autoClose: 3000,
        type: 'error'
      })
    }
  }

  async function moveFile(id: string, directory_id: string) {
    try {
      isMoving.value = true
      await axios.patch(`/api/files/${id}`, { directory_id })
      currentDirectory.value!.files = currentDirectory.value!.files.filter((f) => f.id !== id)
      toast(i18n.global.t('files.toasts.file-move-success'), {
        autoClose: 3000,
        type: 'success'
      })
    } catch (e) {
      toast(i18n.global.t('files.toasts.file-move-error'), {
        autoClose: 3000,
        type: 'error'
      })
    } finally {
      isMoving.value = false
    }
  }

  //Fetch current location in change
  watch(
    () => location.value.toString(),
    () => {
      if (location.value.length) {
        fetchCurrentDirectory()
      }
    }
  )

  //Set root location
  watch(
    () => authStore.user?.root_directory,
    () => {
      if (authStore.user?.root_directory) {
        location.value = [authStore.user?.root_directory]
      }
    },
    { immediate: true }
  )

  const filePathsForSelector = computed(() =>
    files.value.map((file: FileUser) => {
      return { path: file.file_name, id: file.id }
    })
  )

  return {
    fetchFiles,
    currentDirectory,
    isFetchingDirectory,
    fetchCurrentDirectory,
    location,
    resetLocation,
    createDirectory,
    renameDirectory,
    moveDirectory,
    deleteDirectory,
    deleteFile,
    editFile,
    moveFile,
    filePathsForSelector,
    files,
    filesToUpload,
    uploadFiles,
    isUploading,
    isMoving
  }
})
