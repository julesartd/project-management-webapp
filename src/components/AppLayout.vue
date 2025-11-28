<script setup>
import { useAuthStore } from '@/stores/auth.js'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons-vue'

const authStore = useAuthStore()
const user = authStore.currentUser

const roleColors = {
  manager: 'purple',
  developer: 'blue'
}
</script>

<template>
  <a-layout class="min-h-screen bg-transparent">
    <a-layout-header class="fixed w-full z-50 px-6 h-16 flex justify-between items-center backdrop-blur-md !bg-white/90 border-b border-indigo-500/10 shadow-sm transition-all duration-300">
      <div class="flex items-center">
        <h2 class="m-0 flex items-center">
          <router-link to="/" class="text-xl font-extrabold tracking-tight inline-flex items-center h-16 bg-clip-text text-transparent bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:scale-105 transition-transform duration-300">
            Gestion Projet
          </router-link>
        </h2>
      </div>

      <div class="flex items-center gap-4">
        <div class="hidden md:flex gap-2">
          <a-tag v-for="role in user?.roles" :key="role" :color="roleColors[role] || 'default'" class="uppercase font-bold rounded-lg px-3 py-1 shadow-sm border-none">
            {{ role }}
          </a-tag>
        </div>

        <a-divider type="vertical" class="hidden md:block h-6 bg-gray-300" />

        <div class="flex items-center gap-3 cursor-default group">
          <a-avatar :src="user?.avatar" class="bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center border-2 border-white shadow-md transition-transform duration-300 group-hover:scale-110">
            <template #icon v-if="!user?.avatar"><UserOutlined class="text-white" /></template>
          </a-avatar>
          <span class="font-semibold text-gray-700 hidden sm:block">{{ user?.name }}</span>
        </div>

        <a-button type="text" danger @click="authStore.logout()" class="flex items-center hover:bg-red-50 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5">
          <template #icon><LogoutOutlined /></template>
          <span class="hidden sm:inline">Déconnexion</span>
        </a-button>
      </div>
    </a-layout-header>

    <a-layout-content class="pt-24 px-6 md:px-10 pb-6 min-h-[calc(100vh-64px)]">
      <slot />
    </a-layout-content>

    <a-layout-footer class="text-center py-6 text-sm text-gray-500 font-medium bg-white/80 backdrop-blur-md border-t border-indigo-500/10">
      <div class="flex items-center justify-center gap-2 flex-wrap">
        <span>Réalisé par Jules, Kilian, Zakaria et Bastien</span>
        <span class="hidden sm:inline">•</span>
        <span>VueJs & Ant Design</span>
      </div>
    </a-layout-footer>
  </a-layout>
</template>

