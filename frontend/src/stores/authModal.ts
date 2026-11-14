import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthModalStore = defineStore('authModal', () => {
  const open = ref(false)
  const mode = ref<'login' | 'signup'>('login')
  const reason = ref('Log in to continue.')
  const title = ref<string | null>(null)
  let successHandler: (() => void) | null = null

  function show(opts?: {
    mode?: 'login' | 'signup'
    reason?: string
    title?: string
    onSuccess?: () => void
  }) {
    mode.value = opts?.mode ?? 'login'
    reason.value = opts?.reason ?? 'Log in to continue.'
    title.value = opts?.title ?? null
    successHandler = opts?.onSuccess ?? null
    open.value = true
  }

  function hide() {
    open.value = false
    successHandler = null
  }

  function handleSuccess() {
    const cb = successHandler
    successHandler = null
    open.value = false
    cb?.()
  }

  function requireFavorites() {
    show({
      mode: 'signup',
      title: 'Save this home',
      reason: 'Create a free account or log in to save favorites and find them later.',
    })
  }

  return { open, mode, reason, title, show, hide, handleSuccess, requireFavorites }
})
