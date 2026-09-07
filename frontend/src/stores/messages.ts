import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import { useUserStore } from '@/stores/user'

export type ConversationSummary = {
  _id: string
  organizationId: string
  buyerUserId: string
  listingId: string | null
  listingTitle: string | null
  lastMessage: string
  lastAt: number
  unreadCount: number
  partnerName: string
  partnerImageUrl: string | null
  partnerKind: 'dealer' | 'buyer'
}

export type ThreadMessage = {
  _id: string
  senderUserId: string
  senderName: string
  body: string
  createdAt: number
  isMine: boolean
}

export const useMessagesStore = defineStore('messages', () => {
  const userStore = useUserStore()
  const conversations = ref<ConversationSummary[]>([])
  const currentMessages = ref<ThreadMessage[]>([])
  const selectedConversationId = ref<string | null>(null)
  const unreadCount = ref(0)
  const loadingConversations = ref(false)
  const loadingThread = ref(false)
  const sending = ref(false)

  const selectedConversation = computed(
    () => conversations.value.find((c) => c._id === selectedConversationId.value) ?? null,
  )

  async function loadConversations() {
    if (!userStore.user?.email) {
      conversations.value = []
      unreadCount.value = 0
      return
    }
    loadingConversations.value = true
    try {
      const [rows, count] = await Promise.all([
        convex.query(api.messages.getConversations, {
          userEmail: userStore.user.email,
        }),
        convex.query(api.messages.getUnreadCount, {
          userEmail: userStore.user.email,
        }),
      ])
      conversations.value = (rows as ConversationSummary[]) ?? []
      unreadCount.value = Number(count) || 0
    } finally {
      loadingConversations.value = false
    }
  }

  async function openConversation(conversationId: string) {
    if (!userStore.user?.email) return
    selectedConversationId.value = conversationId
    loadingThread.value = true
    try {
      currentMessages.value = (await convex.query(api.messages.getMessages, {
        userEmail: userStore.user.email,
        conversationId: conversationId as any,
      })) as ThreadMessage[]
      await convex.mutation(api.messages.markConversationRead, {
        userEmail: userStore.user.email,
        conversationId: conversationId as any,
      })
      await loadConversations()
    } finally {
      loadingThread.value = false
    }
  }

  function backToList() {
    selectedConversationId.value = null
    currentMessages.value = []
  }

  async function sendReply(body: string) {
    if (!userStore.user?.email || !selectedConversationId.value) return
    sending.value = true
    try {
      await convex.mutation(api.messages.sendReply, {
        userEmail: userStore.user.email,
        conversationId: selectedConversationId.value as any,
        body,
      })
      await openConversation(selectedConversationId.value)
    } finally {
      sending.value = false
    }
  }

  async function sendListingMessage(listingId: string, body: string) {
    if (!userStore.user?.email) throw new Error('Log in to send a message')
    const result = await convex.mutation(api.messages.sendListingMessage, {
      userEmail: userStore.user.email,
      listingId: listingId as any,
      body,
    })
    await loadConversations()
    return result as { conversationId: string; created: boolean }
  }

  return {
    conversations,
    currentMessages,
    selectedConversationId,
    selectedConversation,
    unreadCount,
    loadingConversations,
    loadingThread,
    sending,
    loadConversations,
    openConversation,
    backToList,
    sendReply,
    sendListingMessage,
  }
})
