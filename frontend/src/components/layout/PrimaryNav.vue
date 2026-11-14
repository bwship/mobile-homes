<template>
  <nav class="hidden min-w-0 flex-1 items-center lg:flex" aria-label="Primary">
    <ul class="flex items-center gap-0.5 xl:gap-1">
      <li
        v-for="item in megaNavItems"
        :key="item.id"
        class="relative"
        @mouseenter="openMega(item.id)"
        @mouseleave="scheduleClose"
      >
        <button
          type="button"
          class="rounded-md px-2.5 py-1.5 text-sm font-semibold transition-colors xl:px-3"
          :class="
            openId === item.id
              ? 'bg-muted text-foreground'
              : 'text-foreground/80 hover:bg-muted/70 hover:text-foreground'
          "
          :aria-expanded="openId === item.id"
          @click="toggleMega(item.id)"
          @focus="openMega(item.id)"
        >
          {{ item.label }}
        </button>

        <div
          v-if="openId === item.id"
          class="absolute left-0 top-full z-50 pt-2"
          @mouseenter="cancelClose"
        >
          <div
            class="min-w-[240px] rounded-xl border border-border bg-card p-4 shadow-xl"
            :class="item.columns.length > 1 ? 'grid grid-cols-2 gap-6' : ''"
          >
            <div v-for="col in item.columns" :key="col.heading">
              <p class="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {{ col.heading }}
              </p>
              <ul class="space-y-1">
                <li v-for="link in col.links" :key="link.to + link.label">
                  <router-link
                    :to="link.to"
                    class="block rounded-md px-2 py-1.5 text-sm text-foreground/90 transition-colors hover:bg-muted hover:text-primary"
                    @click="closeMega"
                  >
                    {{ link.label }}
                  </router-link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </li>

      <li v-for="item in flatNavItems" :key="item.id">
        <router-link
          :to="resolveFlatTo(item)"
          class="rounded-md px-2.5 py-1.5 text-sm font-semibold text-foreground/80 transition-colors hover:bg-muted/70 hover:text-foreground xl:px-3"
          @click="closeMega"
        >
          {{ item.label }}
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { flatNavItems, megaNavItems, type FlatItem } from '@/lib/primaryNav'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const openId = ref<string | null>(null)
let closeTimer: ReturnType<typeof setTimeout> | null = null

function openMega(id: string) {
  cancelClose()
  openId.value = id
}

function toggleMega(id: string) {
  openId.value = openId.value === id ? null : id
}

function closeMega() {
  openId.value = null
}

function scheduleClose() {
  cancelClose()
  closeTimer = setTimeout(() => {
    openId.value = null
  }, 160)
}

function cancelClose() {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
}

function resolveFlatTo(item: FlatItem) {
  if (item.id === 'my-home') {
    return userStore.user ? '/profile' : '/login'
  }
  if (item.id === 'manage') {
    if (userStore.user?.organizationId && (userStore.isDealer || userStore.isAdmin || userStore.canAccessAdmin)) {
      return `/dealers/${userStore.user.organizationId}`
    }
    return '/signup?role=SELLER'
  }
  return item.to
}

onBeforeUnmount(() => cancelClose())
</script>
