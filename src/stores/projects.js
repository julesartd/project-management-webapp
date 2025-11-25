import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth.js'

export const useProjectsStore = defineStore('projects', () => {
    const projects = ref(JSON.parse(localStorage.getItem('projects')) || [])
    const authStore = useAuthStore()

    const userProjects = computed(() => {
        if (!authStore.currentUser) return []

        if (authStore.hasRole('manager')) {
            return projects.value
        }

        if (authStore.hasRole('developer')) {
            return projects.value.filter(project =>
                project.tasks?.some(task =>
                    task.assignedTo === authStore.currentUser.id
                )
            )
        }

        return []
    })

    const managedProjects = computed(() => {
        if (!authStore.currentUser) return []
        return projects.value.filter(p =>
            p.managers?.includes(authStore.currentUser.id)
        )
    })

    function createProject(projectData) {
        const newProject = {
            id: Date.now().toString(),
            name: projectData.name,
            description: projectData.description,
            deadline: projectData.deadline,
            managers: [authStore.currentUser.id],
            tasks: [],
            createdAt: new Date().toISOString()
        }
        projects.value.push(newProject)
        saveToStorage()
        return newProject
    }

    function updateProject(id, projectData) {
        const index = projects.value.findIndex(p => p.id === id)
        if (index === -1) throw new Error("Projet introuvable")

        projects.value[index] = {
            ...projects.value[index],
            ...projectData,
            updatedAt: new Date().toISOString()
        }
        saveToStorage()
    }

    function deleteProject(id) {
        const index = projects.value.findIndex(p => p.id === id)
        if (index === -1) throw new Error("Projet introuvable")

        projects.value.splice(index, 1)
        saveToStorage()
    }

    function addManager(projectId, userId) {
        const project = projects.value.find(p => p.id === projectId)
        if (!project) throw new Error("Projet introuvable")

        if (!project.managers.includes(userId)) {
            project.managers.push(userId)
            saveToStorage()
        }
    }

    function removeManager(projectId, userId) {
        const project = projects.value.find(p => p.id === projectId)
        if (!project) throw new Error("Projet introuvable")

        project.managers = project.managers.filter(id => id !== userId)
        saveToStorage()
    }

    function saveToStorage() {
        localStorage.setItem('projects', JSON.stringify(projects.value))
    }

    function getProjectProgress(projectId) {
        const project = projects.value.find(p => p.id === projectId)
        if (!project?.tasks || project.tasks.length === 0) return 0
        const completed = project.tasks.filter(t => t.status === 'completed').length
        return Math.round((completed / project.tasks.length) * 100)
    }

    function isProjectOverdue(projectId) {
        const project = projects.value.find(p => p.id === projectId)
        if (!project) return false
        return new Date(project.deadline) < new Date() &&
            getProjectProgress(projectId) < 100
    }

    function isProjectAtRisk(projectId) {
        const project = projects.value.find(p => p.id === projectId)
        if (!project) return false

        const deadline = new Date(project.deadline)
        const now = new Date()
        const daysLeft = (deadline - now) / (1000 * 60 * 60 * 24)
        const progress = getProjectProgress(projectId)

        return daysLeft <= 7 && progress < 80
    }

    function getProjectStatus(projectId) {
        const progress = getProjectProgress(projectId)
        if (isProjectOverdue(projectId)) return 'exception'
        if (progress === 100) return 'success'
        if (isProjectAtRisk(projectId)) return 'active'
        return 'normal'
    }


    return {
        projects,
        userProjects,
        managedProjects,
        createProject,
        updateProject,
        deleteProject,
        addManager,
        removeManager,
        getProjectProgress,
        isProjectOverdue,
        isProjectAtRisk,
        getProjectStatus
    }
})
