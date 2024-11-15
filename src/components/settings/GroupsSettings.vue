<script setup lang="ts">
import { useModal } from 'vue-final-modal'
import { useI18n } from 'vue-i18n'
import CreateEditGroupModal from '@/components/modals/CreateEditGroupModal.vue'
import GroupsTable from '@/components/settings/GroupsTable.vue'

const { t } = useI18n()

const modal = useModal({
  component: CreateEditGroupModal,
  attrs: {
    onClose() {
      modal.close()
    }
  }
})
</script>

<template>
  <GroupsTable />
  <button class="tsai-button primary large" role="button" type="button" @click="modal.open()">
    {{ t('groups.create-group.button') }}
  </button>
</template>

<style lang="scss" scoped>
.tsai-button {
  margin: 32px 0 !important;
}
</style>
