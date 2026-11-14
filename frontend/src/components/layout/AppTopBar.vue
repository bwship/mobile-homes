<template>
  <header class="z-40 shrink-0 border-b border-border/60 bg-background/90 backdrop-blur-md">
    <div class="flex h-14 items-center justify-between gap-3 px-3 md:px-4">
      <div class="flex min-w-0 flex-1 items-center gap-2 lg:gap-4">
        <button
          type="button"
          class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 lg:hidden"
          aria-label="Open menu"
          @click="sidebar?.toggleSidebar()"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <router-link to="/" class="flex min-w-0 shrink-0 items-center gap-2.5">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-black text-white">
            MH
          </div>
          <div class="min-w-0">
            <div class="truncate text-sm font-extrabold leading-tight tracking-tight">MH Marketplace</div>
            <div class="hidden truncate text-[10px] font-medium text-muted-foreground sm:block">
              Homes for sale & rent
            </div>
          </div>
        </router-link>

        <PrimaryNav />
      </div>

      <div class="flex shrink-0 items-center gap-0.5 sm:gap-1">
        <ThemeToggle />
        <template v-if="userStore.user">
          <transition name="header-icons">
            <div v-show="!inboxStore.isOpen" class="flex items-center gap-0.5 sm:gap-1 lg:hidden">
              <Tooltip text="Notifications" position="bottom">
                <button
                  type="button"
                  class="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Notifications"
                  @click="inboxStore.toggle('notifications')"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                    />
                  </svg>
                  <span
                    v-if="notificationsStore.unreadCount > 0"
                    class="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white"
                  >
                    {{ notificationsStore.unreadCount > 99 ? '99+' : notificationsStore.unreadCount }}
                  </span>
                </button>
              </Tooltip>
              <Tooltip text="Messages" position="bottom">
                <button
                  type="button"
                  class="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Messages"
                  @click="inboxStore.toggle('messages')"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span
                    v-if="messagesStore.unreadCount > 0"
                    class="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white"
                  >
                    {{ messagesStore.unreadCount > 99 ? '99+' : messagesStore.unreadCount }}
                  </span>
                </button>
              </Tooltip>
            </div>
          </transition>
        </template>
        <template v-else>
          <div class="ml-1 flex items-center gap-2.5 text-sm">
            <router-link
              to="/login"
              class="text-muted-foreground transition-colors hover:text-foreground"
            >
              Log in
            </router-link>
            <span class="text-border">·</span>
            <router-link
              to="/signup"
              class="font-medium text-primary transition-colors hover:brightness-110"
            >
              Sign up
            </router-link>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import ThemeToggle from '@/components/layout/ThemeToggle.vue'
import PrimaryNav from '@/components/layout/PrimaryNav.vue'
import Tooltip from '@/components/ui/Tooltip.vue'
import { SIDEBAR_KEY, type SidebarContext } from '@/components/ui/sidebar'
import { useInboxStore } from '@/stores/inbox'
import { useMessagesStore } from '@/stores/messages'
import { useNotificationsStore } from '@/stores/notifications'
import { useUserStore } from '@/stores/user'

const sidebar = inject(SIDEBAR_KEY) as SidebarContext
const inboxStore = useInboxStore()
const messagesStore = useMessagesStore()
const notificationsStore = useNotificationsStore()
const userStore = useUserStore()
</script>

<style scoped>
.header-icons-enter-active,
.header-icons-leave-active {
  transition: opacity 0.15s ease;
}
.header-icons-enter-from,
.header-icons-leave-to {
  opacity: 0;
}
</style>
