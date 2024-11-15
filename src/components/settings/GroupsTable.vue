<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useIsScrollable } from '@/composables/useIsScrollable'
import EditIcon from '@/assets/icons/edit.svg'
import { useGroupsStore } from '@/stores/groups'
import { useModal } from 'vue-final-modal'
import { toast } from 'vue3-toastify'
import { useI18n } from 'vue-i18n'
import { Tippy } from 'vue-tippy'
import TsaiAvatar from '@/components/TsaiAvatar.vue'
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal.vue'
import CreateEditGroupModal from '@/components/modals/CreateEditGroupModal.vue'
import ActionButton from '@/components/ActionButton.vue'

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'add'): void
}>()

const groupsStore = useGroupsStore()

const tableRef = ref<HTMLDivElement>()
const isScrollable = useIsScrollable(tableRef)
const isDeleting = ref<boolean>(false)

const showConfirmDelete = async (id: string) => {
  const modal = useModal({
    component: DeleteConfirmModal,
    attrs: {
      title: t('groups.delete-group.title'),
      text: t('groups.delete-group.text'),
      processingMessage: t('groups.delete-group.processing'),
      isDeleting: isDeleting,
      onConfirm() {
        isDeleting.value = true
        groupsStore
          .deleteGroup(id)
          .then(() => {
            toast(t('groups.delete-group.success'), {
              autoClose: 3000,
              type: 'success'
            })
            modal.close()
          })
          .catch((e) => {
            const detail = e?.response?.data?.detail
            let message = t('groups.delete-group.error')
            if (detail?.error_code) {
              message = t(error.response?.data?.detail?.error_code, error.response?.data?.detail?.extra)
            }
            modal.close()
            toast(message, {
              autoClose: 3000,
              type: 'error'
            })
          })
          .finally(() => (isDeleting.value = false))
      },
      onClose() {
        modal.close()
      }
    }
  })
  await modal.open()
}

const showEditModal = (groupId: string) => {
  const modal = useModal({
    component: CreateEditGroupModal,
    attrs: {
      onClose() {
        modal.close()
      },
      groupId
    }
  })
  modal.open()
}

onMounted(groupsStore.fetchGroups)
</script>

<template>
  <div class="table-wrapper" :class="{ 'no-scroll': !isScrollable }">
    <div class="table-container" ref="tableRef">
      <table class="table">
        <thead>
          <tr>
            <th>{{ t('groups.icon') }}</th>
            <th>{{ t('groups.name') }}</th>
            <th>{{ t('groups.description') }}</th>
            <th>{{ t('groups.members') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!groupsStore.groups || groupsStore.groups.length === 0">
            <td colspan="4" class="tabe-no-items">&mdash; {{ t('groups.no-groups') }} &mdash;</td>
          </tr>
          <tr v-else v-for="group in groupsStore.groups" :key="group.id">
            <td style="width: 40px">
              <TsaiAvatar class="avatar" :src="group.icon" :name="group.name" />
            </td>
            <td>{{ group?.name }}</td>
            <td>{{ group?.description }}</td>
            <td>
              <Tippy placement="bottom" :duration="0" class="tippy">
                <div class="members">
                  <TsaiAvatar v-if="group.member[0]" class="avatar" :name="group.member[0].name" />
                  <TsaiAvatar v-if="group.member[1]" class="avatar" :name="group.member[1].name" />
                  <TsaiAvatar v-if="group.member[2]" class="avatar" :name="group.member[2].name" />
                </div>
                <template #content>
                  <div class="members-list">
                    <div v-for="member in group.member" class="member" :key="member.id">
                      <TsaiAvatar class="member-avatar" :src="member.avatar" :name="member.name" />
                      <p class="member-name">{{ member.name }}</p>
                    </div>
                  </div>
                </template>
              </Tippy>
            </td>
            <td style="width: 85px">
              <button class="table-action-btn" @click="showEditModal(group.id)">
                <EditIcon />
              </button>
              <ActionButton icon="delete" class="table-action-btn" @click="showConfirmDelete(group.id)" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.avatar {
  height: 32px;
  width: 32px;
}

.tippy {
  display: inline-block;
  width: fit-content !important;
}

.members {
  display: flex;
  width: fit-content;
  min-width: 50px;
  height: auto;
}

.members div {
  flex-shrink: 0;
  height: 32px;
  width: 32px;
}

.members div:not(:first-child) {
  margin-left: -2px;
}

.members-list {
  width: 222px;
  max-height: 400px;
  overflow-y: hidden;
  background-color: var(--color-background);
  padding: 20px;
  border-radius: 14px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
}

.member {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 19px;
}

.member:last-child {
  margin-bottom: 0;
}

.member-avatar {
  border: 0;
}

.member-name {
  font-size: 14px;
  color: var(--color-dark-grey);
}
</style>
