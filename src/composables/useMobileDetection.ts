/**
 * Check if the user is using a mobile device
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#mobile_device_detection
 * Depending on TS Version using Navigator.userAgentData or 'msMaxTouchPoints' may still be considered experimental
 */
import { onMounted, ref } from 'vue'

const isTouchDevice = ref(false)

export function useMobileDetection() {
  onMounted(() => {
    //only execute when window is available
    if ('maxTouchPoints' in navigator) {
      isTouchDevice.value = navigator.maxTouchPoints > 0
    } else if ('msMaxTouchPoints' in navigator) {
      // @ts-ignore
      isTouchDevice.value = navigator.msMaxTouchPoints > 0
    } else {
      const mQ = matchMedia?.('(pointer:coarse)')
      if (mQ?.media === '(pointer:coarse)') {
        isTouchDevice.value = mQ.matches
      } else if ('orientation' in window) {
        isTouchDevice.value = true // deprecated, but good fallback
      } else {
        if (!('userAgent' in navigator)) return
        // @ts-ignore
        // Only as a last resort, fall back to user agent sniffing
        const UA = navigator.userAgent
        isTouchDevice.value =
          /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) || /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA)
      }
    }
  })

  return { isTouchDevice }
}
