import {defineStore} from 'pinia'
import {ref, computed} from 'vue'
import {useAuthStore} from './auth.js'
import {useTasksStore, TASK_STATUS} from './tasks.js'
import {generateId} from "@/utils/utils.js";

export const useProjectsStore = defineStore('projects', () => {
    const authStore = useAuthStore()
    const tasksStore = useTasksStore();

    const raw = JSON.parse(localStorage.getItem('projects')) || []
    const projects = ref(raw)


    const userProjects = computed(() => {
        if (!authStore.currentUser) return []
        if (authStore.hasRole('manager')) return projects.value
        if (authStore.hasRole('developer')) {
            return projects.value.filter(project =>
                tasksStore.hasTaskInProject(authStore.currentUser.id, project.id)
            )
        }
        return []
    });

    const managedProjects = computed(() => {
        if (!authStore.currentUser) return []
        return projects.value.filter(p => p.managers?.includes(authStore.currentUser.id))
    });

    function createProject(projectData) {
        const newProject = {
            id: generateId(),
            name: projectData.name,
            description: projectData.description,
            deadline: projectData.deadline,
            managers: [authStore.currentUser?.id].filter(Boolean),
            createdAt: new Date().toISOString()
        }

        projects.value.push(newProject)
        saveToStorage()
        return newProject
    }

    function updateProject(id, projectData) {
        const index = projects.value.findIndex(p => p.id === id)
        if (index === -1) throw new Error('Projet introuvable')
        projects.value[index] = {
            ...projects.value[index],
            ...projectData,
            updatedAt: new Date().toISOString()
        }
        saveToStorage()
    }

    function deleteProject(id) {
        const index = projects.value.findIndex(p => p.id === id)
        if (index === -1) throw new Error('Projet introuvable')
        projects.value.splice(index, 1)
        saveToStorage()
    }

    function addManager(projectId, userId) {
        const project = projects.value.find(p => p.id === projectId)
        if (!project) throw new Error('Projet introuvable')
        if (!project.managers.includes(userId)) {
            project.managers.push(userId)
            saveToStorage()
        }
    }

    function removeManager(projectId, userId) {
        const project = projects.value.find(p => p.id === projectId)
        if (!project) throw new Error('Projet introuvable')
        project.managers = project.managers.filter(id => id !== userId)
        saveToStorage()
    }

    function saveToStorage() {
        localStorage.setItem('projects', JSON.stringify(projects.value))
    }

    function getProjectProgress(projectId) {
        const projectTasks = tasksStore.getTasksByProject(projectId)
        if (!projectTasks || projectTasks.length === 0) return 0
        const completed = projectTasks.filter(t =>
            t.status === TASK_STATUS.COMPLETED
        ).length
        const percentage = Math.round((completed / projectTasks.length) * 100)
        return Math.max(0, Math.min(100, percentage))
    }

    function isProjectOverdue(projectId) {
        const project = projects.value.find(p => p.id === projectId)
        if (!project) return false
        return new Date(project.deadline) < new Date() && getProjectProgress(projectId) < 100
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
