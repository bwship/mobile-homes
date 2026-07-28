<template>
  <div class="flex min-h-dvh flex-col bg-background">
    <nav class="border-b border-border/60 bg-background/95 backdrop-blur sticky top-0 z-40">
      <div class="container py-4 flex items-center justify-between gap-4">
        <router-link to="/" class="flex items-center gap-2 shrink-0">
          <div class="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            MH
          </div>
          <div class="hidden sm:block">
            <div class="font-semibold leading-tight">MH Marketplace</div>
            <div class="text-xs text-muted-foreground">Mobile & manufactured homes</div>
          </div>
        </router-link>

        <div class="flex items-center gap-2 sm:gap-4">
          <router-link to="/search" class="text-sm font-medium hover:text-primary hidden sm:inline">Browse</router-link>
          <router-link
            v-if="userStore.user"
            to="/favorites"
            class="text-sm font-medium hover:text-primary hidden sm:inline"
          >
            Saved
          </router-link>
          <router-link
            v-if="userStore.isSeller && userStore.user?.organizationId"
            :to="`/sellers/${userStore.user.organizationId}`"
            class="text-sm font-medium hover:text-primary hidden md:inline"
          >
            My Listings
          </router-link>
          <template v-if="userStore.user">
            <span class="text-sm text-muted-foreground hidden lg:inline">{{ userStore.user.name }}</span>
            <Button variant="outline" size="sm" @click="logout">Log out</Button>
          </template>
          <template v-else>
            <router-link to="/login" class="text-sm hover:underline">Log In</router-link>
            <router-link to="/signup">
              <Button size="sm">Sign Up</Button>
            </router-link>
          </template>
        </div>
      </div>
    </nav>

    <div
      v-if="userStore.isAdmin"
      class="border-b border-border/60 bg-muted/30"
    >
      <div class="container flex gap-1 overflow-x-auto">
        <router-link
          v-for="tab in adminTabs"
          :key="tab.to"
          :to="tab.to"
          class="px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors"
          :class="$route.path.startsWith(tab.match) ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'"
        >
          {{ tab.label }}
        </router-link>
      </div>
    </div>

    <main class="flex-1 container py-6 md:py-8">
      <RouterView />
    </main>

    <footer class="border-t border-border/60 py-8 mt-auto">
      <div class="container text-center text-sm text-muted-foreground">
        MH Marketplace — find manufactured & mobile homes for sale or rent.
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()

const adminTabs = [
  { to: '/admin/listings', match: '/admin/listings', label: 'Listings' },
  { to: '/admin/users', match: '/admin/users', label: 'Sellers' },
]

async function logout() {
  await authStore.logout()
  router.push('/')
}
</script>
