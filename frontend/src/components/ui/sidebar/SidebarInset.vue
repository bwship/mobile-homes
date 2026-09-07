<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <div :class="cn('flex min-h-0 min-w-0 flex-1 flex-col', props.class)">
    <slot />
  </div>
</template>
