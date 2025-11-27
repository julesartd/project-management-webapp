import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

function generateId() {
    return (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
        ? crypto.randomUUID()
        : Date.now().toString()
}

export const useTasksStore = defineStore('tasks', () => {
    const raw = JSON.parse(localStorage.getItem('tasks')) || []
    const tasks = ref(raw)

    function saveToStorage() {
        localStorage.setItem('tasks', JSON.stringify(tasks.value))
    }

    function createTask(projectId, taskData = {}, createdBy = null) {
        const newTask = {
            id: generateId(),
            projectId: String(projectId),
            title: taskData.title || 'Untitled task',
            description: taskData.description || '',
            status: taskData.status || 'non_validé',
            assignedTo: taskData.assignedTo || [],
            deadline: taskData.deadline || null,
            createdBy: createdBy,
            validatedBy: null, 
            validatedAt: null,
            comments: taskData.comments || [],
            createdAt: new Date().toISOString(),
            updatedAt: null
        }
        tasks.value.push(newTask)
        saveToStorage()
        return newTask
    }

    function updateTask(taskId, patch = {}) {
        const idx = tasks.value.findIndex(t => String(t.id) === String(taskId))
        if (idx === -1) throw new Error('Task not found')
        tasks.value[idx] = { ...tasks.value[idx], ...patch, updatedAt: new Date().toISOString() }
        saveToStorage()
        return tasks.value[idx]
    }

    function deleteTask(taskId) {
        const idx = tasks.value.findIndex(t => String(t.id) === String(taskId))
        if (idx === -1) throw new Error('Task not found')
        tasks.value.splice(idx, 1)
        saveToStorage()
    }

    function assignUser(taskId, userId) {
        const task = tasks.value.find(t => String(t.id) === String(taskId))
        if (!task) throw new Error('Task not found')
        if (!task.assignedTo.includes(userId)) {
            task.assignedTo.push(userId)
            task.updatedAt = new Date().toISOString()
            saveToStorage()
        }
        return task
    }

    function unassignUser(taskId, userId) {
        const task = tasks.value.find(t => String(t.id) === String(taskId))
        if (!task) throw new Error('Task not found')
        task.assignedTo = task.assignedTo.filter(id => id !== userId)
        task.updatedAt = new Date().toISOString()
        saveToStorage()
        return task
    }

    function validateTask(taskId, managerId) {
        const task = tasks.value.find(t => String(t.id) === String(taskId))
        if (!task) throw new Error('Task not found')
        if (task.status !== 'non_validé') {
            throw new Error('Only non-validated tasks can be validated')
        }
        task.status = 'validé'
        task.validatedBy = managerId
        task.validatedAt = new Date().toISOString()
        task.updatedAt = new Date().toISOString()
        saveToStorage()
        return task
    }

    function addComment(taskId, comment) {
        const task = tasks.value.find(t => String(t.id) === String(taskId))
        if (!task) throw new Error('Task not found')
        task.comments = task.comments || []
        task.comments.push({
            id: generateId(),
            text: comment.text || '',
            authorId: comment.authorId || null,
            createdAt: new Date().toISOString()
        })
        task.updatedAt = new Date().toISOString()
        saveToStorage()
        return task
    }

    function toggleComplete(taskId) {
        const task = tasks.value.find(t => String(t.id) === String(taskId))
        if (!task) throw new Error('Task not found')
        task.status = task.status === 'completed' ? 'non_validé' : 'completed'
        task.updatedAt = new Date().toISOString()
        saveToStorage()
        return task
    }

    function getTasksByProject(projectId) {
        return tasks.value.filter(t => String(t.projectId) === String(projectId))
    }

    function getTask(taskId) {
        return tasks.value.find(t => String(t.id) === String(taskId)) || null
    }

    const tasksCountByProject = computed(() => {
        const map = {}
        for (const t of tasks.value) {
            map[t.projectId] = (map[t.projectId] || 0) + 1
        }
        return map
    })

    function getTasksAssignedTo(userId) {
        return tasks.value.filter(t => t.assignedTo.includes(userId))
    }

    function getNonValidatedTasks(projectId) {
        return tasks.value.filter(t =>
            String(t.projectId) === String(projectId) &&
            t.status === 'non_validé'
        )
    }

    function hasTaskInProject(userId, projectId) {
        return tasks.value.some(t =>
            String(t.projectId) === String(projectId) &&
            t.assignedTo.includes(userId)
        )
    }

    return {
        tasks,
        createTask,
        updateTask,
        deleteTask,
        assignUser,
        unassignUser,
        validateTask,
        addComment,
        toggleComplete,
        getTasksByProject,
        getTask,
        getTasksAssignedTo,
        getNonValidatedTasks,
        hasTaskInProject,
        tasksCountByProject
    }
})
