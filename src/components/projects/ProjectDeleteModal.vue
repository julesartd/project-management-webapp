<template>
  <a-modal
      :visible="visible"
      title="Supprimer le projet"
      ok-text="Supprimer"
      ok-type="danger"
      cancel-text="Annuler"
      @ok="$emit('confirm')"
      @cancel="$emit('update:visible', false)"
  >
    <a-alert
        message="Attention"
        description="Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible et supprimera également toutes les tâches associées."
        type="warning"
        show-icon
    />

    <a-typography-paragraph v-if="project" class="mt-3">
      <strong>Projet :</strong> {{ project.name }}
    </a-typography-paragraph>
  </a-modal>
</template>

<script setup>
defineProps({
  visible: Boolean,
  project: Object
})

defineEmits(['update:visible', 'confirm'])
</script>

<style scoped>
.mt-3 {
  margin-top: 16px;
}
</style>
