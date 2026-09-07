import { defineStore } from 'pinia'
import { ref } from 'vue'

export type InboxTab = 'notifications' | 'messages'

export const useInboxStore = defineStore('inbox', () => {
  const isOpen = ref(false)
  const activeTab = ref<InboxTab>('notifications')
  const pendingConversationId = ref<string | null>(null)

  function open(tab: InboxTab = 'notifications', conversationId?: string | null) {
    activeTab.value = tab
    pendingConversationId.value = conversationId ?? null
    isOpen.value = true
  }

  function toggle(tab: InboxTab = 'notifications') {
    if (isOpen.value && activeTab.value === tab) {
      isOpen.value = false
      pendingConversationId.value = null
    } else {
      activeTab.value = tab
      isOpen.value = true
    }
  }

  function close() {
    isOpen.value = false
    pendingConversationId.value = null
  }

  return {
    isOpen,
    activeTab,
    pendingConversationId,
    open,
    toggle,
    close,
  }
})
