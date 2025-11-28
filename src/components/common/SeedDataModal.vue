<template>
  <a-modal
    :open="open"
    title="Données générées avec succès !"
    :maskClosable="false"
    :closable="false"
    :footer="null"
    centered
    @update:open="emit('update:open', $event)"
  >
    <div class="text-center mb-6">
      <CheckCircleOutlined class="text-5xl text-green-500 mb-2" />
      <p class="text-gray-600">
        La base de données locale a été repeuplée.<br>
        Voici les comptes principaux disponibles :
      </p>
    </div>

    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-60 overflow-y-auto mb-6">
      <div v-for="(user, index) in credentials" :key="index" class="mb-4 last:mb-0 border-b last:border-0 pb-3 last:pb-0 border-gray-200">
        <div class="flex items-center justify-between mb-1">
          <span class="font-bold text-gray-800">{{ user.name }}</span>
          <a-tag :color="user.roles.includes('manager') ? 'purple' : 'blue'">
            {{ user.roles.join(' & ') }}
          </a-tag>
        </div>
        <div class="text-sm text-gray-600 font-mono bg-white p-2 rounded border">
          <div>Email: <span class="text-blue-600 select-all">{{ user.email }}</span></div>
          <div>Pass: <span class="text-red-500 select-all">{{ user.password }}</span></div>
        </div>
      </div>
    </div>

    <div class="flex gap-3">
      <a-button @click="downloadCredentials" block class="flex items-center justify-center">
        <DownloadOutlined /> Télécharger .md
      </a-button>
      <a-button type="primary" @click="handleClose" block>
        Fermer & Recharger
      </a-button>
    </div>
  </a-modal>
</template>

<script setup>
import { DownloadOutlined, CheckCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  credentials: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:open', 'close'])

const downloadCredentials = () => {
  let content = "# 🔐 Identifiants de Test - Mock Data\n\n"
  content += `Généré le : ${new Date().toLocaleString()}\n\n`
  content += "---\n\n"

  props.credentials.forEach(user => {
    content += `### 👤 ${user.name} (${user.roles.join(', ')})\n`
    content += `- **Email:** ${user.email}\n`
    content += `- **Password:** ${user.password}\n`
    content += "\n"
  })

  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'identifiants_test.md'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  message.success('Fichier téléchargé !')
}

const handleClose = () => {
  emit('update:open', false)
  emit('close')
}
</script>
