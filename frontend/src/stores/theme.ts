import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import { useUserStore } from './user'

type Theme = 'light' | 'dark' | 'system'
const STORAGE_KEY = 'mhm_theme'

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {}
  return 'system'
}

function getSystemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(theme: Theme) {
  const isDark = theme === 'dark' || (theme === 'system' && getSystemPrefersDark())
  document.documentElement.classList.toggle('dark', isDark)
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>(getStoredTheme())
  applyTheme(theme.value)

  const isDark = computed(
    () => theme.value === 'dark' || (theme.value === 'system' && getSystemPrefersDark()),
  )

  watch(theme, (newTheme) => {
    localStorage.setItem(STORAGE_KEY, newTheme)
    applyTheme(newTheme)
  })

  async function setTheme(newTheme: Theme) {
    theme.value = newTheme
    const userStore = useUserStore()
    if (userStore.user?.email) {
      try {
        await convex.mutation(api.users.updateProfile, {
          userEmail: userStore.user.email,
          theme: newTheme,
        })
      } catch (err) {
        console.error('Failed to save theme', err)
      }
    }
  }

  return { theme, isDark, setTheme }
})
