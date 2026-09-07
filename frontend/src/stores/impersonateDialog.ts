import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useImpersonateDialogStore = defineStore('impersonateDialog', () => {
  const open = ref(false)

  function show() {
    open.value = true
  }

  function hide() {
    open.value = false
  }

  return { open, show, hide }
})
