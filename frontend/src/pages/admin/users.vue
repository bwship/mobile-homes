<template>
  <div class="container py-6 md:py-8">
    <h1 class="mb-2 text-3xl font-bold">Users</h1>
    <p class="mb-8 text-muted-foreground">Everyone on the marketplace — customers, dealers, and admins.</p>

    <div v-if="!userStore.canAccessAdmin" class="text-destructive">Admin access required.</div>
    <div v-else>
      <div class="mb-4 flex flex-wrap gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors"
          :class="
            filter === tab.id
              ? 'border-primary bg-primary text-white'
              : 'border-border text-muted-foreground hover:text-foreground'
          "
          @click="filter = tab.id"
        >
          {{ tab.label }}
        </button>
        <Input
          v-model="query"
          placeholder="Filter by name or email…"
          class="ml-auto max-w-xs"
        />
      </div>

      <div v-if="loading" class="text-muted-foreground">Loading…</div>
      <div v-else-if="filtered.length === 0" class="text-muted-foreground">No users found.</div>
      <div v-else class="overflow-hidden rounded-2xl border border-border/60">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-border/60 bg-muted/40">
            <tr>
              <th class="px-4 py-3 font-semibold">Name</th>
              <th class="px-4 py-3 font-semibold">Email</th>
              <th class="px-4 py-3 font-semibold">Role</th>
              <th class="px-4 py-3 font-semibold">Status</th>
              <th class="px-4 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="u in filtered"
              :key="u._id"
              class="border-b border-border/40 last:border-0"
            >
              <td class="px-4 py-3 font-medium">{{ u.name }}</td>
              <td class="px-4 py-3 text-muted-foreground">{{ u.email }}</td>
              <td class="px-4 py-3">
                <span class="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
                  {{ roleLabel(u.role) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span
                  class="rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="
                    u.isApproved
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                  "
                >
                  {{ u.isApproved ? 'Approved' : 'Pending' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-2">
                  <router-link
                    v-if="u.organizationId && (u.role === 'DEALER' || u.role === 'SELLER' || u.role === 'ADMIN')"
                    :to="`/dealers/${u.organizationId}`"
                    class="text-xs font-semibold text-primary hover:underline"
                  >
                    Dealer page
                  </router-link>
                  <button
                    v-if="!u.isApproved"
                    type="button"
                    class="text-xs font-semibold text-primary hover:underline"
                    @click="setApproved(u._id, true)"
                  >
                    Approve
                  </button>
                  <button
                    v-else-if="u.role !== 'ADMIN'"
                    type="button"
                    class="text-xs font-semibold text-muted-foreground hover:text-destructive"
                    @click="setApproved(u._id, false)"
                  >
                    Revoke
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import { useUserStore } from '@/stores/user'
import Input from '@/components/ui/Input.vue'

const userStore = useUserStore()
const users = ref<any[]>([])
const loading = ref(true)
const query = ref('')
const filter = ref<'all' | 'pending' | 'dealer' | 'customer' | 'admin'>('all')

const tabs = [
  { id: 'all' as const, label: 'All' },
  { id: 'pending' as const, label: 'Pending' },
  { id: 'dealer' as const, label: 'Dealers' },
  { id: 'customer' as const, label: 'Customers' },
  { id: 'admin' as const, label: 'Admins' },
]

function roleLabel(role: string) {
  if (role === 'ADMIN') return 'Admin'
  if (role === 'DEALER' || role === 'SELLER') return 'Dealer'
  return 'Customer'
}

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return users.value.filter((u) => {
    if (filter.value === 'pending' && u.isApproved) return false
    if (filter.value === 'dealer' && u.role !== 'DEALER' && u.role !== 'SELLER') return false
    if (filter.value === 'customer' && u.role !== 'CUSTOMER' && u.role !== 'BUYER') return false
    if (filter.value === 'admin' && u.role !== 'ADMIN') return false
    if (!q) return true
    return `${u.name} ${u.email}`.toLowerCase().includes(q)
  })
})

async function load() {
  if (!userStore.adminApiEmail) return
  users.value = (await convex.query(api.users.listAllUsers, {
    adminEmail: userStore.adminApiEmail,
  })) as any[]
}

async function setApproved(userId: string, isApproved: boolean) {
  if (!userStore.adminApiEmail) return
  await convex.mutation(api.users.adminSetUserApproved, {
    userId: userId as any,
    isApproved,
    adminEmail: userStore.adminApiEmail,
  })
  await load()
}

onMounted(async () => {
  try {
    await load()
  } finally {
    loading.value = false
  }
})
</script>
