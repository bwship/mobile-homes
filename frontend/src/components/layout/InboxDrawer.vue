<template>
  <div class="contents">
    <transition name="inbox-fade">
      <div
        v-if="inbox.isOpen"
        class="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
        @click="inbox.close()"
      />
    </transition>

    <transition :name="isLgUp ? 'inbox-dock' : 'inbox-slide'">
      <aside
        v-if="inbox.isOpen"
        class="fixed inset-y-0 right-0 z-50 flex h-dvh w-full max-w-md flex-col overflow-hidden border-l border-border bg-card shadow-2xl lg:relative lg:inset-auto lg:z-auto lg:h-full lg:max-w-none lg:w-[380px] lg:shrink-0 lg:shadow-none"
      >
        <div class="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-3">
          <div class="inline-flex items-center rounded-lg bg-muted/50 p-0.5">
            <button
              type="button"
              :class="tabClass(inbox.activeTab === 'notifications')"
              @click="switchTab('notifications')"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
              Notifications
              <span
                v-if="notifications.unreadCount > 0"
                class="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white"
              >
                {{ notifications.unreadCount > 99 ? '99+' : notifications.unreadCount }}
              </span>
            </button>
            <button
              type="button"
              :class="tabClass(inbox.activeTab === 'messages')"
              @click="switchTab('messages')"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Messages
              <span
                v-if="messages.unreadCount > 0"
                class="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white"
              >
                {{ messages.unreadCount > 99 ? '99+' : messages.unreadCount }}
              </span>
            </button>
          </div>
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Close"
            @click="closeInbox"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-show="inbox.activeTab === 'notifications'" class="flex min-h-0 flex-1 flex-col">
          <div v-if="notifications.loading" class="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Loading…
          </div>
          <div
            v-else-if="notifications.items.length === 0"
            class="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center"
          >
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
            </div>
            <p class="text-sm font-semibold">No notifications yet</p>
            <p class="text-xs text-muted-foreground">
              When someone saves one of your listings, you’ll see it here.
            </p>
          </div>
          <ul v-else class="min-h-0 flex-1 overflow-y-auto">
            <li v-for="n in notifications.items" :key="n._id">
              <button
                type="button"
                class="flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/50"
                :class="!n.readAt && 'bg-primary/[0.04]'"
                :disabled="openingNotificationId === n._id"
                @click="onNotificationClick(n)"
              >
                <div
                  class="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-bold"
                >
                  <img
                    v-if="n.actorImageUrl"
                    :src="n.actorImageUrl"
                    :alt="n.actorName"
                    class="h-full w-full object-cover"
                  />
                  <span v-else>{{ initials(n.actorName) }}</span>
                  <span
                    v-if="!n.readAt"
                    class="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-primary"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-2">
                    <p class="truncate text-sm font-semibold">{{ n.title }}</p>
                    <span class="shrink-0 text-[10px] text-muted-foreground">{{ formatRelative(n.createdAt) }}</span>
                  </div>
                  <p class="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{{ n.body }}</p>
                  <p class="mt-1 text-[11px] font-medium text-primary">Message {{ n.actorName.split(' ')[0] }} →</p>
                </div>
              </button>
            </li>
          </ul>
        </div>

        <div v-show="inbox.activeTab === 'messages'" class="flex min-h-0 flex-1 flex-col">
          <!-- Thread view -->
          <template v-if="messages.selectedConversationId">
            <div class="flex items-center gap-2 border-b border-border px-3 py-2">
              <button
                type="button"
                class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Back"
                @click="messages.backToList()"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold">{{ messages.selectedConversation?.partnerName }}</p>
                <router-link
                  v-if="messages.selectedConversation?.listingId && messages.selectedConversation?.listingTitle"
                  :to="`/listings/${messages.selectedConversation.listingId}`"
                  class="block truncate text-[11px] text-muted-foreground hover:text-primary hover:underline"
                  @click="onListingClick"
                >
                  {{ messages.selectedConversation.listingTitle }}
                </router-link>
                <p
                  v-else-if="messages.selectedConversation?.listingTitle"
                  class="truncate text-[11px] text-muted-foreground"
                >
                  {{ messages.selectedConversation.listingTitle }}
                </p>
              </div>
            </div>

            <div ref="threadEl" class="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3">
              <div v-if="messages.loadingThread" class="py-8 text-center text-sm text-muted-foreground">
                Loading…
              </div>
              <div
                v-for="msg in messages.currentMessages"
                :key="msg._id"
                class="flex"
                :class="msg.isMine ? 'justify-end' : 'justify-start'"
              >
                <div
                  class="max-w-[85%] rounded-2xl px-3 py-2 text-sm"
                  :class="
                    msg.isMine
                      ? 'rounded-br-md bg-primary text-white'
                      : 'rounded-bl-md bg-muted text-foreground'
                  "
                >
                  <p class="whitespace-pre-wrap">{{ msg.body }}</p>
                  <p
                    class="mt-1 text-[10px]"
                    :class="msg.isMine ? 'text-white/70' : 'text-muted-foreground'"
                  >
                    {{ formatTime(msg.createdAt) }}
                  </p>
                </div>
              </div>
            </div>

            <form class="flex gap-2 border-t border-border p-3" @submit.prevent="onReply">
              <input
                v-model="replyBody"
                class="flex h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                placeholder="Write a reply…"
                required
              />
              <Button type="submit" size="sm" :disabled="messages.sending || !replyBody.trim()">
                Send
              </Button>
            </form>
          </template>

          <!-- Conversation list -->
          <template v-else>
            <div v-if="messages.loadingConversations" class="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Loading…
            </div>
            <div
              v-else-if="messages.conversations.length === 0"
              class="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center"
            >
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p class="text-sm font-semibold">No messages yet</p>
              <p class="text-xs text-muted-foreground">
                Messages about listings will appear here for buyers and dealers.
              </p>
            </div>
            <ul v-else class="min-h-0 flex-1 overflow-y-auto">
              <li v-for="c in messages.conversations" :key="c._id">
                <button
                  type="button"
                  class="flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/50"
                  @click="messages.openConversation(c._id)"
                >
                  <div
                    class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-bold"
                  >
                    <img
                      v-if="c.partnerImageUrl"
                      :src="c.partnerImageUrl"
                      :alt="c.partnerName"
                      class="h-full w-full object-cover"
                    />
                    <span v-else>{{ initials(c.partnerName) }}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-2">
                      <p class="truncate text-sm font-semibold">{{ c.partnerName }}</p>
                      <span
                        v-if="c.unreadCount > 0"
                        class="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white"
                      >
                        {{ c.unreadCount }}
                      </span>
                    </div>
                    <router-link
                      v-if="c.listingId && c.listingTitle"
                      :to="`/listings/${c.listingId}`"
                      class="block truncate text-[11px] text-muted-foreground hover:text-primary hover:underline"
                      @click.stop="onListingClick"
                    >
                      {{ c.listingTitle }}
                    </router-link>
                    <p v-else-if="c.listingTitle" class="truncate text-[11px] text-muted-foreground">
                      {{ c.listingTitle }}
                    </p>
                    <p class="mt-0.5 truncate text-xs text-muted-foreground">{{ c.lastMessage }}</p>
                  </div>
                </button>
              </li>
            </ul>
          </template>
        </div>
      </aside>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useInboxStore } from '@/stores/inbox'
