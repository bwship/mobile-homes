import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'

export type User = {
  _id: string
  email: string
  name: string
  phone?: string
  imageUrl?: string
  theme?: 'light' | 'dark' | 'system'
  role: 'CUSTOMER' | 'SELLER' | 'BUYER' | 'ADMIN'
  isApproved: boolean
  createdAt: number
  organizationId?: string
}

const STORAGE_KEY = 'mhm_user'

function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function saveUser(user: User | null) {
  if (typeof window === 'undefined') return
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.error('Failed to save user', err)
  }
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(getStoredUser())
  const isLoading = ref(false)

  watch(user, (v) => saveUser(v), { deep: true })

  const fetchUserByEmail = async (email: string) => {
    isLoading.value = true
    try {
      const fetched = await convex.query(api.users.getUserByEmail, { email: email.trim().toLowerCase() })
      if (fetched) {
        user.value = fetched as User
        return fetched
      }
      return null
    } finally {
      isLoading.value = false
    }
  }

  const setUser = (newUser: User | null) => {
    user.value = newUser
  }

  const clearUser = () => {
    user.value = null
  }

  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isSeller = computed(() => user.value?.role === 'SELLER')

  return { user, isLoading, isAdmin, isSeller, fetchUserByEmail, setUser, clearUser }
})
