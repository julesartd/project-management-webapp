<script setup>
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
const user = authStore.currentUser
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center gap-2">
            <span class="text-xl font-bold text-gray-800">Gestion Projet</span>
            <span class="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700 uppercase font-bold">
              {{ user?.role }}
            </span>
          </div>

          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <img :src="user?.avatar" alt="Avatar" class="h-8 w-8 rounded-full" />
              <span class="text-sm font-medium text-gray-700">{{ user?.name }}</span>
            </div>
            <button
                @click="authStore.logout()"
                class="text-sm text-red-600 hover:text-red-800 font-medium transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">

      <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Tableau de bord</h1>

        <button
            v-if="user?.role === 'manager'"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium transition"
        >
          + Nouveau Projet
        </button>
      </div>

      <div class="bg-white rounded-lg shadow p-12 text-center border border-dashed border-gray-300">
        <p class="text-gray-500 text-lg">Aucun projet pour le moment.</p>
        <p class="text-sm text-gray-400 mt-2">Les projets s'afficheront ici.</p>
      </div>

    </main>
  </div>
</template>