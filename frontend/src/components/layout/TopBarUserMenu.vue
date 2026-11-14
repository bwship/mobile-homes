<template>
  <div v-if="userStore.user" ref="rootRef" class="relative ml-0.5">
    <button
      type="button"
      class="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary text-[11px] font-black text-white ring-offset-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      :aria-expanded="menuOpen"
      aria-label="Account menu"
      @click.stop="menuOpen = !menuOpen"
    >
      <img
        v-if="userStore.user.imageUrl"
        :src="userStore.user.imageUrl"
        :alt="userStore.user.name"
        class="h-full w-full object-cover"
      />
      <span v-else>{{ initials }}</span>
    </button>

    <div
      v-if="menuOpen"
      class="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-xl"
    >
      <div class="border-b border-border px-3 py-2">
        <p class="truncate text-sm font-semibold">{{ userStore.user.name }}</p>
        <p class="truncate text-xs text-muted-foreground">
          <span v-if="userStore.isImpersonating" class="text-amber-600">Impersonating · </span>
          {{ roleLabel }}
        </p>
      </div>

      <button
        type="button"
        class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
        @click="go('/profile')"
      >
        Profile
      </button>

      <button
        v-if="dealerPageUrl"
        type="button"
        class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
        @click="go(dealerPageUrl)"
      >
        My dealer page
      </button>

      <template v-if="userStore.canAccessAdmin">
        <div class="my-1 border-t border-border" />
        <p class="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Admin
        </p>
        <button
          type="button"
          class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
          @click="go('/admin/listings')"
        >
          Approvals
        </button>
        <button
          type="button"
          class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
          @click="go('/admin/users')"
        >
          Users
        </button>
        <button
          type="button"
          class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
          @click="go('/admin/dealers')"
        >
          Dealers
        </button>
        <button
          type="button"
          class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
          @click="openImpersonate"
        >
          {{ userStore.isImpersonating ? 'Switch User' : 'Impersonate' }}
        </button>
      </template>

      <button
        v-if="userStore.isImpersonating"
        type="button"
        class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-amber-600 hover:bg-muted"
        @click="stopImpersonation"
      >
        Stop impersonating
      </button>

      <div class="my-1 border-t border-border" />

      <button
        type="button"
        class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-muted"
        @click="requestLogout"
      >
        Log out
      </button>
    </div>

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
            <Button
              type="button"
              variant="destructive"
              :loading="loggingOut"
              loading-text="Logging out…"
              @click="confirmLogout"
            >
              Log out
            </Button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import { useImpersonateDialogStore } from '@/stores/impersonateDialog'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()
const impersonateDialog = useImpersonateDialogStore()
const menuOpen = ref(false)
const logoutConfirmOpen = ref(false)
const loggingOut = ref(false)
const rootRef = ref<HTMLElement | null>(null)

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
}

function go(path: string) {
  menuOpen.value = false
  router.push(path)
}

function requestLogout() {
  menuOpen.value = false
  logoutConfirmOpen.value = true
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
