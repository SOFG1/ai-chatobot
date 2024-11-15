<script setup lang="ts">
import EditIconUrl from '@/assets/icons/edit.svg'
import { DateTime } from 'luxon'
import type { User } from '@/types'
import { computed, ref } from 'vue'
import { useIsScrollable } from '@/composables/useIsScrollable'
import { useUsersStore } from '@/stores/users'
import { toast } from 'vue3-toastify'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import EditScopesModal from '@/components/modals/EditScopesModal.vue'
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal.vue'
import ActionButton from '@/components/ActionButton.vue'
import TsaiAvatar from '@/components/TsaiAvatar.vue'

const i18n = useI18n()

const props = defineProps<{ users?: User[] }>()

const emit = defineEmits<{
  (e: 'add'): void
}>()

const authStore = useAuthStore()
const usersStore = useUsersStore()

const tableRef = ref<HTMLDivElement>()
const isScrollable = useIsScrollable(tableRef)
const userToDelete = ref<string | null>(null)
const userToEditScopes = ref<string | null>(null)
const isDeleteing = ref<boolean>(false)

const selectedUserScopes = computed(() => {
  return props.users?.find((u) => u.id === userToEditScopes.value)?.scopes
})

const handleDelete = async () => {
  if (isDeleteing.value) return
  isDeleteing.value = true
  try {
    await usersStore.deleteUser(userToDelete.value as string)
    toast(i18n.t('settings.user-table.user-deletion-success'), {
      autoClose: 3000,
      type: 'success'
    })
  } catch (e: any) {
    let msg
    if (e.response.data?.detail?.error_code) {
      msg = i18n.t(e.response.data?.detail?.error_code, e.response.data?.detail?.extra)
    }
    toast(i18n.t('settings.user-table.user-deletion-error', { errorMsg: msg }), {
      autoClose: 3000,
      type: 'error'
    })
    console.log(e)
  }
  userToDelete.value = null
  isDeleteing.value = false
}
</script>

<template>
  <div class="table-wrapper" :class="{ 'no-scroll': !isScrollable }">
    <div class="table-container" ref="tableRef">
      <table class="table">
        <thead>
          <tr>
            <th style="width: 40px">{{ $t('settings.user-table.avatar') }}</th>
            <th>{{ $t('settings.user-table.username') }}</th>
            <th>{{ $t('settings.user-table.display-name') }}</th>
            <th>{{ $t('settings.user-table.role') }}</th>
            <th>{{ $t('settings.user-table.created') }}</th>
            <th style="width: 45px"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!users || users.length === 0">
            <td colspan="4" class="table-no-items" data-testid="no-users">
              &mdash; {{ $t('settings.user-table.no-users') }} &mdash;
            </td>
          </tr>
          <tr v-else v-for="user in users" :key="user.id">
            <td data-testid="column-avatar">
              <TsaiAvatar class="avatar" :src="user.avatar" :name="user.name" />
            </td>
            <td data-testid="column-username">{{ user?.username }}</td>
            <td>
              <span>{{ user?.name }}</span>
            </td>
            <td>
              <div class="table-item-flex">
                <span>{{ user?.scopes === '*' ? 'Admin' : 'User' }}</span>
                <button
                  v-if="user.id !== authStore.user?.id"
                  @click="userToEditScopes = user.id"
                  class="table-action-btn"
                >
                  <EditIconUrl />
                </button>
              </div>
            </td>
            <td>{{ DateTime.fromISO(user.created, { zone: 'utc' }).toRelative() }}</td>
            <td>
              <div class="table-item-flex">
                <ActionButton icon="delete" @click="userToDelete = user.id" class="table-action-btn" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <EditScopesModal
    :modelValue="!!userToEditScopes"
    @update:modelValue="userToEditScopes = null"
    :scopes="selectedUserScopes || ''"
    :id="userToEditScopes"
    @close="userToEditScopes = null"
  />
  <DeleteConfirmModal
    :modelValue="!!userToDelete"
    @update:modelValue="userToDelete = null"
    @close="userToDelete = null"
    @confirm="handleDelete"
    title="Benutzer löschen?"
    text="Möchten Sie diesen Benutzer wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
  />
</template>

<style lang="scss" scoped>
.avatar {
  border: 1px solid var(--color-border-grey);
  height: 32px;
  width: 32px;
}

@media screen and (max-width: 786px) {
  .container {
    min-width: 0;
  }
}
</style>
