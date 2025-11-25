<template>
  <div class="project-dashboard">
    <a-page-header
        title="Gestion des Projets"
        :sub-title="`${userProjects.length} projet(s)`"
    >
      <template #extra>
        <a-button
            v-if="hasRole('manager')"
            type="primary"
            @click="showCreateModal"
        >
          <template #icon>
            <PlusOutlined />
          </template>
          Nouveau Projet
        </a-button>
      </template>
    </a-page-header>

    <ProjectList
        :projects="userProjects"
        @edit="handleEdit"
        @delete="handleDelete"
        @view="handleView"
    />

    <ProjectModal
        v-model:visible="modalVisible"
        :project="selectedProject"
        :mode="modalMode"
        @submit="handleSubmit"
    />

    <ProjectDeleteModal
        v-model:visible="deleteModalVisible"
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
import ProjectModal from './ProjectModal.vue'
import ProjectDeleteModal from './ProjectDeleteModal.vue'

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
  router.push({ name: 'ProjectDetails', params: { id: project.id } })
}

async function handleSubmit(formData) {
  try {
    if (modalMode.value === 'create') {
      await createProject(formData)
      message.success('Projet créé avec succès')
    } else {
      await updateProject(selectedProject.value.id, formData)
      message.success('Projet modifié avec succès')
    }
    modalVisible.value = false
  } catch (error) {
    message.error(error.message)
  }
}

async function confirmDelete() {
  try {
    await deleteProject(projectToDelete.value.id)
    message.success('Projet supprimé avec succès')
    deleteModalVisible.value = false
  } catch (error) {
    message.error(error.message)
  }
}
</script>

<style scoped>
.project-dashboard {
  padding: 24px;
}
</style>
