<script setup lang="ts">
import { onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import { useModal } from 'vue-final-modal'
import UsersTable from '@/components/settings/UsersTable.vue'
import CreateUserModal from '@/components/modals/CreateUserModal.vue'
import { useI18n } from 'vue-i18n'

const userStore = useUsersStore()
const { t } = useI18n()

onMounted(async () => {
  await userStore.load(0, 100)
})

const modal = useModal({
  component: CreateUserModal,
  attrs: {
    onClose() {
      modal.close()
    }
  }
})
</script>

<template>
  <UsersTable :users="userStore.users" />
  <button class="tsai-button primary large" role="button" type="button" @click="modal.open()">
    {{ t('settings.user-table.create') }}
  </button>
</template>

<style lang="scss" scoped>
.tsai-button {
  margin-top: 32px !important;
}
</style>
