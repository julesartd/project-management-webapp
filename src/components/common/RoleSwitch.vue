<template>
  <div class="role-switch-container">
    <div class="role-switch-wrapper">
      <button
        class="role-switch-button"
        :class="{ active: currentRole === 'developer' }"
        @click="handleRoleChange('developer')"
      >
        <CodeOutlined class="icon" />
        <span class="label">Vue Developer</span>
      </button>

      <button
        class="role-switch-button"
        :class="{ active: currentRole === 'manager' }"
        @click="handleRoleChange('manager')"
      >
        <ProjectOutlined class="icon" />
        <span class="label">Vue Manager</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { CodeOutlined, ProjectOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'developer',
    validator: (value) => ['developer', 'manager'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'role-changed'])

const currentRole = ref(props.modelValue)

function handleRoleChange(newRole) {
  currentRole.value = newRole
  emit('update:modelValue', newRole)
  emit('role-changed', newRole)
}
</script>

<style scoped>
.role-switch-container {
  margin-bottom: 24px;
}

.role-switch-wrapper {
  display: inline-flex;
  gap: 12px;
  padding: 6px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.role-switch-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
  color: #666;
  position: relative;
  overflow: hidden;
}

.role-switch-button::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px;
}

.role-switch-button:hover:not(.active) {
  background: #f5f5f5;
}

.role-switch-button.active {
  color: white;
  font-weight: 600;
}

.role-switch-button.active:nth-child(1) {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.role-switch-button.active:nth-child(2) {
  background: linear-gradient(135deg, #722ed1 0%, #531dab 100%);
  box-shadow: 0 4px 12px rgba(114, 46, 209, 0.3);
}

.role-switch-button .icon {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.role-switch-button.active .icon {
  transform: scale(1.1);
}

.role-switch-button .label {
  white-space: nowrap;
}

@media (max-width: 640px) {
  .role-switch-wrapper {
    width: 100%;
    flex-direction: column;
    gap: 8px;
  }

  .role-switch-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
