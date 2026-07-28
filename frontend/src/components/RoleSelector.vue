<template>
  <div>
    <div class="grid grid-cols-2 gap-4">
      <button
        v-for="role in roles"
        :key="role.value"
        type="button"
        @click="$emit('update:modelValue', role.value)"
        :class="[
          'p-4 border-2 rounded-lg text-left transition-colors',
          modelValue === role.value
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary/50'
        ]"
      >
        <div class="font-semibold">{{ role.label }}</div>
        <div class="text-sm text-muted-foreground mt-1">{{ role.description }}</div>
      </button>
    </div>
    <p v-if="modelValue === 'SELLER'" class="text-xs text-muted-foreground mt-2">* Requires approval</p>
  </div>
</template>

<script setup lang="ts">
type RoleValue = 'SELLER' | 'BUYER'

defineProps<{ modelValue: RoleValue | null }>()
defineEmits<{ 'update:modelValue': [value: RoleValue] }>()

const roles = [
  { value: 'SELLER' as const, label: 'Seller', description: 'List mobile homes for sale or rent' },
  { value: 'BUYER' as const, label: 'Buyer', description: 'Browse homes and save favorites' },
]
</script>
