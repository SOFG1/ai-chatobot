<script setup lang="ts">
import ArrowIcon from '@/assets/icons/arrow-down.svg'
import type { DropdownOption, FilesFiltersType, SortingType } from '@/types/internal'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import TsaiDropdown from '@/components/form/TsaiDropdown.vue'

const { t } = useI18n()

const props = defineProps<{ filters: FilesFiltersType; sorting: SortingType }>()

const emit = defineEmits<{
  (e: 'update:filters', value: FilesFiltersType): void
  (e: 'update:sorting', value: SortingType): void
}>()

const filesStatusValue = computed(() => {
  return props.filters.map((o) => ({ label: o, value: o }))
})

const sortingValue = computed(() => {
  return props.sorting.property && sortingOptions.find((o) => o.value === props.sorting.property)
})

const changeSorting = (key: keyof SortingType, val: SortingType[keyof SortingType]) => {
  emit('update:sorting', { ...props.sorting, [key]: val })
}

const indexingOptions: DropdownOption[] = [
  { label: t('files.filters.ready'), value: 'indexed' },
  { label: t('files.filters.pending'), value: 'pending' },
  { label: t('files.filters.failed'), value: 'failed' }
]

const sortingOptions: DropdownOption[] = [
  { label: t('files.filters.a-z'), value: 'a-z' },
  { label: t('files.filters.last-change'), value: 'last-change' }
]
</script>

<template>
  <div class="wrapper">
    <TsaiDropdown
      :small="true"
      class="dropdown filter"
      :placeholder="t('files.status-label')"
      @update:modelValue="
        (v) =>
          emit(
            'update:filters',
            (v as DropdownOption[]).map((o) => o.value)
          )
      "
      :modelValue="filesStatusValue"
      :options="indexingOptions"
      :isMultiple="true"
    />
    <span class="separator"></span>
    <div class="box">
      <button
        v-if="sorting.property"
        class="sorting-btn"
        @click="() => changeSorting('dir', sorting.dir === 'asc' ? 'desc' : 'asc')"
      >
        <ArrowIcon class="arrow" :class="{ selected: sorting.dir === 'asc' }" />
      </button>
      <TsaiDropdown
        :small="true"
        class="dropdown sorting"
        :placeholder="t('files.sorting')"
        :modelValue="sortingValue"
        @update:modelValue="(v) => changeSorting('property', v?.value)"
        :options="sortingOptions"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
}
.box {
  display: flex;
  gap: 12px;
}
.filter {
  min-width: 144px;
}
.separator {
  display: inline-block;
  width: 1px;
  height: 28px;
  background-color: var(--color-border-grey);
}
.sorting {
  min-width: 154px;
}
.dropdown {
  flex-shrink: 0;
  margin: 0;
  color: var(--color-text-dark);
}
.dropdown :deep(.multiselect__tags) {
  border: 0;
  background-color: var(--background-light);
}
.sorting-btn {
  background-color: var(--background-light);
  border: 0;
  border-radius: 8px;
  height: 36px;
  width: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: 200ms;
}
.sorting-btn:hover {
  opacity: 0.7;
}
.text {
  color: var(--color-text-dark);
}
.icon {
  margin-right: 16px;
}
.arrow.selected {
  transform: rotate(180deg);
}

@media screen and (max-width: 483px) {
  .wrapper {
    width: 100%;
    flex-wrap: wrap;
    align-items: stretch;
  }
  .wrapper > div {
    width: 100%;
  }
  .form-group {
    flex-grow: 1;
  }
  .separator {
    display: none;
  }
}
</style>
