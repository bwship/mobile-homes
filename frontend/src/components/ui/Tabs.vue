<template>
  <div class="w-full">
    <div class="border-b border-border">
      <nav class="flex -mb-px" aria-label="Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="$emit('update:modelValue', tab.id)"
          :class="cn(
            'whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
            modelValue === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
          )"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>
    <div class="mt-4">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
}

interface Props {
  modelValue: string
  tabs: Tab[]
}

defineProps<Props>()
defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