import { useMessagesStore } from '@/stores/messages'
import { useNotificationsStore, type AppNotification } from '@/stores/notifications'
import Button from '@/components/ui/Button.vue'

const inbox = useInboxStore()
const messages = useMessagesStore()
const notifications = useNotificationsStore()
const isLgUp = ref(false)
const replyBody = ref('')
const threadEl = ref<HTMLElement | null>(null)
const openingNotificationId = ref<string | null>(null)
let mql: MediaQueryList | null = null

function tabClass(active: boolean) {
  return [
    'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors',
    active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
  ]
}

function initials(name: string) {
  return String(name || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatRelative(ts: number) {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function onListingClick() {
  // On mobile the drawer overlays the page — close so the listing is visible.
  if (!isLgUp.value) inbox.close()
}

function switchTab(tab: 'notifications' | 'messages') {
  inbox.activeTab = tab
  if (tab === 'messages') {
    messages.backToList()
    void messages.loadConversations()
  } else {
    void notifications.refresh()
  }
}

function closeInbox() {
  messages.backToList()
  inbox.close()
}

async function onNotificationClick(n: AppNotification) {
  if (openingNotificationId.value) return
  openingNotificationId.value = n._id
  try {
    if (n.type === 'LISTING_FAVORITED') {
      const { conversationId } = await notifications.openFavoriteConversation(n._id)
      inbox.activeTab = 'messages'
      await messages.loadConversations()
      await messages.openConversation(conversationId)
    }
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Could not open conversation')
  } finally {
    openingNotificationId.value = null
  }
}

async function onReply() {
  const body = replyBody.value.trim()
  if (!body) return
  await messages.sendReply(body)
  replyBody.value = ''
  await nextTick()
  if (threadEl.value) threadEl.value.scrollTop = threadEl.value.scrollHeight
}

function syncBreakpoint() {
  isLgUp.value = Boolean(mql?.matches)
}

watch(
  () => inbox.isOpen,
  async (open) => {
    if (!open) return
    void notifications.refresh()
    if (inbox.activeTab === 'messages') {
      await messages.loadConversations()
      const pending = inbox.pendingConversationId
      if (pending) {
        await messages.openConversation(pending)
        inbox.pendingConversationId = null
      }
    }
  },
)

watch(
  () => messages.currentMessages.length,
  async () => {
    await nextTick()
    if (threadEl.value) threadEl.value.scrollTop = threadEl.value.scrollHeight
  },
)

onMounted(() => {
  mql = window.matchMedia('(min-width: 1024px)')
  syncBreakpoint()
  mql.addEventListener('change', syncBreakpoint)
  void messages.loadConversations()
  void notifications.refresh()
})

onUnmounted(() => {
  mql?.removeEventListener('change', syncBreakpoint)
})
</script>

<style scoped>
.inbox-fade-enter-active,
.inbox-fade-leave-active {
  transition: opacity 0.18s ease;
}
.inbox-fade-enter-from,
.inbox-fade-leave-to {
  opacity: 0;
}

.inbox-slide-enter-active,
.inbox-slide-leave-active {
  transition: transform 0.22s ease;
}
.inbox-slide-enter-from,
.inbox-slide-leave-to {
  transform: translateX(100%);
}

.inbox-dock-enter-active,
.inbox-dock-leave-active {
  transition: width 0.22s ease, opacity 0.18s ease;
  overflow: hidden;
}
.inbox-dock-enter-from,
.inbox-dock-leave-to {
  width: 0 !important;
  opacity: 0;
}
</style>
