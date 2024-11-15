<script setup lang="ts">
import { computed, ref } from 'vue'
import tinycolor from 'tinycolor2'
import Icon1 from '@/assets/icons/card-icon-1.svg'
import AccountMultipleIcon from '@/assets/icons/account-multiple.svg'
import EditIcon from '@/assets/icons/edit.svg'
import type { ChatbotIndividual } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useMobileDetection } from '@/composables/useMobileDetection'

const props = withDefaults(
  defineProps<{
    chatbot_id?: string
    color?: string
    owner_id?: string
    title?: string
    description?: string
    fileCount?: number
    individuals?: ChatbotIndividual[]
    Icon?: any
  }>(),
  {
    color: '#fcbdbd',
    title: 'Bot',
    description: 'Sample description',
    fileCount: 0,
    Icon: Icon1
  }
)

const { isTouchDevice } = useMobileDetection()
const { user } = useAuthStore()
const router = useRouter()

const fontColor = computed(() => (tinycolor(props.color).isDark() ? '#fff' : '#000'))
const lightenedColor = computed(() => tinycolor(props.color).lighten(4).toHexString())
const darkenedColor1 = computed(() => tinycolor(props.color).darken(4).toHexString())
const darkenedColor2 = computed(() => tinycolor(lightenedColor.value).darken(4).toHexString())
const darkenedBorderColor = computed(() => tinycolor(props.color).darken(7).toHexString())
const gradientBackground = computed(() => `linear-gradient(251deg, ${lightenedColor.value}, ${props.color})`)
const hoverGradientBackground = computed(
  () => `linear-gradient(251deg, ${darkenedColor2.value}, ${darkenedColor1.value})`
)

const isHovering = ref(false)
const canBeEdited = computed(() => {
  return user.id === props.owner_id
})

function edit() {
  router.push({ name: 'chatbots-edit', params: { id: props.chatbot_id } })
}
</script>

<template>
  <div class="chatbot-preview-box cbpb-default" @mouseenter="isHovering = true" @mouseleave="isHovering = false" data-testId="chatbot-preview">
    <h3 class="truncate">{{ title }}</h3>
    <p>{{ description }}</p>
    <span v-if="fileCount">{{ fileCount }} Dateien</span>
    <div v-if="(isHovering || isTouchDevice) && canBeEdited" class="edit" @click.stop="edit" data-testId="chatbot-edit">
      <EditIcon class="edit-icon" />
    </div>
    <div class="shared" v-if="individuals ? individuals.length > 0 : false">
      <AccountMultipleIcon class="shared-icon" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/mixins';

.chatbot-preview-box {
  position: relative;
  border-radius: 12px;
  min-width: 175px;
  border: 1px solid;
  font-family: Mulish, sans-serif;
  width: 234px;
  height: auto;
  min-height: 127px;
  color: var(--color-text-secondary);
  //margin-right: 22px;
  padding: 14px 12px;
  transition:
    opacity 0.3s ease-in-out,
    border 0.3s ease-in-out;
  cursor: pointer;

  h3 {
    font-size: 16px;
    font-weight: 700;
    padding-right: 1rem;
  }

  p {
    font-size: 12px;
    line-height: 1.2;
    margin-top: 3px;

    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
  }

  span {
    font-size: 0.6rem;
    font-family: 'Poppins', sans-serif;
    margin-top: 3px;
  }

  .edit {
    z-index: 1;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    right: 6px;
    top: 10px;
    width: 32px;
    height: 32px;
    background: transparent;
    border-radius: 50%;

    .edit-icon {
      height: 18px;
      width: 18px;
      margin: 0 0 1px 2px;
      stroke: v-bind(fontColor);

      :deep(path) {
        stroke: v-bind(fontColor);
      }
    }

    &:hover {
      background-color: var(--color-btn-hover-bg);
    }
  }

  .shared {
    position: absolute;
    display: flex;
    align-items: center;
    bottom: -8px;
    right: -8px;
    width: 32px;
    height: 32px;
    background-color: #ffffff;
    border: 1px solid v-bind(darkenedBorderColor);
    border-radius: 50%;

    .shared-icon {
      height: 20px;
      width: 20px;
      position: relative;
      margin: 0 auto;
      fill: var(--color-primary-dark);
    }
  }
}

.icon {
  position: absolute;
  height: 22px;
  width: 22px;
  top: 15px;
  right: 13px;
  stroke: v-bind(fontColor);
}

.cbpb-default {
  position: relative;
  border-radius: 12px;
  border: 1px solid v-bind(darkenedBorderColor);
  color: v-bind(fontColor);
  // transition: --myColor1 0.3s, --myColor2 0.3s;
  transition: all 0.2s ease-in-out;

  @include gradientAnimation(v-bind(gradientBackground), v-bind(hoverGradientBackground), 0.4s);
}

@media screen and (max-width: 786px) {
  .chatbot-preview-box {
    width: 100%;
  }

  .chatbot-preview-box h3 {
    font-size: 16px;
  }

  .chatbot-preview-box p {
    font-size: 16px;
  }
}
</style>
