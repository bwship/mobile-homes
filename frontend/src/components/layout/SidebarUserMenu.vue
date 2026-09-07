<template>
  <div ref="rootRef" class="relative shrink-0 border-t border-border p-2">
    <!-- Logged in -->
    <template v-if="userStore.user">
      <Tooltip
        :text="userStore.user.name"
        position="right"
        :disabled="!isCollapsed"
        wrapper-class="block w-full"
      >
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted"
          :class="isCollapsed ? 'justify-center' : ''"
          :aria-expanded="menuOpen"
          @click.stop="menuOpen = !menuOpen"
        >
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-[11px] font-black text-white"
          >
            <img
              v-if="userStore.user.imageUrl"
              :src="userStore.user.imageUrl"
              :alt="userStore.user.name"
              class="h-full w-full object-cover"
            />
            <span v-else>{{ initials }}</span>
          </div>
          <div v-if="!isCollapsed" class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold leading-tight">
              {{ userStore.user.name }}
            </p>
            <p class="truncate text-[11px] text-muted-foreground">
              <span v-if="userStore.isImpersonating" class="text-amber-600">Impersonating · </span>
              {{ roleLabel }}
            </p>
          </div>
          <svg
            v-if="!isCollapsed"
            class="h-4 w-4 shrink-0 text-muted-foreground transition-transform"
            :class="menuOpen && 'rotate-180'"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </Tooltip>

      <div
        v-if="menuOpen"
        class="absolute z-50 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-xl"
        :class="
          isCollapsed
            ? 'bottom-2 left-full ml-2 w-52'
            : 'bottom-[calc(100%+0.5rem)] left-2 right-2'
        "
      >
        <div v-if="isCollapsed" class="border-b border-border px-3 py-2">
          <p class="truncate text-sm font-semibold">{{ userStore.user.name }}</p>
          <p class="truncate text-xs text-muted-foreground">{{ userStore.user.email }}</p>
        </div>

        <button
          type="button"
          class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
          @click="go('/profile')"
        >
          <svg class="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile
        </button>

        <button
          v-if="dealerPageUrl"
          type="button"
          class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
          @click="go(dealerPageUrl)"
        >
          <svg class="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
          </svg>
          My dealer page
        </button>

        <template v-if="userStore.canAccessAdmin || userStore.isImpersonating">
          <div class="my-1 border-t border-border" />

          <button
            v-if="userStore.canAccessAdmin"
            type="button"
            class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
            @click="openImpersonate"
          >
            <svg class="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            {{ userStore.isImpersonating ? 'Switch User' : 'Impersonate' }}
          </button>

          <button
            v-if="userStore.isImpersonating"
            type="button"
            class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-amber-600 hover:bg-muted"
            @click="stopImpersonation"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Stop impersonating
          </button>
        </template>

        <div class="my-1 border-t border-border" />

        <button
          type="button"
          class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-muted"
          @click="requestLogout"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log out
        </button>
      </div>
    </template>

    <!-- Guest -->
    <template v-else>
      <div :class="isCollapsed ? 'flex flex-col items-center gap-1' : 'space-y-1'">
        <Tooltip text="Log in" position="right" :disabled="!isCollapsed" wrapper-class="block w-full">
          <button
            type="button"
            class="flex h-9 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors hover:bg-muted"
            :class="!isCollapsed && 'px-3 justify-start'"
            @click="go('/login')"
          >
            <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span v-if="!isCollapsed">Log in</span>
          </button>
        </Tooltip>
        <Tooltip text="Sign up" position="right" :disabled="!isCollapsed" wrapper-class="block w-full">
          <button
            type="button"
            class="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white transition-colors hover:brightness-110"
            :class="!isCollapsed && 'px-3'"
            @click="go('/signup')"
          >
            <span v-if="!isCollapsed">Sign up</span>
            <span v-else>+</span>
          </button>
        </Tooltip>
      </div>
    </template>

    <Teleport to="body">
      <div
        v-if="logoutConfirmOpen"
        class="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      >
        <div class="absolute inset-0 bg-black/50" @click="logoutConfirmOpen = false" />
        <div
          class="relative w-full max-w-sm rounded-t-2xl border border-border bg-background p-6 shadow-xl sm:rounded-2xl"
        >
          <h2 class="text-lg font-semibold">Log out?</h2>
          <p class="mt-2 text-sm text-muted-foreground">
            Are you sure you want to log out of your account?
          </p>
          <div class="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" :disabled="loggingOut" @click="logoutConfirmOpen = false">
              Cancel
            </Button>
            <Button type="button" variant="destructive" :loading="loggingOut" loading-text="Logging out…" @click="confirmLogout">
              Log out
            </Button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { SIDEBAR_KEY } from '@/components/ui/sidebar/types'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import { useImpersonateDialogStore } from '@/stores/impersonateDialog'
import Tooltip from '@/components/ui/Tooltip.vue'
import Button from '@/components/ui/Button.vue'

const props = defineProps<{
  mobile?: boolean
  collapsed?: boolean
}>()

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()
const impersonateDialog = useImpersonateDialogStore()
const sidebar = inject(SIDEBAR_KEY, null)
const menuOpen = ref(false)
const logoutConfirmOpen = ref(false)
const loggingOut = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const isCollapsed = computed(
  () => props.collapsed ?? (!props.mobile && sidebar?.state.value === 'collapsed'),
)

const initials = computed(() => {
  const name = userStore.user?.name ?? '?'
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
})

const roleLabel = computed(() => {
  const role = userStore.user?.role
  if (role === 'ADMIN') return 'Admin'
  if (role === 'DEALER') return 'Dealer'
  return 'Customer'
})

const dealerPageUrl = computed(() => {
  const orgId = userStore.user?.organizationId
  if (!orgId) return null
  if (userStore.isDealer || userStore.isAdmin) return `/dealers/${orgId}`
  return null
})

function openImpersonate() {
  menuOpen.value = false
  impersonateDialog.show()
  if (props.mobile) sidebar?.setMobileOpen(false)
}

function go(path: string) {
  menuOpen.value = false
  router.push(path)
  if (props.mobile) sidebar?.setMobileOpen(false)
}

function requestLogout() {
  menuOpen.value = false
  logoutConfirmOpen.value = true
  if (props.mobile) sidebar?.setMobileOpen(false)
}

async function confirmLogout() {
  loggingOut.value = true
  try {
    await authStore.logout()
    logoutConfirmOpen.value = false
    router.push('/')
  } finally {
    loggingOut.value = false
  }
}

function stopImpersonation() {
  menuOpen.value = false
  userStore.stopImpersonation()
  if (props.mobile) sidebar?.setMobileOpen(false)
}

function onDocClick(e: MouseEvent) {
  if (!menuOpen.value) return
  const target = e.target as Node | null
  if (target && rootRef.value?.contains(target)) return
  menuOpen.value = false
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>
