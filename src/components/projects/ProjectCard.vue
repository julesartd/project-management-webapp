<template>
  <a-card hoverable class="group relative rounded-2xl overflow-hidden bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border-none shadow-sm" @click="$emit('view')">
    <!-- Top Gradient Border -->
    <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#667eea] to-[#764ba2] transition-all duration-300 group-hover:h-1.5"></div>

    <template #title>
      <a-typography-text strong class="text-lg font-semibold text-gray-900">{{ project.name }}</a-typography-text>
    </template>

    <template #extra>
      <a-dropdown v-if="canManage" @click.stop>
        <a-button type="text" size="small" class="hover:bg-indigo-50 rounded-md transition-colors">
          <MoreOutlined class="text-indigo-500 text-lg" />
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

    <div class="mb-4 text-gray-500 text-sm leading-relaxed min-h-[44px] line-clamp-2">
      {{ project.description }}
    </div>

    <a-space direction="vertical" class="w-full">
      <div class="flex items-center text-gray-500 font-medium text-sm">
        <CalendarOutlined class="text-indigo-500 mr-2" />
        <span>Échéance : {{ formattedDeadline }}</span>
      </div>

      <div class="my-3">
        <a-progress
            :percent="progress"
            :status="status"
            :show-info="true"
            :format="() => `${progress}%`"
            size="small"
            :stroke-color="{ '0%': '#667eea', '100%': '#764ba2' }"
            class="mb-0"
        />
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <a-tag color="blue" class="rounded-md px-2.5 py-0.5 font-semibold shadow-sm border-none">
          {{ taskCount }} tâche(s)
        </a-tag>
        <a-tag v-if="isOverdue" color="red" class="rounded-md px-2.5 py-0.5 font-semibold shadow-sm border-none">
          En retard
        </a-tag>
        <a-tag v-else-if="isAtRisk" color="orange" class="rounded-md px-2.5 py-0.5 font-semibold shadow-sm border-none">
          À risque
        </a-tag>
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

