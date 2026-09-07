import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import { useUserStore } from '@/stores/user'

export type AppNotification = {
  _id: string
  type: 'LISTING_FAVORITED'
  title: string
  body: string
  listingId: string
  listingTitle: string | null
  organizationId: string
  actorUserId: string
  actorName: string
  actorImageUrl: string | null
  readAt: number | null
  createdAt: number
}

export const useNotificationsStore = defineStore('notifications', () => {
  const userStore = useUserStore()
  const items = ref<AppNotification[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)

  async function refresh() {
    if (!userStore.user?.email) {
      items.value = []
      unreadCount.value = 0
      return
    }
    loading.value = true
    try {
      const [rows, count] = await Promise.all([
        convex.query(api.notifications.listMyNotifications, {
          userEmail: userStore.user.email,
        }),
        convex.query(api.notifications.getUnreadCount, {
          userEmail: userStore.user.email,
        }),
      ])
      items.value = (rows as AppNotification[]) ?? []
      unreadCount.value = Number(count) || 0
    } catch {
      items.value = []
      unreadCount.value = 0
    } finally {
      loading.value = false
    }
  }

  async function openFavoriteConversation(notificationId: string) {
    if (!userStore.user?.email) throw new Error('Login required')
    const result = await convex.mutation(api.notifications.openFavoriteConversation, {
      userEmail: userStore.user.email,
      notificationId: notificationId as any,
    })
    await refresh()
    return result as { conversationId: string }
  }

  async function markAllRead() {
    if (!userStore.user?.email) return
    await convex.mutation(api.notifications.markAllRead, {
      userEmail: userStore.user.email,
    })
    await refresh()
  }

  watch(
    () => userStore.user?.email,
    () => {
      void refresh()
    },
    { immediate: true },
  )

  return {
    items,
    unreadCount,
    loading,
    refresh,
    openFavoriteConversation,
    markAllRead,
  }
})
