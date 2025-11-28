<template>
  <div class="min-h-screen p-3 md:p-6">
    <a-card class="w-full min-h-[80vh] mx-auto rounded-2xl md:rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl border border-indigo-500/10 overflow-hidden" :bordered="false">
      <div class="relative mb-0 after:content-[''] after:absolute after:-bottom-5 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-[#667eea] after:to-[#764ba2] after:rounded-sm">
        <div class="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 md:gap-6">
          <div class="flex-1">
            <h1 class="text-xl md:text-2xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2 leading-tight tracking-tight">Gestion des Projets</h1>
            <p class="text-sm md:text-base text-gray-500 font-medium m-0">{{ projectsSubtitle }}</p>
          </div>
          <ActionButton
              v-if="hasRole('manager')"
              variant="purple"
              :icon="PlusOutlined"
              @click="showCreateModal"
          >
            Nouveau Projet
          </ActionButton>
        </div>
      </div>

      <a-divider class="my-6 border-indigo-500/10"/>

      <ProjectFilters
          v-model="filters"
          @filter="handleFilter"
      />

      <a-divider class="my-6 border-indigo-500/10"/>

      <div class="m-0">
        <ProjectList
            :projects="filteredProjects"
            @edit="handleEdit"
            @delete="handleDelete"
            @view="handleView"
        />
      </div>
    </a-card>

    <ProjectModalForm
        v-model:open="modalVisible"
        :project="selectedProject"
        :mode="modalMode"
        :users="allUsers"
        @submit="handleSubmit"
    />

    <ProjectDeleteModal
        v-model:open="deleteModalVisible"
        :project="projectToDelete"
        @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import {ref, computed} from 'vue'
import {useRouter} from 'vue-router'
import {message} from 'ant-design-vue'
import {PlusOutlined} from '@ant-design/icons-vue'
import {useProjectsStore} from '@/stores/projects'
import {useAuthStore} from '@/stores/auth'
import {useProjectFilters} from '@/composables/useProjectFilters'
import ProjectList from './ProjectList.vue'
import ProjectModalForm from './ProjectModalForm.vue'
import ProjectDeleteModal from './ProjectDeleteModal.vue'
import ProjectFilters from './ProjectFilters.vue'
import ActionButton from '@/components/common/ActionButton.vue'

const router = useRouter()
const projectsStore = useProjectsStore()
const authStore = useAuthStore()

const {createProject, updateProject, deleteProject} = projectsStore
const {hasRole} = authStore

const userProjectsComputed = computed(() => projectsStore.userProjects || [])
const allUsers = computed(() => {
  return (authStore.users || []).filter(user => user.roles?.includes('manager'))
})

const {filters, filteredProjects, updateFilters} = useProjectFilters(userProjectsComputed)

const modalVisible = ref(false)
const modalMode = ref('create')
const selectedProject = ref(null)
const deleteModalVisible = ref(false)
const projectToDelete = ref(null)

const projectsSubtitle = computed(() => {
  const total = userProjectsComputed.value.length
  const filtered = filteredProjects.value.length
  return filtered === total
      ? `${total} projet(s)`
      : `${filtered} sur ${total} projet(s)`
})

function handleFilter(newFilters) {
  updateFilters(newFilters)
}

function showCreateModal() {
  modalMode.value = 'create'
  selectedProject.value = null
  modalVisible.value = true
}

function handleEdit(project) {
  modalMode.value = 'edit'
  selectedProject.value = {...project}
  modalVisible.value = true
}

function handleDelete(project) {
  projectToDelete.value = project
  deleteModalVisible.value = true
}

function handleView(project) {
  const id = project?.id

  if (!id) {
    message.error('Impossible d\'ouvrir les détails : ID manquant')
    console.warn('Missing project id for', project)
    return
  }

  router.push({name: 'ProjectDetails', params: {id}})
}

async function handleSubmit(formData) {
  try {
    if (modalMode.value === 'create') {
      createProject(formData)
      message.success('Projet créé avec succès')
    } else {
      await updateProject(selectedProject.value.id, formData)
      message.success('Projet modifié avec succès')
    }
    modalVisible.value = false
  } catch (error) {
    message.error(error.message || 'Erreur lors de l\'opération')
  }
}

async function confirmDelete() {
  try {
    await deleteProject(projectToDelete.value.id)
    message.success('Projet supprimé avec succès')
    deleteModalVisible.value = false
  } catch (error) {
    message.error(error.message || 'Erreur lors de la suppression')
  }
}
</script>

<style scoped>
@import "../../index.css";

:deep(.ant-card-body) {
  padding: 1.5rem;
  background: linear-gradient(to bottom right, rgba(102, 126, 234, 0.02), rgba(118, 75, 162, 0.02));
}

@media (min-width: 768px) {
  :deep(.ant-card-body) {
    padding: 2.5rem;
  }
}

:deep(.ant-list) {
  background-color: transparent;
}

:deep(.ant-list-grid .ant-col) {
  margin-bottom: 1.5rem;
}

:deep(.ant-divider) {
  border-color: rgba(99, 102, 241, 0.1);
}
</style>
