// File: src/stores/tasks.js
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

    function createTask(projectId, taskData = {}) {
        const newTask = {
            id: generateId(),
            projectId: String(projectId),
            title: taskData.title || 'Untitled task',
            description: taskData.description || '',
            status: taskData.status || 'non_validé',
            assignedTo: taskData.assignedTo ?? null,
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

    function assignTask(taskId, userId) {
        return updateTask(taskId, { assignedTo: userId })
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

    return {
        tasks,
        createTask,
        updateTask,
        deleteTask,
        assignTask,
        addComment,
        toggleComplete,
        getTasksByProject,
        getTask,
        tasksCountByProject
    }
})

/* Minimal integration snippet for src/stores/projects.js:

import { useTasksStore } from '@/stores/tasks'

// inside setup of projects store:
const tasksStore = useTasksStore()

// replace any direct access to project.tasks with:
// const projectTasks = () => tasksStore.getTasksByProject(projectId)
// and use tasksStore.createTask / updateTask / deleteTask instead of project-local functions

// Example: computing userProjects for developers:
const userProjects = computed(() => {
  if (!authStore.currentUser) return []
  if (authStore.hasRole('manager')) return projects.value
  if (authStore.hasRole('developer')) {
    return projects.value.filter(project =>
      tasksStore.getTasksByProject(project.id).some(task =>
        String(task.assignedTo) === String(authStore.currentUser.id)
      )
    )
  }
  return []
})
*/
