<script setup lang="ts">
import { computed, inject } from 'vue'
import { SIDEBAR_KEY, type SidebarContext } from '@/components/ui/sidebar/types'

const sidebar = inject(SIDEBAR_KEY) as SidebarContext
const isCollapsed = computed(() => sidebar?.state.value === 'collapsed')
</script>

<template>
  <button
    type="button"
    class="absolute top-1/2 -right-3 z-50 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-md transition-colors hover:bg-accent hover:text-accent-foreground"
    :title="isCollapsed ? 'Expand menu' : 'Collapse menu'"
    aria-label="Toggle sidebar"
    @click.stop="sidebar?.toggleSidebar()"
  >
    <svg
      class="h-3.5 w-3.5 transition-transform duration-200"
      :class="isCollapsed ? 'rotate-180' : ''"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>
  </button>
</template>
