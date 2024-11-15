<script setup lang="ts">
import VueDatePicker, { type ModelValue } from '@vuepic/vue-datepicker'
import { useI18n } from 'vue-i18n'

const model = defineModel<ModelValue>()
defineProps<{
  timePicker?: boolean
  minDate?: Date
  placeholder?: string
}>()

const { t } = useI18n()
</script>

<template>
  <VueDatePicker
    class="date-picker"
    v-model="model"
    :enableTimePicker="timePicker"
    :minDate="minDate"
    :placeholder="placeholder"
    :locale="t('_global.datepicker.locale')"
    :format="t('_global.datepicker.format')"
    :select-text="t('_global.datepicker.select-text')"
    :cancel-text="t('_global.datepicker.cancel-text')"
  ></VueDatePicker>
</template>

<style scoped lang="scss">
.date-picker {
  width: fit-content;
}
</style>
