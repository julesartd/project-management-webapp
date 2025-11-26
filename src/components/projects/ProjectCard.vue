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
          size="small"
      />

      <a-space>
        <a-tag color="blue">
          {{ project.tasks?.length || 0 }} tâche(s)
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

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'delete', 'view'])

const authStore = useAuthStore()
const projectsStore = useProjectsStore()

const canManage = computed(() => {
  return authStore.hasRole('manager') &&
      props.project.managers?.includes(authStore.currentUser.id)
})

const formattedDeadline = computed(() =>
    new Date(props.project.deadline).toLocaleDateString('fr-FR')
)

const progress = computed(() =>
    projectsStore.getProjectProgress(props.project.id)
)

const status = computed(() =>
    projectsStore.getProjectStatus(props.project.id)
)

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
}

.project-description {
  margin-bottom: 16px;
  color: rgba(0, 0, 0, 0.65);
}

.ml-2 {
  margin-left: 8px;
}
</style>
