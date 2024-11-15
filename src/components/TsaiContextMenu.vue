<script setup lang="ts">
import { OnClickOutside } from '@vueuse/components'
import type { TsaiContextMenuOption } from '@/types/internal'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    visible: boolean
    options?: TsaiContextMenuOption[]
    position?: { top: number; left: number; bottom: number; right: number }
  }>(),
  {
    position: () => ({ top: 0, left: 0 })
  }
)

const emit = defineEmits<{
  (event: 'clickOutside'): void
  (event: 'optionClicked', option: TsaiContextMenuOption): void
}>()

function calcClassForOption(option: TsaiContextMenuOption) {
  return [
    'tsai-context-menu__item',
    option?.class,
    option.type === 'delete' || option.type === 'logout' ? 'tsai-context-menu__delete' : ''
  ]
}

function optionClicked(option: any) {
  emit('optionClicked', option)
}

function onClickOutside() {
  emit('clickOutside')
}

// position object as css style string
const style = computed(() => {
  return Object.entries(props.position).map(([key, value]) => `${key}: ${value}px`)
})
</script>

<template>
  <OnClickOutside v-if="visible" @trigger="onClickOutside">
    <ul class="tsai-context-menu" :style="style">
      <li
        v-for="(option, index) in options"
        :key="index"
        @click.stop="optionClicked(option)"
        :class="calcClassForOption(option)"
      >
        <div class="tsai-context-menu__content">
          <div class="icon-wrapper">
            <i v-if="option.icon" :class="'gg-' + option.icon"></i>
          </div>
          {{ option.name }}
        </div>
      </li>
    </ul>
  </OnClickOutside>
</template>

<style scoped lang="scss">
.tsai-context-menu {
  font-size: 1rem;
  position: fixed;
  top: 40px;
  z-index: 110;
  background: #f5f5f5;
  border-radius: 12px;
  border: 1px solid var(--color-btn-border);
  box-shadow: 2px 2px 8px #00000038;
  list-style: none;
  padding: 0;
  overflow: hidden;
}

.tsai-context-menu__item {
  padding: 8px 22px;
  cursor: pointer;
}

.tsai-context-menu__content {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Mulish', sans-serif;
}

i {
  --ggs: 0.8;
}

.icon-wrapper {
  min-width: 20px;
  display: flex;
  justify-content: center;
}

.tsai-context-menu__item:hover {
  background-color: var(--color-grey-3);
}

.tsai-context-menu__delete {
  color: var(--color-btn-danger);
}
</style>
