<template>
  <button
    class="action-button"
    :class="[variantClass, { 'is-loading': loading }]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="spinner"></span>
    <component v-else-if="icon" :is="icon" class="icon" />
    <span class="label">
      <slot />
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'purple'].includes(value)
  },
  icon: {
    type: [Object, Function],
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const variantClass = computed(() => `variant-${props.variant}`)
</script>

<style scoped>
.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.action-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-button:hover::before {
  opacity: 1;
}

.action-button:active {
  transform: translateY(1px);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.action-button.variant-primary {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: white;
}

.action-button.variant-primary:hover {
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.4);
  transform: translateY(-2px);
}

.action-button.variant-purple {
  background: linear-gradient(135deg, #722ed1 0%, #531dab 100%);
  color: white;
}

.action-button.variant-purple:hover {
  box-shadow: 0 4px 16px rgba(114, 46, 209, 0.4);
  transform: translateY(-2px);
}

.action-button.variant-success {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  color: white;
}

.action-button.variant-success:hover {
  box-shadow: 0 4px 16px rgba(82, 196, 26, 0.4);
  transform: translateY(-2px);
}

.action-button.variant-danger {
  background: linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%);
  color: white;
}

.action-button.variant-danger:hover {
  box-shadow: 0 4px 16px rgba(255, 77, 79, 0.4);
  transform: translateY(-2px);
}

.action-button.variant-secondary {
  background: white;
  color: #666;
  border: 1px solid #d9d9d9;
}

.action-button.variant-secondary:hover {
  border-color: #1890ff;
  color: #1890ff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.action-button .icon {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.action-button:hover .icon {
  transform: scale(1.1);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.action-button.is-loading {
  pointer-events: none;
}

@media (max-width: 640px) {
  .action-button {
    width: 100%;
    padding: 12px 16px;
  }
}
</style>
