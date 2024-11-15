<script setup lang="ts">
const model = defineModel({
  default: '#fcbdbd'
})
</script>

<template>
  <div class="tsai-color-picker">
    <label for="color">{{ $t('color-picker-component.title') }}</label>
    <label class="color-wrapper">
      <input class="tsai-input" type="color" id="color" v-model="model" placeholder="#fcbdbd" />
      <span>{{ model }}</span>
    </label>
  </div>
</template>

<style scoped lang="scss">
.tsai-color-picker .color-wrapper {
  border: 1px solid var(--color-border);
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-content: center;
  align-items: center;

  span {
    margin-left: 10px;
    font-size: 16px;
    font-family: 'Mulis', sans-serif;
    color: var(--color-text-02);
  }

  input[type="color"] {
    transition: all 0.2s ease-in-out;
    cursor: pointer;
  }
  input[type="color"]:hover {
    box-shadow: 0 0 6px 3px rgba(112, 112, 112, 0.1);
  }
}
</style>