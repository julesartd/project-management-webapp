// File: `src/stores/projects.js`
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth.js'

export const useProjectsStore = defineStore('projects', () => {
    const authStore = useAuthStore()

    const raw = JSON.parse(localStorage.getItem('projects')) || []
    const projects = ref(raw)

    // helper id generator
    function generateId() {
        return (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
            ? crypto.randomUUID()
            : Date.now().toString()
    }

    // seed default projects if none exist
    function seedDefaultProjects() {
        if (projects.value.length > 0) return

        const currentUserId = authStore.currentUser?.id || null
        const sampleProjects = [
            {
                id: generateId(),
                name: 'Website Redesign',
                description: 'Refactor frontend, update styles and improve accessibility.',
                deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(), // +14 days
                managers: currentUserId ? [currentUserId] : [],
                tasks: [
                    { id: generateId(), title: 'Design mockups', status: 'completed', assignedTo: currentUserId },
                    { id: generateId(), title: 'Implement layout', status: 'in_progress', assignedTo: currentUserId }
                ],
                createdAt: new Date().toISOString()
            },
            {
                id: generateId(),
                name: 'Mobile App MVP',
                description: 'Build core features for the mobile MVP.',
                deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // +30 days
                managers: currentUserId ? [currentUserId] : [],
                tasks: [
                    { id: generateId(), title: 'Auth flow', status: 'in_progress', assignedTo: currentUserId },
                    { id: generateId(), title: 'Push notifications', status: 'todo', assignedTo: null }
                ],
                createdAt: new Date().toISOString()
            },
            {
                id: generateId(),
                name: 'Internal Tools Cleanup',
                description: 'Improve CI, linting and developer experience.',
                deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // +7 days
                managers: currentUserId ? [currentUserId] : [],
                tasks: [
                    { id: generateId(), title: 'Add pre-commit hooks', status: 'todo', assignedTo: null }
                ],
                createdAt: new Date().toISOString()
            }
        ]

        projects.value.push(...sampleProjects)
        saveToStorage()
    }

    const userProjects = computed(() => {
        if (!authStore.currentUser) return []
        if (authStore.hasRole('manager')) return projects.value
        if (authStore.hasRole('developer')) {
            return projects.value.filter(project =>
                project.tasks?.some(task => task.assignedTo === authStore.currentUser.id)
            )
        }
        return []
    })

    const managedProjects = computed(() => {
        if (!authStore.currentUser) return []
        return projects.value.filter(p => p.managers?.includes(authStore.currentUser.id))
    })

    function createProject(projectData) {
        const id = generateId()

        const newProject = {
            id,
            name: projectData.name,
            description: projectData.description,
            deadline: projectData.deadline,
            managers: [authStore.currentUser?.id].filter(Boolean),
            tasks: [],
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
        const project = projects.value.find(p => p.id === projectId)
        if (!project?.tasks || project.tasks.length === 0) return 0
        const completed = project.tasks.filter(t => t.status === 'completed').length
        return Math.round((completed / project.tasks.length) * 100)
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

    seedDefaultProjects()

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
