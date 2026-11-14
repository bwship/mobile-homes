<template>
  <component
    :is="to ? 'router-link' : 'div'"
    v-bind="to ? { to } : {}"
    class="inline-flex min-w-0 items-center gap-2.5"
    :class="to && 'transition-opacity hover:opacity-90'"
    :aria-label="to ? 'MH Marketplace home' : undefined"
  >
    <img
      :src="markSrc"
      alt=""
      class="shrink-0 object-cover shadow-md ring-1 ring-black/5 dark:ring-white/10"
      :class="markClass"
      width="36"
      height="36"
      decoding="async"
    />
    <div v-if="showWordmark" class="min-w-0">
      <div
        class="truncate font-extrabold leading-tight tracking-tight text-foreground"
        :class="wordmarkClass"
      >
        MH Marketplace
      </div>
      <div
        v-if="tagline"
        class="hidden truncate text-[10px] font-medium text-muted-foreground sm:block"
      >
        {{ tagline }}
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    to?: string
    size?: 'sm' | 'md' | 'lg'
    showWordmark?: boolean
    tagline?: string | false
    /** Extra border for auth badge overlap on gradient header */
    badge?: boolean
  }>(),
  {
    size: 'md',
    showWordmark: false,
    tagline: 'Homes for sale & rent',
    badge: false,
  },
)

const markSrc = '/brand-mark.png'

const markClass = computed(() => {
  const sizes = {
    sm: 'h-8 w-8 rounded-lg',
    md: 'h-9 w-9 rounded-xl',
    lg: 'h-14 w-14 rounded-2xl',
  }
  return [
    sizes[props.size],
    props.badge && 'border-4 border-card',
  ]
})

const wordmarkClass = computed(() => {
  if (props.size === 'lg') return 'text-base'
  if (props.size === 'sm') return 'text-xs'
  return 'text-sm'
})
</script>
