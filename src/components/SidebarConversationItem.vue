<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const i18n = useI18n()

const props = defineProps<{
  title: string | null
  active: boolean
}>()

const emit = defineEmits<{
  (e: 'onMenuClick', event: MouseEvent): void
}>()

const classList = computed(() => [`conversation-item`, { active: props.active }])

function onMoreClick(event: MouseEvent) {
  emit('onMenuClick', event)
}
</script>

<template>
  <div :class="classList">
    <p class="truncate">{{ title ?? i18n.t('conversations.new-chat-default-name') }}</p>
    <div class="icon-wrapper" @click.stop="onMoreClick">
      <i class="gg-more-alt"></i>
    </div>
  </div>
</template>

<style scoped lang="scss">
.conversation-item {
  position: relative;
  display: flex;
  background: transparent;
  border-radius: var(--8, 0.5rem);
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  padding: 10px 12px 10px 16px;
  margin: 8px 0;
  transition: background-color 0.2s ease-in-out;
  font-size: 14px;
  cursor: pointer;
  user-select: none;

  &.active,
  &:hover,
  &:focus {
    background: rgba(255, 255, 255, 0.5);
  }
}

i {
  --ggs: 1.2;
  flex-shrink: 0;
  margin: 0 8px;
}

.icon-wrapper {
  padding: 9px 0;
}
</style>
