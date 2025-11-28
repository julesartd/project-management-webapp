<template>
  <div class="w-full">
    <a-page-header
      class="bg-white rounded-xl shadow-sm mb-4 p-6 border border-gray-100"
      @back="$emit('back')"
      :title="project.name"
      :sub-title="project.description"
    >
      <template #extra>
        <ActionButton
          variant="primary"
          :icon="PlusOutlined"
          @click="showTaskForm"
        >
          Créer une tâche
        </ActionButton>
      </template>

      <template #footer>
        <a-tabs class="bg-white rounded-xl shadow-sm border border-gray-100">
          <a-tab-pane key="assigned" tab="Mes tâches">
            <div class="p-6">
              <TaskList
                :tasks="assignedTasks"
                :can-edit="false"
                :can-delete="false"
                :can-validate="false"
                :users="allUsers"
                :show-filters="true"
                empty-text="Aucune tâche ne vous est affectée"
                @comment="handleComment"
                @toggle-complete="handleToggleComplete"
              />
            </div>
          </a-tab-pane>

          <a-tab-pane key="all" tab="Toutes les tâches">
            <div class="p-6">
              <TaskList
                :tasks="otherTasks"
                :can-edit="false"
                :can-delete="false"
                :can-validate="false"
                :users="allUsers"
                :show-filters="true"
                empty-text="Aucune autre tâche dans ce projet"
                @comment="handleComment"
                @toggle-complete="handleToggleComplete"
              />
            </div>
          </a-tab-pane>
        </a-tabs>
      </template>
    </a-page-header>

    <TaskForm
      v-model:open="taskFormVisible"
      :mode="taskFormMode"
      :task="selectedTask"
      :users="allUsers"
      :can-assign-users="false"
      @submit="handleTaskSubmit"
    />

    <a-modal
      v-model:open="commentsVisible"
      :title="`Commentaires - ${selectedTask?.title || ''}`"
      width="700px"
      :footer="null"
    >
      <TaskComments
        v-if="selectedTask"
        :task="selectedTask"
        @add-comment="handleAddComment"
      />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore, TASK_STATUS } from '@/stores/tasks'
import ActionButton from '@/components/common/ActionButton.vue'
import TaskList from "@/components/tasks/TaskList.vue";
import TaskForm from "@/components/tasks/TaskForm.vue";
import TaskComments from "@/components/tasks/TaskComments.vue";

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  allUsers: {
    type: Array,
    default: () => []
  }
})

defineEmits(['back'])

const authStore = useAuthStore()
const tasksStore = useTasksStore()

const taskFormVisible = ref(false)
const taskFormMode = ref('create')
const selectedTaskId = ref(null)
const selectedTask = computed(() => {
  if (!selectedTaskId.value) return null
  return tasksStore.getTask(selectedTaskId.value)
})
const commentsVisible = ref(false)


const projectTasks = computed(() => {
  return tasksStore.getTasksByProject(props.project.id)
})

const assignedTasks = computed(() => {
  return projectTasks.value.filter(task =>
    task.assignedTo?.includes(authStore.currentUser?.id)
  )
})

const otherTasks = computed(() => {
  return projectTasks.value.filter(task =>
    !task.assignedTo?.includes(authStore.currentUser?.id)
  )
})

function showTaskForm() {
  taskFormMode.value = 'create'
  selectedTaskId.value = null
  taskFormVisible.value = true
}

function handleTaskSubmit(formData) {
  try {
    if (taskFormMode.value === 'create') {
      tasksStore.createTask(
        props.project.id,
        {
          ...formData,
          status: TASK_STATUS.NOT_VALIDATED,
          assignedTo: [authStore.currentUser.id]
        },
        authStore.currentUser.id
      )
      message.success('Tâche créée avec succès (en attente de validation)')
    }
    taskFormVisible.value = false
  } catch (error) {
    message.error(error.message || 'Erreur lors de la création de la tâche')
  }
}

function handleToggleComplete(task) {
  try {
    if (!task.assignedTo?.includes(authStore.currentUser?.id)) {
      message.warning('Vous ne pouvez marquer comme terminée que les tâches qui vous sont affectées')
      return
    }

    if (task.status === TASK_STATUS.NOT_VALIDATED) {
      message.warning('Cette tâche doit d\'abord être validée par un manager')
      return
    }

    tasksStore.toggleComplete(task.id)

    if (task.status === TASK_STATUS.COMPLETED) {
      message.success('Tâche marquée comme terminée')
    } else {
      message.success('Tâche marquée comme non terminée')
    }
  } catch (error) {
    message.error(error.message || 'Erreur')
  }
}

function handleComment(task) {
  selectedTaskId.value = task.id
  commentsVisible.value = true
}

function handleAddComment(commentData) {
  try {
    tasksStore.addComment(selectedTaskId.value, {
      text: commentData.text,
      authorId: authStore.currentUser.id
    })
    message.success('Commentaire ajouté')
  } catch (error) {
    message.error(error.message || 'Erreur lors de l\'ajout du commentaire')
  }
}
</script>

<style scoped>
@reference "../../index.css";

/* Removed custom CSS in favor of Tailwind classes in template */
:deep(.ant-page-header-heading-title) {
  @apply text-xl font-bold text-gray-900;
}

:deep(.ant-page-header-heading-sub-title) {
  @apply text-gray-500 text-sm;
}

:deep(.ant-tabs-nav) {
  @apply px-6 pt-4 mb-0 border-b border-gray-100;
}

:deep(.ant-tabs-tab) {
  @apply px-4 py-3 font-medium text-gray-600 hover:text-indigo-600 transition-colors;
}

:deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
  @apply text-indigo-600 font-semibold;
}

:deep(.ant-tabs-ink-bar) {
  @apply bg-indigo-600;
}
</style>

