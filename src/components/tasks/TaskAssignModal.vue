<template>
  <a-modal
    :open="open"
    title="Affecter des personnes"
    :confirm-loading="loading"
    @ok="handleSubmit"
    @cancel="handleCancel"
    width="500px"
  >
    <div class="assign-modal-content">
      <a-alert
        message="Gérer les affectations"
        :description="`Tâche : ${task?.title}`"
        type="info"
        show-icon
        style="margin-bottom: 16px"
      />

      <a-form layout="vertical">
        <a-form-item label="Personnes affectées">
          <a-select
            v-model:value="selectedUsers"
            mode="multiple"
            placeholder="Sélectionner des utilisateurs"
            style="width: 100%"
            :options="userOptions"
            :filter-option="filterUsers"
            show-search
          >
            <template #option="{ value, label, avatar }">
              <div class="user-option">
                <a-avatar :src="avatar" size="small">
                  {{ getInitials(label) }}
                </a-avatar>
                <span>{{ label }}</span>
              </div>
            </template>
          </a-select>
        </a-form-item>

        <a-divider />

        <div class="current-assignments">
          <div class="section-title">Actuellement affectées :</div>
          <a-space v-if="currentAssignments.length > 0" wrap>
            <a-tag
              v-for="user in currentAssignments"
              :key="user.id"
              closable
              color="blue"
              @close="removeUser(user.id)"
            >
              <a-avatar :src="user.avatar" size="small" style="margin-right: 8px">
                {{ getInitials(user.name) }}
              </a-avatar>
              {{ user.name }}
            </a-tag>
          </a-space>
          <a-empty
            v-else
            description="Aucune personne affectée"
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
            style="margin: 12px 0"
          />
        </div>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { message, Empty } from 'ant-design-vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  task: {
    type: Object,
    default: null
  },
  users: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:open', 'submit', 'cancel'])

const loading = ref(false)
const selectedUsers = ref([])

const userOptions = computed(() => {
  return props.users.map(user => ({
    label: user.name,
    value: user.id,
    avatar: user.avatar
  }))
})

const currentAssignments = computed(() => {
  if (!props.task?.assignedTo) return []
  return props.users.filter(user =>
    props.task.assignedTo.includes(user.id)
  )
})

watch(() => props.open, (newVal) => {
  if (newVal && props.task) {
    selectedUsers.value = [...(props.task.assignedTo || [])]
  }
})

function filterUsers(input, option) {
  return option.label.toLowerCase().includes(input.toLowerCase())
}

function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function removeUser(userId) {
  selectedUsers.value = selectedUsers.value.filter(id => id !== userId)
}

async function handleSubmit() {
  loading.value = true
  try {
    emit('submit', selectedUsers.value)
    loading.value = false
  } catch (error) {
    loading.value = false
    message.error('Erreur lors de la mise à jour des affectations')
  }
}

function handleCancel() {
  selectedUsers.value = []
  emit('update:open', false)
  emit('cancel')
}
</script>

<style scoped>
.assign-modal-content {
  padding: 8px 0;
}

.user-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-assignments {
  margin-top: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 12px;
}

:deep(.ant-tag) {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  margin-bottom: 8px;
}
</style>
