import { ref } from 'vue'
import type { TsaiContextMenuOption } from '@/types/internal'

export function useTsaiContextMenu(options: TsaiContextMenuOption[], menuHeight?: number) {
  const contextMenuVisible = ref(false)
  const contextMenuPosition = ref({ top: 0, left: 0 })

  // Use this default or use a custom function with adjusted position
  function onContextMenuTriggerClick(event: MouseEvent) {
    let top = event.clientY
    //Place menu on top if it goes off the screen
    if (menuHeight && menuHeight + event.clientY > window.innerHeight) {
      top = event.clientY - menuHeight
    }
    contextMenuVisible.value = true
    contextMenuPosition.value = { top, left: event.clientX }
  }

  // Could be moved to TsaiContextMenu.vue
  function onContextMenuClickOutside() {
    contextMenuVisible.value = false
  }

  // Could be moved to TsaiContextMenu.vue
  function onOptionClicked(optionClicked: TsaiContextMenuOption) {
    contextMenuVisible.value = false

    const option = options.value.find((op) => op.type === optionClicked.type)
    if (option.action) {
      option.action()
    }
  }

  return {
    contextMenuVisible,
    contextMenuPosition,
    onContextMenuTriggerClick,
    onContextMenuClickOutside,
    onOptionClicked
  }
}
