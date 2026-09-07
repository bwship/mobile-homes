<script setup lang="ts">
import { computed, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SIDEBAR_KEY } from '@/components/ui/sidebar/types'
import { useUserStore } from '@/stores/user'
import { useFavoritesStore } from '@/stores/favorites'
import SidebarToggle from './SidebarToggle.vue'
import SidebarUserMenu from './SidebarUserMenu.vue'
import Tooltip from '@/components/ui/Tooltip.vue'

interface NavItem {
  title: string
  url: string
  icon: 'home' | 'search' | 'heart' | 'check' | 'users' | 'building' | 'closings'
  badge?: number
}

interface NavGroup {
  label?: string
  items: NavItem[]
}

const props = defineProps<{
  mobile?: boolean
}>()

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const favoritesStore = useFavoritesStore()
const sidebar = inject(SIDEBAR_KEY, null)
const isCollapsed = computed(() => !props.mobile && sidebar?.state.value === 'collapsed')

const navigationGroups = computed((): NavGroup[] => {
  const primary: NavItem[] = [
    { title: 'Home', url: '/', icon: 'home' },
    { title: 'Search', url: '/search', icon: 'search' },
    { title: 'Closings', url: '/closings', icon: 'closings' },
  ]

  if (userStore.user) {
    primary.push({
      title: 'Favorites',
      url: '/favorites',
      icon: 'heart',
      badge: favoritesStore.count > 0 ? favoritesStore.count : undefined,
    })
  }

  const groups: NavGroup[] = [{ items: primary }]

  if (userStore.canAccessAdmin) {
    groups.push({
      label: 'Admin',
      items: [
        { title: 'Approvals', url: '/admin/listings', icon: 'check' },
        { title: 'Users', url: '/admin/users', icon: 'users' },
        { title: 'Dealers', url: '/admin/dealers', icon: 'building' },
      ],
    })
  }

  return groups
})

function isItemActive(url: string) {
  if (url === '/') return route.path === '/'
  if (url === '/search') {
    return route.path === '/search' || route.path.startsWith('/listings/')
  }
  if (url === '/admin/dealers') {
    return (
      route.path === '/admin/dealers' ||
      route.path.startsWith('/admin/dealers/') ||
      route.path.startsWith('/dealers/')
    )
  }
  return route.path === url || route.path.startsWith(`${url}/`)
}

function handleNavigate(url: string) {
  router.push(url)
  if (props.mobile) sidebar?.setMobileOpen(false)
}

function tooltipText(item: NavItem) {
  if (item.badge && item.badge > 0) return `${item.title} (${item.badge})`
  return item.title
}
</script>

<template>
  <aside
    :class="[
      'relative flex h-full shrink-0 flex-col overflow-visible border-r border-border bg-background text-foreground transition-[width] duration-200',
      mobile ? 'w-64' : isCollapsed ? 'w-16' : 'w-64',
    ]"
  >
    <SidebarToggle v-if="!mobile" />

    <nav class="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-3">
      <template v-for="(group, gi) in navigationGroups" :key="gi">
        <p
          v-if="group.label && !isCollapsed"
          class="mt-3 px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {{ group.label }}
        </p>
        <div v-else-if="group.label && isCollapsed" class="my-2 border-t border-border" />

        <Tooltip
          v-for="item in group.items"
          :key="item.url"
          :text="tooltipText(item)"
          position="right"
          :disabled="!isCollapsed"
          wrapper-class="block w-full"
        >
          <button
            type="button"
            class="relative flex h-10 w-full items-center gap-3 rounded-lg text-sm font-medium transition-colors"
            :class="[
              isCollapsed ? 'justify-center px-0' : 'px-3',
              isItemActive(item.url)
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground/80 hover:bg-muted hover:text-foreground',
            ]"
            @click="handleNavigate(item.url)"
          >
            <span class="relative shrink-0">
              <svg v-if="item.icon === 'home'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-4 0h4" />
              </svg>
              <svg v-else-if="item.icon === 'search'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
              </svg>
              <svg v-else-if="item.icon === 'heart'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
              </svg>
              <svg v-else-if="item.icon === 'check'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else-if="item.icon === 'users'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 10a4 4 0 100-8 4 4 0 000 8zm12 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
              <svg v-else-if="item.icon === 'closings'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7 20h10a2 2 0 002-2V8.5L13.5 4H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
              </svg>
              <span
                v-if="isCollapsed && item.badge"
                class="absolute -right-2 -top-1.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white"
              >
                {{ item.badge > 99 ? '99+' : item.badge }}
              </span>
            </span>
            <span v-if="!isCollapsed" class="min-w-0 flex-1 truncate text-left">{{ item.title }}</span>
            <span
              v-if="!isCollapsed && item.badge"
              class="ml-auto inline-flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-primary/15 px-1.5 text-[10px] font-bold tabular-nums text-primary"
            >
              {{ item.badge > 99 ? '99+' : item.badge }}
            </span>
          </button>
        </Tooltip>
      </template>
    </nav>

    <SidebarUserMenu :mobile="mobile" :collapsed="isCollapsed" />
  </aside>
</template>
