<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { useRouter } from 'vue-router'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons-vue'

const authStore = useAuthStore()
const router = useRouter()

const isRegistering = ref(false)
const error = ref('')
const loading = ref(false)

const formState = reactive({
  name: '',
  email: '',
  password: '',
  roles: ['developer']
})

const roleOptions = [
  { label: 'Développeur', value: 'developer' },
  { label: 'Manager', value: 'manager' }
]

const toggleMode = () => {
  isRegistering.value = !isRegistering.value
  error.value = ''
  formState.name = ''
  formState.email = ''
  formState.password = ''
  formState.roles = ['developer']
}

const onFinish = async () => {
  error.value = ''
  loading.value = true

  if (isRegistering.value && formState.roles.length === 0) {
    error.value = "Sélectionnez au moins un rôle."
    loading.value = false
    return
  }

  try {
    // Petit délai simulé pour l'UX
    await new Promise(r => setTimeout(r, 500))

    if (isRegistering.value) {
      authStore.register({ ...formState })
    } else {
      authStore.login(formState.email, formState.password)
    }
    router.push('/')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">

    <a-card
        :title="isRegistering ? 'Créer un compte' : 'Connexion'"
        class="w-full max-w-md shadow-lg rounded-lg"
        :headStyle="{ textAlign: 'center', fontSize: '1.2rem' }"
    >

      <a-alert
          v-if="error"
          :message="error"
          type="error"
          show-icon
          class="mb-6"
      />

      <a-form
          :model="formState"
          name="auth_login"
          @finish="onFinish"
          layout="vertical"
          class="space-y-2"
      >
        <a-form-item
            v-if="isRegistering"
            label="Nom complet"
            name="name"
            :rules="[{ required: true, message: 'Veuillez entrer votre nom !' }]"
        >
          <a-input v-model:value="formState.name" placeholder="Jean Dupont" size="large">
            <template #prefix><UserOutlined class="text-gray-400" /></template>
          </a-input>
        </a-form-item>

        <a-form-item v-if="isRegistering" label="Rôles" name="roles" class="mb-2">
          <a-checkbox-group v-model:value="formState.roles" :options="roleOptions" class="w-full" />
          <div class="text-xs text-gray-500 mt-1">Cumul possible.</div>
        </a-form-item>

        <a-form-item
            label="Email"
            name="email"
            :rules="[{ required: true, type: 'email', message: 'Email invalide !' }]"
        >
          <a-input v-model:value="formState.email" placeholder="email@exemple.com" size="large">
            <template #prefix><MailOutlined class="text-gray-400" /></template>
          </a-input>
        </a-form-item>

        <a-form-item
            label="Mot de passe"
            name="password"
            :rules="[{ required: true, message: 'Mot de passe requis !' }]"
        >
          <a-input-password v-model:value="formState.password" size="large">
            <template #prefix><LockOutlined class="text-gray-400" /></template>
          </a-input-password>
        </a-form-item>

        <a-form-item class="mt-4">
          <a-button type="primary" html-type="submit" block :loading="loading" size="large" class="bg-blue-600 hover:bg-blue-500">
            {{ isRegistering ? "S'inscrire" : "Se connecter" }}
          </a-button>
        </a-form-item>
      </a-form>

      <div class="text-center mt-2">
        <a @click.prevent="toggleMode" class="text-blue-600 hover:text-blue-800 transition-colors">
          {{ isRegistering ? "J'ai déjà un compte" : "Créer un nouveau compte" }}
        </a>
      </div>
    </a-card>
  </div>
</template>