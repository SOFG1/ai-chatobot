import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUtilsStore = defineStore('utils', () => {
  const isLoading = ref(false)
  const animateLogo = ref(true)
  const sideBarOpened = ref(false)

  return { isLoading, animateLogo, sideBarOpened }
})