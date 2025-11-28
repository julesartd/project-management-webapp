import { defineStore } from 'pinia'
import { ref } from 'vue'
import bcrypt from 'bcryptjs'
import router from '@/router'
import { generateId } from '@/utils/utils'

export const useAuthStore = defineStore('auth', () => {
    const currentUser = ref(JSON.parse(localStorage.getItem('currentUser')) || null)
    const users = ref(JSON.parse(localStorage.getItem('users')) || [])

    function register(userData) {
        if (users.value.find(u => u.email === userData.email)) {
            throw new Error("Cet email est déjà utilisé.")
        }
        const salt = bcrypt.genSaltSync(10)
        const hashedPassword = bcrypt.hashSync(userData.password, salt)
        const newUser = {
            id: generateId(),
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            roles: userData.roles,
            avatar: `https://ui-avatars.com/api/?name=${userData.name}&background=random`
        }
        users.value.push(newUser)
        localStorage.setItem('users', JSON.stringify(users.value))
        login(userData.email, userData.password)
    }

    function login(email, password) {
        const user = users.value.find(u => u.email === email)

        if (!user || !bcrypt.compareSync(password, user.password)) {
            throw new Error("Email ou mot de passe incorrect.")
        }

        currentUser.value = user
        localStorage.setItem('currentUser', JSON.stringify(user))
    }

    function logout() {
        try {
            currentUser.value = null
            localStorage.removeItem('currentUser')
            router.push('/login')
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error)
            currentUser.value = null
            throw new Error('Erreur lors de la déconnexion')
        }
    }


    function hasRole(role) {
        return currentUser.value?.roles.includes(role)
    }

    return { currentUser, users, register, login, logout, hasRole }
})