import { useFilesStore } from '@/stores/files'

export const useDraggableFilesUtils = () => {
  const filesStore = useFilesStore()

  function drag(ev: any, id: string, type: 'move-file' | 'move-folder', parent_id?: string | null) {
    ev.dataTransfer.setData('id', id)
    ev.dataTransfer.setData('parent_id', parent_id)
    ev.dataTransfer.setData('type', type)
  }

  function drop(ev: any, target_id: string) {
    ev.preventDefault()
    ev.stopPropagation()
    var type = ev.dataTransfer.getData('type')
    var id = ev.dataTransfer.getData('id')
    var parent_id = ev.dataTransfer.getData('parent_id')
    if (id === target_id) return //Can't move a folder into itself
    if (type === 'move-file' && id && !filesStore.isMoving && parent_id !== target_id) {
      filesStore.moveFile(id, target_id)
    }
    if (type === 'move-folder' && id && !filesStore.isMoving && parent_id !== target_id) {
      filesStore.moveDirectory(id, target_id)
    }
  }

  return { drag, drop }
}
