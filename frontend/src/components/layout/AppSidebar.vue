<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SIDEBAR_KEY } from '@/components/ui/sidebar/types'
import { useUserStore } from '@/stores/user'
import { useFavoritesStore } from '@/stores/favorites'
import { useInboxStore } from '@/stores/inbox'
import { useMessagesStore } from '@/stores/messages'
import { useNotificationsStore } from '@/stores/notifications'
import SidebarUserMenu from './SidebarUserMenu.vue'
import PrimaryNavMobile from './PrimaryNavMobile.vue'
import Tooltip from '@/components/ui/Tooltip.vue'

type UtilityIcon = 'search' | 'bell' | 'heart' | 'inbox' | 'check' | 'users' | 'building'

interface UtilityItem {
  id: string
  title: string
  icon: UtilityIcon
  badge?: number
  action: () => void
  active?: boolean
  authOnly?: boolean
}

const props = defineProps<{
  mobile?: boolean
}>()

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const favoritesStore = useFavoritesStore()
const inboxStore = useInboxStore()
const messagesStore = useMessagesStore()
const notificationsStore = useNotificationsStore()
const sidebar = inject(SIDEBAR_KEY, null)
const adminOpen = ref(false)

/** Desktop is always a slim icon rail; mobile drawer shows labels + primary nav. */
const isCollapsed = computed(() => !props.mobile)

function closeMobile() {
  if (props.mobile) sidebar?.setMobileOpen(false)
}

function go(url: string) {
  router.push(url)
  closeMobile()
}

const utilityItems = computed((): UtilityItem[] => {
  const items: UtilityItem[] = [
    {
      id: 'search',
      title: 'Search',
      icon: 'search',
      action: () => go('/search'),
      active: route.path === '/search' || route.path.startsWith('/listings/'),
    },
    {
      id: 'updates',
      title: 'Updates',
      icon: 'bell',
      badge: notificationsStore.unreadCount > 0 ? notificationsStore.unreadCount : undefined,
      authOnly: true,
      action: () => {
        inboxStore.toggle('notifications')
        closeMobile()
      },
    },
    {
      id: 'favorites',
      title: 'Favorites',
      icon: 'heart',
      badge: favoritesStore.count > 0 ? favoritesStore.count : undefined,
      authOnly: true,
      action: () => go('/favorites'),
      active: route.path === '/favorites' || route.path.startsWith('/favorites/'),
    },
    {
      id: 'inbox',
      title: 'Inbox',
      icon: 'inbox',
      badge: messagesStore.unreadCount > 0 ? messagesStore.unreadCount : undefined,
      authOnly: true,
      action: () => {
        inboxStore.toggle('messages')
        closeMobile()
      },
    },
  ]
  return items.filter((item) => !item.authOnly || Boolean(userStore.user))
})

const adminItems = computed(() => {
  if (!userStore.canAccessAdmin) return []
  return [
    { title: 'Approvals', url: '/admin/listings', icon: 'check' as const },
    { title: 'Users', url: '/admin/users', icon: 'users' as const },
    { title: 'Dealers', url: '/admin/dealers', icon: 'building' as const },
  ]
})

function tooltipText(item: UtilityItem) {
  if (item.badge && item.badge > 0) return `${item.title} (${item.badge})`
  return item.title
}

function isAdminActive(url: string) {
  return route.path === url || route.path.startsWith(`${url}/`)
}

function goAdmin(url: string) {
  adminOpen.value = false
  go(url)
}
</script>

<template>
  <aside
    :class="[
      'relative flex h-full shrink-0 flex-col overflow-visible border-r border-border bg-background text-foreground',
      mobile ? 'w-72' : 'w-16',
    ]"
  >
    <nav class="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-3">
      <div v-if="mobile" class="mb-3 px-1">
        <p class="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Browse
        </p>
        <PrimaryNavMobile @navigate="closeMobile" />
        <div class="my-3 border-t border-border" />
        <p class="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Shortcuts
        </p>
      </div>

      <Tooltip
        v-for="item in utilityItems"
        :key="item.id"
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
            item.active
              ? 'bg-accent text-accent-foreground'
              : 'text-foreground/80 hover:bg-muted hover:text-foreground',
          ]"
          @click="item.action()"
        >
          <span class="relative shrink-0">
            <svg v-if="item.icon === 'search'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
            </svg>
            <svg v-else-if="item.icon === 'bell'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0" />
            </svg>
            <svg v-else-if="item.icon === 'heart'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
            </svg>
            <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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

      <template v-if="adminItems.length">
        <div v-if="isCollapsed" class="my-2 border-t border-border" />
        <p
          v-else
          class="mt-3 px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Admin
        </p>

        <div class="relative">
          <Tooltip
            v-if="isCollapsed"
            text="Admin"
            position="right"
            wrapper-class="block w-full"
          >
            <button
              type="button"
              class="relative flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-colors"
              :class="
                adminOpen || adminItems.some((a) => isAdminActive(a.url))
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              "
              aria-label="Admin"
              @click="adminOpen = !adminOpen"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </Tooltip>

          <div
            v-if="!isCollapsed || adminOpen"
            :class="
              isCollapsed
                ? 'absolute left-full top-0 z-50 ml-2 w-48 rounded-xl border border-border bg-card py-1 shadow-xl'
                : 'space-y-0.5'
            "
          >
            <button
              v-for="item in adminItems"
              :key="item.url"
              type="button"
              class="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors"
              :class="
                isAdminActive(item.url)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              "
              @click="goAdmin(item.url)"
            >
              <svg v-if="item.icon === 'check'" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else-if="item.icon === 'users'" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 10a4 4 0 100-8 4 4 0 000 8zm12 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
              <svg v-else class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
              </svg>
              <span>{{ item.title }}</span>
            </button>
          </div>
        </div>
      </template>
    </nav>

    <SidebarUserMenu :mobile="mobile" :collapsed="isCollapsed" />
  </aside>
</template>
