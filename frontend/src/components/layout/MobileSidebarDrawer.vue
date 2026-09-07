<template>
  <div
    v-if="sidebar?.mobileOpen.value"
    class="fixed inset-0 z-50 md:hidden"
  >
    <div class="absolute inset-0 bg-black/50" @click="sidebar?.setMobileOpen(false)" />
    <div class="absolute inset-y-0 left-0 shadow-xl">
      <AppSidebar mobile />
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import AppSidebar from './AppSidebar.vue'
import { SIDEBAR_KEY, type SidebarContext } from '@/components/ui/sidebar'

const sidebar = inject(SIDEBAR_KEY, null) as SidebarContext | null
</script>
