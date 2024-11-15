<script generic="T extends boolean = false" lang="ts" setup>
import type { DropdownOption } from '@/types/internal'
import multiselect from 'vue-multiselect'
import { useI18n } from 'vue-i18n'

const i18n = useI18n()

type ModelType = T extends true ? DropdownOption[] : DropdownOption | null

type Props = {
  label?: string
  placeholder?: string
  options: DropdownOption[]
  description?: string
  isMultiple?: T
  searchable?: boolean
  error?: string
  small?: boolean
  disableLabels?: boolean
}

defineProps<Props>()

const model = defineModel<ModelType>()
</script>

<template>
  <div class="form-group" :class="{ small: small }">
    <label v-if="label">{{ label }}</label>
    <multiselect
      ref="r"
      v-model="model"
      :deselect-label="disableLabels ? '' : i18n.t('dropdown-component.deselect-label')"
      track-by="value"
      label="label"
      :select-label="disableLabels ? '' : i18n.t('dropdown-component.select-label')"
      :placeholder="placeholder"
      :options="options"
      :allow-empty="true"
      :multiple="isMultiple"
      :searchable="searchable"
    >
      <template #option="props">
        <div class="option-label">
          <span>{{ props.option.label }}</span>
          {{ '' }}
          <span v-if="props.option.description" class="option-description">{{ props.option.description }}</span>
        </div>
      </template>
    </multiselect>
    <p v-if="error" class="error-msg">{{ error }}</p>
  </div>
</template>

<style scoped lang="scss">
.small :deep(.multiselect) {
  min-height: 0;
}
.small :deep(.multiselect__tags) {
  position: relative;
  display: flex;
  align-items: center;
  background: none;
  font-size: 16px;
  line-height: 1;
  padding: 2px 12px;
  padding-right: 33px;
  min-height: 36px;
}
.small :deep(.multiselect__single) {
  background-color: transparent;
}

.small :deep(.multiselect__tags)::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 15px;
  height: 7px;
  width: 14px;
  background: url('@/assets/icons/select-arrow.svg') no-repeat right #fff;
  background-size: contain;
}

.small :deep(.multiselect__placeholder) {
  color: var(--color-text-dark);
}

:deep(.multiselect__content-wrapper) {
  overflow: auto;
}

.small :deep(.multiselect__option::after) {
  display: none;
}

.small :deep(.multiselect__placeholder) {
  height: 30px !important;
  display: flex;
  align-items: center;
}

:deep(.multiselect__tags) {
  width: 100%;
  padding: 11px 45px 11px 10px;
  cursor: pointer;
  display: block;
  border-radius: var(--8, 8px);
  border: 1px solid var(--color-border);
  font-size: 0.96rem;
  background: url('@/assets/icons/select-arrow.svg') no-repeat right #fff;
  appearance: none;
  background-position-x: calc(100% - 18px);

  &:focus {
    outline: 2px solid var(--color-primary); // Change to your desired outline style
    transition: outline 0.1s ease-in-out;
  }
}

:deep(.multiselect__select) {
  display: none;
}

:deep(input) {
  padding: 0 !important;
  border: 0 !important;
}

:deep(.multiselect__placeholder) {
  margin-bottom: 0;
}

:deep(.multiselect__single) {
  margin-bottom: 0;
  color: var(--color-text);
}

:deep(.multiselect__option--highlight, .multiselect__option--selected) {
  background: linear-gradient(172deg, rgba(75, 32, 247, 0.05), rgba(169, 0, 247, 0.05)) !important;
  color: var(--color-text) !important;

  &::after {
    background: transparent !important;
    color: var(--color-text) !important;
  }
}

:deep(.multiselect__tag) {
  background: linear-gradient(172deg, rgba(75, 32, 247, 0.05), rgba(169, 0, 247, 0.05));
  color: var(--color-text) !important;
  margin-bottom: 0;
}

.option-description {
  color: var(--color-light-grey);
}
</style>
