import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function useUserDisplay(usersSource = null) {
    const authStore = useAuthStore()

    const users = computed(() => {
        if (usersSource && usersSource.value) {
            return usersSource.value
        }
        return authStore.users || []
    })

    function getUserById(userId) {
        if (!userId) return null
        return users.value.find(u => u.id === userId) || null
    }

    function getUserName(userId) {
        const user = getUserById(userId)
        return user?.name || 'Utilisateur inconnu'
    }

    function getUserAvatar(userId) {
        const user = getUserById(userId)
        return user?.avatar || null
    }

    function getUserInitials(userId) {
        const name = getUserName(userId)
        if (!name || name === 'Utilisateur inconnu') return '?'
        return getInitialsFromName(name)
    }

    function getInitialsFromName(name) {
        if (!name) return '?'
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return {
        users,
        getUserById,
        getUserName,
        getUserAvatar,
        getUserInitials,
        getInitialsFromName
    }
}
