<template>
  <div class="space-y-1">
    <div v-for="item in megaNavItems" :key="item.id" class="rounded-lg border border-border/60">
      <button
        type="button"
        class="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-semibold"
        @click="toggle(item.id)"
      >
        {{ item.label }}
        <svg
          class="h-4 w-4 text-muted-foreground transition-transform"
          :class="expanded === item.id && 'rotate-180'"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div v-if="expanded === item.id" class="space-y-3 border-t border-border/60 px-3 py-3">
        <div v-for="col in item.columns" :key="col.heading">
          <p class="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {{ col.heading }}
          </p>
          <div class="space-y-0.5">
            <router-link
              v-for="link in col.links"
              :key="link.to + link.label"
              :to="link.to"
              class="block rounded-md px-2 py-2 text-sm hover:bg-muted"
              @click="emit('navigate')"
            >
              {{ link.label }}
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <router-link
      v-for="item in flatNavItems"
      :key="item.id"
      :to="resolveFlatTo(item)"
      class="block rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-muted"
      @click="emit('navigate')"
    >
      {{ item.label }}
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { flatNavItems, megaNavItems, type FlatItem } from '@/lib/primaryNav'
import { useUserStore } from '@/stores/user'

const emit = defineEmits<{ navigate: [] }>()
const userStore = useUserStore()
const expanded = ref<string | null>('buy')

function toggle(id: string) {
  expanded.value = expanded.value === id ? null : id
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
</script>
