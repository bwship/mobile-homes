<template>
  <Teleport to="body">
    <div
      v-if="dialog.open"
      class="fixed inset-0 z-[80] flex items-start justify-center bg-black/55 p-4 pt-[12vh] backdrop-blur-[2px] sm:pt-[15vh]"
      @keydown.esc.prevent="dialog.hide()"
    >
      <div class="absolute inset-0" @click="dialog.hide()" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Impersonate user"
        class="relative z-10 flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
        @keydown.enter.prevent="selectHighlighted"
      >
        <div class="border-b border-border px-4 py-3">
          <div class="relative">
            <svg
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
              />
            </svg>
            <input
              ref="searchInput"
              v-model="search"
              type="text"
              placeholder="Search by name or email…"
              class="flex h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              @input="highlighted = 0"
            />
          </div>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <button
              v-for="opt in roleFilters"
              :key="opt.value"
              type="button"
              class="rounded-full border px-3 py-1 text-xs font-semibold transition-colors"
              :class="
                roleFilter === opt.value
                  ? 'border-primary bg-primary text-white'
                  : 'border-border text-muted-foreground hover:text-foreground'
              "
              @click="roleFilter = opt.value; highlighted = 0"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <div class="max-h-[min(420px,50vh)] overflow-y-auto p-2">
          <p v-if="loading" class="px-3 py-8 text-center text-sm text-muted-foreground">Loading users…</p>
          <p v-else-if="filtered.length === 0" class="px-3 py-8 text-center text-sm text-muted-foreground">
            No users found.
          </p>
          <ul v-else class="space-y-0.5" role="listbox">
            <li v-for="(u, idx) in filtered" :key="u._id">
              <button
                type="button"
                role="option"
                class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors"
                :class="
                  idx === highlighted
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-muted/60'
                "
                :aria-selected="idx === highlighted"
                @mouseenter="highlighted = idx"
                @click="select(u)"
              >
                <div
                  class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-xs font-bold text-primary"
                >
                  <img
                    v-if="u.imageUrl"
                    :src="u.imageUrl"
                    :alt="u.name"
                    class="h-full w-full object-cover"
                  />
                  <span v-else>{{ initials(u.name) }}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold">{{ u.name }}</p>
                  <p class="truncate text-xs text-muted-foreground">
                    <template v-if="u.organizationName && (u.role === 'DEALER' || u.role === 'SELLER')">
                      {{ u.organizationName }} · {{ u.email }}
                    </template>
                    <template v-else>{{ u.email }}</template>
                  </p>
                </div>
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                  :class="roleBadgeClass(u.role)"
                >
                  {{ roleLabel(u.role) }}
                </span>
              </button>
            </li>
          </ul>
        </div>

        <div
          class="flex items-center justify-between gap-3 border-t border-border px-4 py-2 text-[11px] text-muted-foreground"
        >
          <span>↑↓ navigate · Enter select · Esc close</span>
          <button type="button" class="font-semibold hover:text-foreground" @click="dialog.hide()">
            Close
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import { useUserStore } from '@/stores/user'
import { useImpersonateDialogStore } from '@/stores/impersonateDialog'

const dialog = useImpersonateDialogStore()
const userStore = useUserStore()
const router = useRouter()

const users = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const roleFilter = ref<'all' | 'DEALER' | 'CUSTOMER' | 'ADMIN'>('all')
const highlighted = ref(0)
const searchInput = ref<HTMLInputElement | null>(null)
const selecting = ref(false)

const roleFilters = [
  { value: 'all' as const, label: 'All' },
  { value: 'DEALER' as const, label: 'Dealers' },
  { value: 'CUSTOMER' as const, label: 'Customers' },
  { value: 'ADMIN' as const, label: 'Admins' },
]

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const adminId = userStore.realAdmin?._id ?? userStore.user?._id
  return users.value.filter((u) => {
    if (u._id === adminId) return false
    if (roleFilter.value !== 'all' && u.role !== roleFilter.value) return false
    if (!q) return true
    return (
      String(u.name || '').toLowerCase().includes(q) ||
      String(u.email || '').toLowerCase().includes(q) ||
      String(u.organizationName || '').toLowerCase().includes(q)
    )
  })
})

function initials(name: string) {
  return String(name || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function roleLabel(role: string) {
  if (role === 'DEALER' || role === 'SELLER') return 'Dealer'
  if (role === 'ADMIN') return 'Admin'
  return 'Customer'
}

function roleBadgeClass(role: string) {
  if (role === 'DEALER' || role === 'SELLER') {
    return 'bg-primary/15 text-primary'
  }
  if (role === 'ADMIN') {
    return 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
  }
  return 'bg-muted text-muted-foreground'
}

function move(delta: number) {
  const len = filtered.value.length
  if (!len) return
  highlighted.value = (highlighted.value + delta + len) % len
}

function selectHighlighted() {
  const u = filtered.value[highlighted.value]
  if (u) void select(u)
}

async function load() {
  if (!userStore.adminApiEmail) return
  loading.value = true
  try {
    users.value = (await convex.query(api.users.listAllUsers, {
      adminEmail: userStore.adminApiEmail,
    })) as any[]
  } finally {
    loading.value = false
  }
}

async function select(u: any) {
  if (selecting.value) return
  selecting.value = true
  try {
    await userStore.startImpersonation(u.email)
    dialog.hide()
    await router.push('/')
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Could not impersonate')
  } finally {
    selecting.value = false
  }
}

watch(
  () => dialog.open,
  async (open) => {
    if (!open) return
    search.value = ''
    roleFilter.value = 'all'
    highlighted.value = 0
    await load()
    await nextTick()
    searchInput.value?.focus()
  },
)

watch(filtered, () => {
  if (highlighted.value >= filtered.value.length) {
    highlighted.value = Math.max(0, filtered.value.length - 1)
  }
})
</script>
