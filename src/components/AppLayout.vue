// src/components/AppLayout.vue
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
  <a-layout class="app-layout min-h-screen!">
    <a-layout-header class="app-header bg-white! px-6! shadow-md z-10 flex justify-between items-center h-16 leading-normal">
      <div class="flex items-center">
        <h2 class="m-0 flex items-center">
          <router-link to="/" class="text-xl font-bold text-gray-800 tracking-tight inline-flex items-center h-16">
            Gestion Projet
          </router-link>
        </h2>
      </div>

      <div class="flex items-center gap-4">
        <div class="hidden md:flex gap-2">
          <a-tag v-for="role in user?.roles" :key="role" :color="roleColors[role] || 'default'" class="uppercase font-bold">
            {{ role }}
          </a-tag>
        </div>

        <a-divider type="vertical" class="hidden md:block h-6 bg-gray-300" />

        <div class="flex items-center gap-3 cursor-default">
          <a-avatar :src="user?.avatar" class="bg-blue-50 flex items-center justify-center border border-blue-100">
            <template #icon v-if="!user?.avatar"><UserOutlined class="text-blue-600" /></template>
          </a-avatar>
          <span class="font-medium text-gray-700 hidden sm:block">{{ user?.name }}</span>
        </div>

        <a-button type="text" danger @click="authStore.logout()" class="flex! items-center! hover:bg-red-50">
          <template #icon><LogoutOutlined /></template>
          <span class="hidden sm:inline">Déconnexion</span>
        </a-button>
      </div>
    </a-layout-header>

    <a-layout-content class="app-content p-6 md:p-10">
      <slot />
    </a-layout-content>

    <a-layout-footer class="app-footer text-center py-6 text-sm">
      <div class="footer-content">
        <span>Réalisé par Jules, Kilian, Zakaria et Bastien</span>
        <span class="mx-2">•</span>
        <span>VueJs & Ant Design</span>
      </div>
    </a-layout-footer>
  </a-layout>
</template>

<style scoped>
.app-layout {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.app-header {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08) !important;
  transition: all 0.3s ease;
}

.app-header :deep(.text-xl) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
  font-size: 22px;
  letter-spacing: -0.5px;
  transition: all 0.3s ease;
}

.app-header :deep(.text-xl:hover) {
  transform: scale(1.05);
}

.app-header :deep(.ant-tag) {
  border-radius: 8px;
  padding: 4px 12px;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: none;
}

.app-header :deep(.ant-avatar) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  border: 2px solid white;
  transition: all 0.3s ease;
}

.app-header :deep(.ant-avatar:hover) {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.app-header :deep(.font-medium) {
  font-weight: 600;
  color: #2d3748;
}

.app-header :deep(.ant-btn-text) {
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 600;
}

.app-header :deep(.ant-btn-text:hover) {
  background: rgba(255, 77, 79, 0.1) !important;
  transform: translateY(-1px);
}

.app-content {
  background: transparent;
  min-height: calc(100vh - 128px);
}

.app-footer {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  color: #718096;
  font-weight: 500;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .app-header :deep(.text-xl) {
    font-size: 18px;
  }

  .footer-content {
    font-size: 12px;
  }
}
</style>
