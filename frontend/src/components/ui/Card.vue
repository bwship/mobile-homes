<template>
  <div
    :class="
      cn(
        'rounded-lg border border-border/40 bg-card text-card-foreground shadow-sm dark:border-transparent dark:shadow-none',
        props.class,
      )
    "
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  class?: string
}>()
</script>
