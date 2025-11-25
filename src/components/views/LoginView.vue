<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const isRegistering = ref(false)
const error = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  roles: ['developer'] // Par défaut, on coche développeur
})

const toggleMode = () => {
  isRegistering.value = !isRegistering.value
  error.value = ''
  form.name = ''
  form.email = ''
  form.password = ''
  form.roles = ['developer']
}

const handleSubmit = () => {
  error.value = ''
  if (isRegistering.value && form.roles.length === 0) {
    error.value = "Vous devez sélectionner au moins un rôle."
    return
  }

  try {
    if (isRegistering.value) {
      authStore.register({ ...form, roles: [...form.roles] })
    } else {
      authStore.login(form.email, form.password)
    }
    router.push('/')
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-200">

      <h1 class="text-2xl font-bold text-center mb-6 text-gray-800">
        {{ isRegistering ? 'Créer un compte' : 'Connexion' }}
      </h1>

      <form @submit.prevent="handleSubmit" class="space-y-4">

        <div v-if="isRegistering" class="space-y-4">
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Nom complet</label>
            <input v-model="form.name" type="text" required class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500" placeholder="Jean Dupont"/>
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Rôles</label>
            <div class="flex gap-4">
              <label class="inline-flex items-center cursor-pointer">
                <input type="checkbox" value="developer" v-model="form.roles" class="form-checkbox h-5 w-5 text-green-600">
                <span class="ml-2 text-gray-700">Développeur</span>
              </label>
              <label class="inline-flex items-center cursor-pointer">
                <input type="checkbox" value="manager" v-model="form.roles" class="form-checkbox h-5 w-5 text-green-600">
                <span class="ml-2 text-gray-700">Manager</span>
              </label>
            </div>
            <p class="text-xs text-gray-500 mt-1">Vous pouvez cumuler les deux rôles.</p>
          </div>
        </div>

        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input v-model="form.email" type="email" required class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500" />
        </div>

        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2">Mot de passe</label>
          <input v-model="form.password" type="password" required class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500" />
        </div>

        <p v-if="error" class="text-red-500 text-sm text-center font-medium">{{ error }}</p>

        <a-button type="primary">
          {{ isRegistering ? "S'inscrire" : "Se connecter" }}
        </a-button>
      </form>

      <div class="mt-6 text-center text-sm">
        <a href="#" @click.prevent="toggleMode" class="text-green-600 hover:underline font-semibold">
          {{ isRegistering ? "J'ai déjà un compte" : "Créer un nouveau compte" }}
        </a>
      </div>
    </div>
  </div>
</template>