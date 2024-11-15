<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, onMounted, ref } from 'vue'
import type { DropdownOption } from '@/types/internal'
import type { GroupMember } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { useModal } from 'vue-final-modal'
import { useGroupsStore } from '@/stores/groups'
import { useUsersStore } from '@/stores/users'
import TsaiDropdown from '@/components/form/TsaiDropdown.vue'
import TsaiAvatar from '@/components/TsaiAvatar.vue'
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal.vue'
import ActionButton from '@/components/ActionButton.vue'

const { t } = useI18n()

const props = defineProps<{
  groupId: string
  members: GroupMember[]
}>()

const groupsStore = useGroupsStore()
const authStore = useAuthStore()
const usersStore = useUsersStore()

const selectedUser = ref<DropdownOption>()
const isDeleting = ref<boolean>(false)

const usersOptions = computed(() => {
  return usersStore.users
    .filter((u) => {
      return !props.members.some((m) => m.id === u.id)
    })
    .map((u) => ({ label: u.username, value: u.id }))
})

const handleDeleteMember = (member_id: string) => {
  const modal = useModal({
    component: DeleteConfirmModal,
    attrs: {
      title: t('groups.delete-member.title'),
      text: t('groups.delete-member.text'),
      processingMessage: t('groups.delete-member.processing'),
      isDeleting: isDeleting,
      onConfirm() {
        isDeleting.value = true
        groupsStore
          .deleteGroupMember(props.groupId, member_id)
          .then(() => {
            modal.close()
          })
          .catch((e) => {
            modal.close()
          })
          .finally(() => (isDeleting.value = false))
      },
      onClose() {
        modal.close()
      }
    }
  })
  modal.open()
}

const handleAddMember = () => {
  groupsStore.addGroupMember(props.groupId, selectedUser?.value?.value)
  selectedUser.value = undefined
}

onMounted(() => usersStore.load(0, 100))
</script>

<template>
  <div class="box">
    <TsaiDropdown
      class="dropdown"
      v-model="selectedUser"
      :label="t('groups.add-member.title')"
      :options="usersOptions"
      :searchable="true"
      :disable-labels="true"
    />
    <button class="tsai-button primary" role="button" type="button" @click="handleAddMember" :disabled="!selectedUser">
      {{ t('groups.add-member.add') }}
    </button>
  </div>
  <div v-for="member in props.members" class="member" :key="member.id">
    <TsaiAvatar :url="member.avatar" :name="member.name" class="avatar" />
    <p class="name">{{ member.name }}</p>
    <p v-if="member.id === authStore?.user?.id" class="label">{{ t('groups.owner') }}</p>
    <p v-if="member.id !== authStore?.user?.id" class="label">{{ t('groups.member') }}</p>
    <ActionButton icon="delete" v-if="member.id !== authStore?.user?.id" @click="handleDeleteMember(member.id)" />
  </div>
</template>

<style lang="scss" scoped>
.box {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 18px;
}

.dropdown {
  flex-grow: 1;
  margin-bottom: 0;
}

.tsai-button {
  height: 51px;
  min-width: 80px;
}

.member {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
}

.avatar {
  height: 28px;
  width: 28px;
}

.name {
  font-size: 18px;
  font-family: 'Mulish', sans-serif;
  font-weight: 700;
}

.label {
  font-size: 14px;
  font-family: 'Mulish', sans-serif;
  font-weight: 700;
  color: var(--color-light-grey);
  margin-left: auto;
}

@media screen and (max-width: 440px) {
  .box {
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
  }
}
</style>
