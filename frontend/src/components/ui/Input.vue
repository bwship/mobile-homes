<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    :class="cn(
      'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:-my-2 file:-ml-3 file:mr-3 file:h-10 file:rounded-l-md file:border-0 file:border-r file:border-input file:bg-secondary file:px-3 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80 file:cursor-pointer placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      error ? 'border-destructive focus-visible:ring-destructive' : 'border-input focus-visible:ring-ring',
      $attrs.class as string
    )"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{
  modelValue?: string | number
  error?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string | number]
}>()
</script>
