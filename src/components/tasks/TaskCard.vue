<template>
  <a-card class="mb-3 transition-all duration-300 rounded-lg border border-gray-100 hover:shadow-md hover:border-gray-300" :class="cardClass" hoverable>
    <template #title>
      <div class="flex items-center justify-between gap-2">
        <a-typography-text :ellipsis="true" :content="task.title" strong />
        <a-tag :color="statusColor" class="m-0">
          {{ statusLabel }}
        </a-tag>
      </div>
    </template>

    <template #extra>
      <a-dropdown>
        <a-button type="text" size="small" @click.stop>
          <MoreOutlined />
        </a-button>
        <template #overlay>
          <a-menu>
            <a-menu-item @click="$emit('comment')">
              <CommentOutlined /> Commenter
            </a-menu-item>
            <a-menu-item v-if="canAssign" @click="$emit('assign')">
              <UserAddOutlined /> Affecter
            </a-menu-item>
            <a-menu-item v-if="canEdit" @click="$emit('edit')">
              <EditOutlined /> Modifier
            </a-menu-item>
            <a-menu-item v-if="canValidate && task.status === TASK_STATUS.NOT_VALIDATED" @click="$emit('validate')">
              <CheckCircleOutlined /> Valider
            </a-menu-item>
            <a-menu-item v-if="canDelete" danger @click="$emit('delete')">
              <DeleteOutlined /> Supprimer
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </template>

    <a-typography-paragraph
        :ellipsis="{ rows: 2 }"
        :content="task.description || 'Pas de description'"
        class="mb-3 text-gray-500 text-sm leading-relaxed"
    />

    <a-space direction="vertical" style="width: 100%; margin-top: 8px" :size="4">
      <div v-if="task.deadline" class="flex items-center gap-1.5 text-xs text-gray-500 py-1">
        <CalendarOutlined />
        <span :class="{ 'text-red-500 font-medium': isOverdue }">
          {{ formattedDeadline }}
        </span>
        <a-tag v-if="isOverdue" color="red" size="small">En retard</a-tag>
      </div>

      <div v-if="task.assignedTo && task.assignedTo.length > 0" class="flex items-center gap-1.5 text-xs text-gray-500 py-1">
        <UserOutlined />
        <a-avatar-group :max-count="3" size="small">
          <a-avatar
              v-for="userId in task.assignedTo"
              :key="userId"
              :src="getUserAvatar(userId)"
              :alt="getUserName(userId)"
          >
            {{ getUserInitials(userId) }}
          </a-avatar>
        </a-avatar-group>
      </div>

      <div
        v-if="task.comments && task.comments.length > 0"
        class="flex items-center gap-1.5 text-xs text-gray-500 py-1.5 px-2.5 -mx-2.5 rounded-md cursor-pointer transition-colors hover:bg-blue-50 hover:text-blue-500"
        @click="$emit('comment')"
      >
        <CommentOutlined />
        <span>{{ task.comments.length }} commentaire(s)</span>
      </div>

      <div v-if="isAssignedToCurrentUser && task.status !== TASK_STATUS.NOT_VALIDATED" class="flex justify-center w-full mt-2 pt-2 border-t border-gray-100">
        <a-button
            v-if="!isCompleted"
            type="primary"
            size="small"
            class="min-w-[120px] font-semibold px-4 h-auto text-xs rounded-md shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-br from-indigo-500 to-indigo-600 border-none"
            @click="$emit('toggle-complete')"
        >
          <span class="flex items-center justify-center gap-1.5 w-full">
            <CheckOutlined /> Terminer
          </span>
        </a-button>
        <a-button
            v-else
            size="small"
            class="min-w-[120px] font-semibold px-4 h-auto text-xs rounded-md bg-white border border-gray-300 text-gray-600 hover:border-indigo-500 hover:text-indigo-500 hover:-translate-y-0.5 transition-all duration-300"
            @click="$emit('toggle-complete')"
        >
          <span class="flex items-center justify-center gap-1.5 w-full">
            <CloseOutlined /> Rouvrir
          </span>
        </a-button>
      </div>
    </a-space>
  </a-card>
</template>

<script setup>
import { computed } from 'vue'
import {
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  CommentOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  UserAddOutlined
} from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { TASK_STATUS } from '@/stores/tasks.js'

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  canEdit: {
    type: Boolean,
    default: false
  },
  canDelete: {
    type: Boolean,
    default: false
  },
  canValidate: {
    type: Boolean,
    default: false
  },
  canAssign: {
    type: Boolean,
    default: false
  },
  users: {
    type: Array,
    default: () => []
  }
})

defineEmits(['edit', 'delete', 'comment', 'toggle-complete', 'validate', 'assign'])

const authStore = useAuthStore()

const statusColor = computed(() => {
  const colors = {
    [TASK_STATUS.NOT_VALIDATED]: 'orange',
    [TASK_STATUS.VALIDATED]: 'green',
    [TASK_STATUS.COMPLETED]: 'blue'
  }
  return colors[props.task.status] || 'default'
})

const statusLabel = computed(() => {
  const labels = {
    [TASK_STATUS.NOT_VALIDATED]: 'Non validé',
    [TASK_STATUS.VALIDATED]: 'Validé',
    [TASK_STATUS.COMPLETED]: 'Terminé'
  }
  return labels[props.task.status] || props.task.status
})

const cardClass = computed(() => {
  if (props.task.status === TASK_STATUS.COMPLETED) return 'opacity-70 bg-green-50 border-green-500'
  if (isOverdue.value) return 'border-red-400 bg-red-50'
  return ''
})

const formattedDeadline = computed(() => {
  if (!props.task.deadline) return ''
  return new Date(props.task.deadline).toLocaleDateString('fr-FR')
})

const isOverdue = computed(() => {
  if (!props.task.deadline) return false
  if (props.task.status === TASK_STATUS.COMPLETED) return false
  return new Date(props.task.deadline) < new Date()
})

const isCompleted = computed(() => {
  return props.task.status === TASK_STATUS.COMPLETED
})

const isAssignedToCurrentUser = computed(() => {
  if (!authStore.currentUser) return false
  return props.task.assignedTo?.includes(authStore.currentUser.id)
})

function getUserName(userId) {
  const user = props.users.find(u => u.id === userId)
  return user?.name || 'Unknown'
}

function getUserAvatar(userId) {
  const user = props.users.find(u => u.id === userId)
  return user?.avatar || null
}

function getUserInitials(userId) {
  const name = getUserName(userId)
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
</script>

<style scoped>
@reference "../../index.css";

:deep(.ant-card-head) {
  @apply px-4 py-3 border-b border-gray-100 bg-gray-50;
}

:deep(.ant-card-body) {
  @apply p-4;
}
</style>
