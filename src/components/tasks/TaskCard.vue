<template>
  <a-card class="task-card" :class="cardClass" hoverable>
    <template #title>
      <div class="task-title">
        <a-typography-text :ellipsis="true" strong>
          {{ task.title }}
        </a-typography-text>
        <a-tag :color="statusColor" class="status-tag">
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
            <a-menu-item v-if="canValidate && task.status === 'non_validé'" @click="$emit('validate')">
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
      class="task-description"
    />

    <a-space direction="vertical" style="width: 100%; margin-top: 12px" :size="8">
      <!-- Deadline -->
      <div v-if="task.deadline" class="task-info">
        <CalendarOutlined />
        <span :class="{ 'text-danger': isOverdue }">
          {{ formattedDeadline }}
        </span>
        <a-tag v-if="isOverdue" color="red" size="small">En retard</a-tag>
      </div>

      <!-- Assigned users -->
      <div v-if="task.assignedTo && task.assignedTo.length > 0" class="task-info">
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

      <!-- Comments count -->
      <div v-if="task.comments && task.comments.length > 0" class="task-info">
        <CommentOutlined />
        <span>{{ task.comments.length }} commentaire(s)</span>
      </div>

      <!-- Actions for assigned users (Developer) -->
      <div v-if="isAssignedToCurrentUser && task.status !== 'non_validé'" class="task-actions-center">
        <a-button
          v-if="!isCompleted"
          type="primary"
          size="small"
          class="complete-button"
          @click="$emit('toggle-complete')"
        >
          <CheckOutlined /> Terminer
        </a-button>
        <a-button
          v-else
          size="small"
          class="uncomplete-button"
          @click="$emit('toggle-complete')"
        >
          <CloseOutlined /> Rouvrir
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
    'non_validé': 'orange',
    'validé': 'blue',
    'en_cours': 'cyan',
    'completed': 'green'
  }
  return colors[props.task.status] || 'default'
})

const statusLabel = computed(() => {
  const labels = {
    'non_validé': 'Non validé',
    'validé': 'Validé',
    'en_cours': 'En cours',
    'completed': 'Terminé'
  }
  return labels[props.task.status] || props.task.status
})

const cardClass = computed(() => {
  if (props.task.status === 'completed') return 'task-completed'
  if (isOverdue.value) return 'task-overdue'
  return ''
})

const formattedDeadline = computed(() => {
  if (!props.task.deadline) return ''
  return new Date(props.task.deadline).toLocaleDateString('fr-FR')
})

const isOverdue = computed(() => {
  if (!props.task.deadline || props.task.status === 'completed') return false
  return new Date(props.task.deadline) < new Date()
})

const isCompleted = computed(() => {
  return props.task.status === 'completed'
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
.task-card {
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.task-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.task-completed {
  opacity: 0.7;
  background-color: #f6ffed;
  border-color: #52c41a;
}

.task-overdue {
  border-color: #ff4d4f;
  background-color: #fff2f0;
}

.task-title {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
}

.status-tag {
  margin: 0;
}

.task-description {
  margin: 0;
  color: rgba(0, 0, 0, 0.65);
}

.task-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
}

.text-danger {
  color: #ff4d4f;
  font-weight: 500;
}

.task-actions-center {
  display: flex;
  justify-content: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.complete-button,
.uncomplete-button {
  min-width: 130px;
  font-weight: 600;
  padding: 8px 20px;
  height: auto;
  border-radius: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.complete-button {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  border: none;
  color: white;
  box-shadow: 0 2px 8px rgba(82, 196, 26, 0.3);
}

.complete-button:hover {
  background: linear-gradient(135deg, #73d13d 0%, #52c41a 100%);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.4);
  transform: translateY(-2px);
  color: white;
}

.uncomplete-button {
  background: white;
  border: 1px solid #d9d9d9;
  color: #666;
}

.uncomplete-button:hover {
  border-color: #1890ff;
  color: #1890ff;
  transform: translateY(-1px);
}
</style>
