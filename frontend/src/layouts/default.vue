<template>
  <SidebarProvider>
    <div class="flex h-dvh flex-col overflow-hidden bg-background">
      <AppTopBar />

      <MobileSidebarDrawer />

      <div class="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
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
      </div>

      <InboxDrawer v-if="userStore.user" />
    </div>
    <ImpersonateCommandDialog />
    <AuthModal
      :open="authModal.open"
      :initial-mode="authModal.mode"
      :reason="authModal.reason"
      :title="authModal.title"
      @close="authModal.hide()"
      @success="onAuthSuccess"
    />
  </SidebarProvider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppTopBar from '@/components/layout/AppTopBar.vue'
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer.vue'
import InboxDrawer from '@/components/layout/InboxDrawer.vue'
import ImpersonateCommandDialog from '@/components/admin/ImpersonateCommandDialog.vue'
import AuthModal from '@/components/auth/AuthModal.vue'
import { SidebarProvider } from '@/components/ui/sidebar'
import { useUserStore } from '@/stores/user'
import { useAuthModalStore } from '@/stores/authModal'
import { useFavoritesStore } from '@/stores/favorites'

const route = useRoute()
const userStore = useUserStore()
const authModal = useAuthModalStore()
const favoritesStore = useFavoritesStore()
const isHome = computed(() => route.path === '/')

function onAuthSuccess() {
  authModal.handleSuccess()
  void favoritesStore.refresh()
}
</script>
