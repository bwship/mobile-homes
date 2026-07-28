import { defineStore } from 'pinia'
import { ref } from 'vue'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import { useUserStore } from './user'

export const useAuthStore = defineStore('auth', () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const userStore = useUserStore()

  const login = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null
    try {
      userStore.clearUser()
      const user = await convex.mutation(api.auth.login, { email, password })
      if (!user) throw new Error('Invalid email or password')
      userStore.setUser(user as any)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: 'SELLER' | 'BUYER',
    organizationName?: string,
    organizationUrl?: string,
  ) => {
    isLoading.value = true
    error.value = null
    try {
      const newUser = await convex.mutation(api.auth.signup, {
        email,
        password,
        name,
        role,
        organizationName,
        organizationUrl,
      })
      if (newUser) userStore.setUser(newUser as any)
      return newUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Signup failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    userStore.clearUser()
  }

  return { isLoading, error, login, signup, logout }
})
