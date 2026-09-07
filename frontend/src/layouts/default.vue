<template>
  <SidebarProvider>
    <div class="flex h-dvh overflow-hidden bg-background">
      <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppTopBar />

        <div class="flex min-h-0 flex-1 items-stretch">
          <div class="relative z-40 hidden h-full shrink-0 md:block">
            <AppSidebar />
          </div>

          <MobileSidebarDrawer />

          <SidebarInset class="min-h-0 overflow-y-auto scrollbar-thin">
            <main class="flex-1">
              <RouterView />
            </main>
            <footer
              v-if="isHome"
              class="mt-auto border-t border-border/60 py-8"
            >
              <div class="container flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
                <span class="font-semibold text-foreground">MH Marketplace</span>
                <span>Find manufactured & mobile homes for sale or rent nationwide.</span>
              </div>
            </footer>
          </SidebarInset>
        </div>
      </div>

      <InboxDrawer v-if="userStore.user" />
    </div>
    <ImpersonateCommandDialog />
  </SidebarProvider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppTopBar from '@/components/layout/AppTopBar.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer.vue'
import InboxDrawer from '@/components/layout/InboxDrawer.vue'
import ImpersonateCommandDialog from '@/components/admin/ImpersonateCommandDialog.vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()
const isHome = computed(() => route.path === '/')
</script>
