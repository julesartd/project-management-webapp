<template>
  <a-card hoverable class="project-card" @click="$emit('view')">
    <template #title>
      <a-typography-text strong>{{ project.name }}</a-typography-text>
    </template>

    <template #extra>
      <a-dropdown v-if="canManage" @click.stop>
        <a-button type="text" size="small">
          <MoreOutlined />
        </a-button>
        <template #overlay>
          <a-menu>
            <a-menu-item @click.stop="$emit('edit')">
              <EditOutlined /> Modifier
            </a-menu-item>
            <a-menu-item danger @click.stop="$emit('delete')">
              <DeleteOutlined /> Supprimer
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </template>

    <a-typography-paragraph :ellipsis="{ rows: 2 }" :content="project.description" class="project-description" />

    <a-space direction="vertical" style="width: 100%">
      <div>
        <CalendarOutlined />
        <span class="ml-2">
          Échéance : {{ formattedDeadline }}
        </span>
      </div>

      <a-progress
          :percent="progress"
          :status="status"
          :show-info="true"
          :format="() => `${progress}%`"
          size="small"
      />

      <a-space>
        <a-tag color="blue">
          {{ taskCount }} tâche(s)
        </a-tag>
        <a-tag v-if="isOverdue" color="red">
          En retard
        </a-tag>
        <a-tag v-else-if="isAtRisk" color="orange">
          À risque
        </a-tag>
      </a-space>
    </a-space>
  </a-card>
</template>

<script setup>
import { computed } from 'vue'
import {
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined
} from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore } from '@/stores/tasks'

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'delete', 'view'])

const authStore = useAuthStore()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()

const canManage = computed(() => {
  return authStore.hasRole('manager') &&
      props.project.managers?.includes(authStore.currentUser.id)
})

const formattedDeadline = computed(() =>
    new Date(props.project.deadline).toLocaleDateString('fr-FR')
)

const taskCount = computed(() =>
    tasksStore.getTasksByProject(props.project.id).length
)

const progress = computed(() => {
  const prog = projectsStore.getProjectProgress(props.project.id)
  return prog ?? 0
})

const status = computed(() => {
  const stat = projectsStore.getProjectStatus(props.project.id)
  return stat || 'normal'
})

const isOverdue = computed(() =>
    projectsStore.isProjectOverdue(props.project.id)
)

const isAtRisk = computed(() =>
    projectsStore.isProjectAtRisk(props.project.id)
)
</script>

<style scoped>
.project-card {
  cursor: pointer;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: white;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.project-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: height 0.3s ease;
}

.project-card:hover::before {
  height: 6px;
}

.project-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.25);
}

.project-card :deep(.ant-card-head) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
}

.project-card :deep(.ant-card-head-title) {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
}

.project-card :deep(.ant-card-body) {
  padding: 20px;
}

.project-description {
  margin-bottom: 16px;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  line-height: 1.6;
  min-height: 44px;
}

.ml-2 {
  margin-left: 8px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.project-card :deep(.ant-progress) {
  margin: 12px 0;
}

.project-card :deep(.ant-progress-inner) {
  background: rgba(102, 126, 234, 0.1);
  border-radius: 10px;
}

.project-card :deep(.ant-progress-bg) {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%) !important;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.project-card :deep(.ant-tag) {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 6px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.project-card :deep(.ant-space-item) {
  display: flex;
  align-items: center;
  gap: 6px;
}

.project-card :deep(.anticon) {
  color: #667eea;
  font-size: 16px;
}

/* Dropdown styling */
.project-card :deep(.ant-dropdown-trigger) {
  transition: all 0.3s ease;
  border-radius: 6px;
  padding: 4px;
}

.project-card :deep(.ant-dropdown-trigger:hover) {
  background: rgba(102, 126, 234, 0.1);
}

@media (max-width: 768px) {
  .project-card {
    border-radius: 12px;
  }

  .project-card :deep(.ant-card-head),
  .project-card :deep(.ant-card-body) {
    padding: 16px;
  }

  .project-description {
    font-size: 13px;
    min-height: 40px;
  }
}
</style>
