<!-- vue
File: `src/components/projects/ProjectDashboard.vue`
-->
<template>
  <div class="project-dashboard">
    <a-page-header
        title="Gestion des Projets"
        :sub-title="`${userProjects.length} projet(s)`"
    >
      <template #extra>
        <ActionButton
            v-if="hasRole('manager')"
            variant="purple"
            :icon="PlusOutlined"
            @click="showCreateModal"
        >
          Nouveau Projet
        </ActionButton>
      </template>
    </a-page-header>

    <ProjectList
        :projects="userProjects"
        @edit="handleEdit"
        @delete="handleDelete"
        @view="handleView"
    />

    <ProjectModalForm
        v-model:open="modalVisible"
        :project="selectedProject"
        :mode="modalMode"
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { useProjectsStore } from '@/stores/projects'
import { useAuthStore } from '@/stores/auth'
import ProjectList from './ProjectList.vue'
import ProjectModalForm from './ProjectModalForm.vue'
import ProjectDeleteModal from './ProjectDeleteModal.vue'
import ActionButton from '@/components/common/ActionButton.vue'

const router = useRouter()
const projectsStore = useProjectsStore()
const authStore = useAuthStore()

const { userProjects, createProject, updateProject, deleteProject } = projectsStore
const { hasRole } = authStore

const modalVisible = ref(false)
const modalMode = ref('create')
const selectedProject = ref(null)
const deleteModalVisible = ref(false)
const projectToDelete = ref(null)

function showCreateModal() {
  modalMode.value = 'create'
  selectedProject.value = null
  modalVisible.value = true
}

function handleEdit(project) {
  modalMode.value = 'edit'
  selectedProject.value = { ...project }
  modalVisible.value = true
}

function handleDelete(project) {
  projectToDelete.value = project
  deleteModalVisible.value = true
}

function handleView(project) {
  // try common id fields, then fallback to find the project in the store
  const id = project?.id ?? project?._id ??
      (userProjects || []).find(p => p === project || (p.name === project.name && p.deadline === project.deadline))?.id

  if (!id) {
    message.error('Cannot open project details: missing project id')
    console.warn('Missing project id for', project)
    return
  }

  router.push({ name: 'ProjectDetails', params: { id } })
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
    message.error(error.message || 'Error')
  }
}

async function confirmDelete() {
  try {
    await deleteProject(projectToDelete.value.id)
    message.success('Projet supprimé avec succès')
    deleteModalVisible.value = false
  } catch (error) {
    message.error(error.message || 'Error')
  }
}
</script>

<style scoped>
.project-dashboard {
  padding: 24px;
}
</style>
