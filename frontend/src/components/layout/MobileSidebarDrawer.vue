<template>
  <div
    v-if="sidebar?.mobileOpen.value"
    class="fixed inset-0 z-50 lg:hidden"
  >
    <div class="absolute inset-0 bg-black/50" @click="sidebar?.setMobileOpen(false)" />
    <div class="absolute inset-y-0 left-0 flex w-[min(100%,20rem)] flex-col bg-background shadow-xl">
      <div class="flex h-14 items-center justify-between border-b border-border px-4">
        <span class="text-sm font-extrabold tracking-tight">Menu</span>
        <button
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close menu"
          @click="sidebar?.setMobileOpen(false)"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-3">
        <PrimaryNavMobile @navigate="sidebar?.setMobileOpen(false)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import PrimaryNavMobile from './PrimaryNavMobile.vue'
import { SIDEBAR_KEY, type SidebarContext } from '@/components/ui/sidebar'

const sidebar = inject(SIDEBAR_KEY, null) as SidebarContext | null
</script>
