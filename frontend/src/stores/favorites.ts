import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import { useUserStore } from '@/stores/user'

export const useFavoritesStore = defineStore('favorites', () => {
  const userStore = useUserStore()
  const count = ref(0)
  const loading = ref(false)

  async function refresh() {
    if (!userStore.user?.email) {
      count.value = 0
      return
    }
    loading.value = true
    try {
      count.value = Number(
        await convex.query(api.favorites.getFavoritesCount, {
          userEmail: userStore.user.email,
        }),
      ) || 0
    } catch {
      count.value = 0
    } finally {
      loading.value = false
    }
  }

  watch(
    () => userStore.user?.email,
    () => {
      void refresh()
    },
    { immediate: true },
  )

  return { count, loading, refresh }
})
