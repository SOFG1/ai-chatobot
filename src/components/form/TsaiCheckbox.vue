<script setup lang="ts">
import { getCurrentInstance } from 'vue'

const props = withDefaults(defineProps<{
  title: string,
  icon?: string,
  checked?: boolean,
  indeterminate?: boolean
}>(), {
  checked: false,
  indeterminate: false
})
const emit = defineEmits<{
  (e: 'change', event: Event): void
  (e: 'input', newValue: boolean): void
}>()

function emitChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('change', event)
  console.log('checked', target.checked)
  model.value = target.checked
}

const model = defineModel<boolean>()

const vueInstance = getCurrentInstance()
const uid = String(vueInstance?.uid)
</script>

<template>
  <div class="tsai-checkbox-wrapper">
    <input
      type="checkbox"
      @change="emitChange"
      :checked="model"
      :indeterminate="indeterminate"
      class="inp-cbx"
      :id="'tsai-checkbox-' + uid"
    />
    <label class="cbx" :for="'tsai-checkbox-' + uid">
      <span>
        <svg v-if="indeterminate" width="12px" height="10px">
          <use xlink:href="#indeterminate-4"></use>
        </svg>
        <svg v-else width="12px" height="10px">
          <use xlink:href="#check-4"></use>
        </svg>
      </span>
      <span><i v-if="icon" :class="icon"></i> {{ title }}</span>
    </label>
    <svg class="inline-svg">
      <symbol id="check-4" viewbox="0 0 12 10">
        <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
      </symbol>
    </svg>
    <svg class="inline-svg">
      <symbol id="indeterminate-4" viewbox="0 0 12 10">
        <polyline points="2 5 10 5"></polyline>
      </symbol>
    </svg>
  </div>
</template>

<style scoped lang="scss">
.tsai-checkbox-wrapper * {
  box-sizing: border-box;
}

.tsai-checkbox-wrapper .cbx {
  -webkit-user-select: none;
  user-select: none;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.2s ease;
  display: inline-block;
}

.tsai-checkbox-wrapper .cbx:not(:last-child) {
  margin-right: 6px;
}

.tsai-checkbox-wrapper .cbx:hover {
  background: rgba(0, 119, 255, 0.06);
}

.tsai-checkbox-wrapper .cbx span {
  float: left;
  vertical-align: middle;
  transform: translate3d(0, 0, 0);
}

.tsai-checkbox-wrapper .cbx span:first-child {
  position: relative;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  transform: scale(1);
  border: 1px solid var(--color-btn-border);
  transition: all 0.2s ease;
  box-shadow: 0 1px 1px rgba(0, 16, 75, 0.05);
}

.tsai-checkbox-wrapper .cbx span:first-child svg {
  position: absolute;
  top: 3px;
  left: 2px;
  fill: none;
  stroke: #fff;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 16px;
  stroke-dashoffset: 16px;
  transition: all 0.3s ease;
  transition-delay: 0.1s;
  transform: translate3d(0, 0, 0);
}

.tsai-checkbox-wrapper .cbx span:last-child {
  display: flex;
  align-items: center;
  padding-left: 8px;
  line-height: 18px;

  i {
    --ggs: 0.6;
  }
}

.tsai-checkbox-wrapper .cbx:hover span:first-child {
  border-color: var(--color-purple-2);
}

.tsai-checkbox-wrapper .inp-cbx {
  position: absolute;
  visibility: hidden;
}

.tsai-checkbox-wrapper .inp-cbx:checked + .cbx span:first-child,
.tsai-checkbox-wrapper .inp-cbx:indeterminate + .cbx span:first-child {
  background: var(--color-purple-2);
  border-color: var(--color-purple-2);
  animation: wave-4 0.4s ease;
}

.tsai-checkbox-wrapper .inp-cbx:checked + .cbx span:first-child svg,
.tsai-checkbox-wrapper .inp-cbx:indeterminate + .cbx span:first-child svg {
  stroke-dashoffset: 0;
}

.tsai-checkbox-wrapper .inline-svg {
  position: absolute;
  width: 0;
  height: 0;
  pointer-events: none;
  user-select: none;
}

@media screen and (max-width: 640px) {
  .tsai-checkbox-wrapper .cbx {
    width: 100%;
    display: inline-block;
  }
}

@-moz-keyframes wave-4 {
  50% {
    transform: scale(0.9);
  }
}

@-webkit-keyframes wave-4 {
  50% {
    transform: scale(0.9);
  }
}

@-o-keyframes wave-4 {
  50% {
    transform: scale(0.9);
  }
}

@keyframes wave-4 {
  50% {
    transform: scale(0.9);
  }
}
</style>