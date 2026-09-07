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
  role: 'CUSTOMER' | 'DEALER' | 'ADMIN'
  isApproved: boolean
  createdAt: number
  organizationId?: string
}

const STORAGE_KEY = 'mhm_user'
const REAL_ADMIN_KEY = 'mhm_real_admin'

function normalizeRole(role: string | undefined): User['role'] {
  if (role === 'ADMIN') return 'ADMIN'
  if (role === 'DEALER' || role === 'SELLER') return 'DEALER'
  return 'CUSTOMER'
}

function normalizeUser(raw: any): User {
  return { ...raw, role: normalizeRole(raw?.role) }
}

function readJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown | null) {
  if (typeof window === 'undefined') return
  try {
    if (value) localStorage.setItem(key, JSON.stringify(value))
    else localStorage.removeItem(key)
  } catch (err) {
    console.error('Failed to save', key, err)
  }
}

export const useUserStore = defineStore('user', () => {
  const stored = readJson<any>(STORAGE_KEY)
  const storedAdmin = readJson<any>(REAL_ADMIN_KEY)

  const user = ref<User | null>(stored ? normalizeUser(stored) : null)
  const realAdmin = ref<User | null>(storedAdmin ? normalizeUser(storedAdmin) : null)
  const isLoading = ref(false)

  watch(user, (v) => writeJson(STORAGE_KEY, v), { deep: true })
  watch(realAdmin, (v) => writeJson(REAL_ADMIN_KEY, v), { deep: true })

  const fetchUserByEmail = async (email: string) => {
    isLoading.value = true
    try {
      const fetched = await convex.query(api.users.getUserByEmail, {
        email: email.trim().toLowerCase(),
      })
      if (fetched) {
        const normalized = normalizeUser(fetched)
        user.value = normalized
        return normalized
      }
      return null
    } finally {
      isLoading.value = false
    }
  }

  const setUser = (newUser: User | null) => {
    user.value = newUser ? normalizeUser(newUser) : null
    // Fresh login clears any prior impersonation session.
    realAdmin.value = null
  }

  const clearUser = () => {
    user.value = null
    realAdmin.value = null
  }

  const isImpersonating = computed(
    () => Boolean(realAdmin.value && user.value && realAdmin.value._id !== user.value._id),
  )

  /** True when the real session (not impersonated) is an admin. */
  const canAccessAdmin = computed(
    () =>
      Boolean(realAdmin.value?.role === 'ADMIN') ||
      Boolean(!isImpersonating.value && user.value?.role === 'ADMIN'),
  )

  /** Email for admin API calls — stays the real admin while impersonating. */
  const adminApiEmail = computed(() => {
    if (realAdmin.value?.email) return realAdmin.value.email
    if (user.value?.role === 'ADMIN') return user.value.email
    return undefined
  })

  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isDealer = computed(() => user.value?.role === 'DEALER')
  const isCustomer = computed(() => user.value?.role === 'CUSTOMER')
  const isSeller = computed(() => user.value?.role === 'DEALER')

  async function startImpersonation(targetEmail: string) {
    const adminSession =
      realAdmin.value ??
      (user.value?.role === 'ADMIN' ? user.value : null)
    if (!adminSession) throw new Error('Only admins can impersonate')

    const target = await convex.query(api.users.getUserByEmail, {
      email: targetEmail.trim().toLowerCase(),
    })
    if (!target) throw new Error('User not found')

    if (!realAdmin.value) realAdmin.value = adminSession
    user.value = normalizeUser(target)
  }

  function stopImpersonation() {
    if (!realAdmin.value) return
    user.value = realAdmin.value
    realAdmin.value = null
  }

  return {
    user,
    realAdmin,
    isLoading,
    isAdmin,
    isDealer,
    isCustomer,
    isSeller,
    isImpersonating,
    canAccessAdmin,
    adminApiEmail,
    fetchUserByEmail,
    setUser,
    clearUser,
    startImpersonation,
    stopImpersonation,
  }
})
