<template>
    <a-space direction="vertical" :size="16" style="width: 100%">
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :sm="12" :lg="6">
          <a-input
              v-model:value="localFilters.search"
              placeholder="Rechercher un projet..."
              allow-clear
              @change="emitFilters"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </a-col>

        <a-col :xs="24" :sm="12" :lg="6">
          <a-select
              v-model:value="localFilters.status"
              placeholder="Statut"
              allow-clear
              style="width: 100%"
              @change="emitFilters"
          >
            <a-select-option value="not_started">Non démarré</a-select-option>
            <a-select-option value="in_progress">En cours</a-select-option>
            <a-select-option value="completed">Terminé</a-select-option>
          </a-select>
        </a-col>

        <a-col :xs="24" :sm="12" :lg="6">
          <a-date-picker
              v-model:value="localFilters.deadlineFrom"
              placeholder="Échéance à partir de"
              style="width: 100%"
              format="DD/MM/YYYY"
              @change="emitFilters"
          />
        </a-col>

        <a-col :xs="24" :sm="12" :lg="6">
          <a-date-picker
              v-model:value="localFilters.deadlineTo"
              placeholder="Échéance jusqu'à"
              style="width: 100%"
              format="DD/MM/YYYY"
              @change="emitFilters"
          />
        </a-col>
      </a-row>

      <a-row>
        <a-col>
          <a-space>
            <a-button @click="resetFilters" size="small" class="reset-button">
              <template #icon><ClearOutlined /></template>
              Réinitialiser
            </a-button>

            <a-tag v-if="hasActiveFilters" color="blue">
              {{ activeFiltersCount }} filtre(s) actif(s)
            </a-tag>
          </a-space>
        </a-col>
      </a-row>
    </a-space>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { SearchOutlined, ClearOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      search: '',
      status: null,
      deadlineFrom: null,
      deadlineTo: null
    })
  }
})

const emit = defineEmits(['update:modelValue', 'filter'])

const localFilters = ref({ ...props.modelValue })

watch(() => props.modelValue, (newVal) => {
  localFilters.value = { ...newVal }
}, { deep: true })

const hasActiveFilters = computed(() => {
  return localFilters.value.search ||
      localFilters.value.status ||
      localFilters.value.deadlineFrom ||
      localFilters.value.deadlineTo
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (localFilters.value.search) count++
  if (localFilters.value.status) count++
  if (localFilters.value.deadlineFrom) count++
  if (localFilters.value.deadlineTo) count++
  return count
})

function emitFilters() {
  emit('update:modelValue', { ...localFilters.value })
  emit('filter', { ...localFilters.value })
}

function resetFilters() {
  localFilters.value = {
    search: '',
    status: null,
    deadlineFrom: null,
    deadlineTo: null
  }
  emitFilters()
}
</script>

<style scoped>
.reset-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.reset-button :deep(.anticon) {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

