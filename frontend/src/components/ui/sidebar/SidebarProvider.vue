<script setup lang="ts">
import { onMounted, onUnmounted, provide, ref, watch } from 'vue'
import { SIDEBAR_KEY, type SidebarState } from './types'

const STORAGE_KEY = 'mhm_sidebar_state'

function readStoredState(): SidebarState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'collapsed' || stored === 'expanded') return stored
  } catch {}
  return 'expanded'
}

const state = ref<SidebarState>(readStoredState())
const isMobile = ref(false)
const mobileOpen = ref(false)

function updateIsMobile() {
  isMobile.value = window.matchMedia('(max-width: 767px)').matches
  if (!isMobile.value) mobileOpen.value = false
}

const toggleSidebar = () => {
  if (isMobile.value) {
    mobileOpen.value = !mobileOpen.value
    return
  }
  state.value = state.value === 'expanded' ? 'collapsed' : 'expanded'
}

const setMobileOpen = (open: boolean) => {
  mobileOpen.value = open
}

watch(state, (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {}
})

onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile)
})

provide(SIDEBAR_KEY, {
  state,
  isMobile,
  mobileOpen,
  toggleSidebar,
  setMobileOpen,
})
</script>

<template>
  <slot />
</template>
