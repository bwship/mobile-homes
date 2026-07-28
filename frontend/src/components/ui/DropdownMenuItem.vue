<template>
  <component
    :is="isLink ? 'router-link' : 'button'"
    :to="isLink ? to : undefined"
    @click="handleClick"
    :class="cn(
      'flex items-center w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer',
      $attrs.class as string
    )"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  to?: string
}

const props = defineProps<Props>()

const isLink = computed(() => !!props.to)

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  if (!isLink.value) {
    emit('click')
  }
}
</script>
