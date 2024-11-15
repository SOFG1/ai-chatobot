<script setup lang="ts">
import tinycolor from 'tinycolor2'
import { computed, ref } from 'vue'

const colors = ['#aab2e8', '#674997', '#934995', '#BC4995', '#CC6BA8', '#8F97E1', '#E99BCC']
const defaultUrl = 'https://www.skillbyte.de/wp-content/uploads/2024/06/cropped-favicon-192x192.png'

const props = defineProps<{ name: string; url?: string; color?: string }>()
const showImage = ref<boolean>(true)
const bgColor = computed(() => getColorForUsername(props.name))

const avatarUrl = computed(() => {
  if (props.url === defaultUrl) return '' //return empty string if avatar is the default
  return props.url
})

const fontColor = computed(() =>
  tinycolor(bgColor.value).isDark() ? 'var(--color-text-secondary)' : 'var(--color-text)'
)

function getColorForUsername(username: string = ''): string {
  if (props.color) return props.color // override color if set
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length // Ensure positive index and within bounds
  return colors[index]
}
</script>

<template>
  <div class="avatar">
    <!-- Hide this image and it's 'broken' badge when the url is invalid -->
    <img
      :src="avatarUrl"
      alt=""
      @error="showImage = false"
      @load="showImage = true"
      :class="{ hidden: !showImage || !avatarUrl }"
    />
    <p class="letter" :style="{ color: fontColor }">{{ name[0].toUpperCase() }}</p>
  </div>
</template>

<style scoped>
.avatar {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  width: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background-color: v-bind(bgColor);
  color: var(--color-text);
  user-select: none;
}

.hidden {
  visibility: hidden;
}

img {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 100%;
  border-radius: 50%;
  object-fit: cover;
}
</style>
