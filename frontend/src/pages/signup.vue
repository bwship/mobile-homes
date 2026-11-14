<template>
  <AuthPanel title="Sign Up" subtitle="Create your MH Marketplace account">
    <form class="space-y-3" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <label for="name" class="auth-field-label mb-0">Full Name</label>
        <div class="relative">
          <svg
            class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <Input
            id="name"
            v-model="name"
            type="text"
            class="pl-9"
            placeholder="Jane Doe"
            autocomplete="name"
            required
          />
        </div>
      </div>

      <div class="space-y-2">
        <label for="email" class="auth-field-label mb-0">Email</label>
        <div class="relative">
          <svg
            class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <Input
            id="email"
            v-model="email"
            type="email"
            class="pl-9"
            placeholder="you@acme.com"
            autocomplete="email"
            required
          />
        </div>
      </div>

      <div class="space-y-2">
        <label for="password" class="auth-field-label mb-0">Password</label>
        <div class="relative">
          <svg
            class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <Input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            class="pl-9 pr-10"
            placeholder="••••••••"
            autocomplete="new-password"
            required
          />
          <button
            type="button"
            class="absolute right-0 top-0 inline-flex h-full items-center px-3 text-muted-foreground hover:text-foreground"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="showPassword = !showPassword"
          >
            <svg v-if="showPassword" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
            <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </div>

      <div class="space-y-2">
        <label class="auth-field-label mb-0">I want to sign up as a:</label>
        <RoleSelector v-model="role" />
      </div>

      <div v-if="role === 'SELLER'" class="space-y-3 rounded-xl border border-border/60 bg-muted/40 p-3">
        <div class="space-y-2">
          <label for="organizationName" class="auth-field-label mb-0">
            Company Name <span class="text-destructive">*</span>
          </label>
          <div class="relative">
            <svg
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1"
              />
            </svg>
            <Input
              id="organizationName"
              v-model="organizationName"
              type="text"
              class="pl-9"
              placeholder="Acme Inc."
              required
            />
          </div>
        </div>
        <div class="space-y-2">
          <label for="organizationUrl" class="auth-field-label mb-0">Company URL (optional)</label>
          <Input
            id="organizationUrl"
            v-model="organizationUrl"
            type="text"
            autocomplete="url"
            placeholder="https://acme.com"
          />
        </div>
      </div>

      <div v-if="cleanError" class="text-sm text-destructive">{{ cleanError }}</div>

      <Button
        type="submit"
        :loading="authStore.isLoading"
        loading-text="Creating account..."
        :disabled="!role || (role === 'SELLER' && !organizationName.trim())"
        class="w-full"
      >
        Sign Up
      </Button>

      <p class="auth-footer-text">
        Already have an account?
        <router-link to="/login" class="auth-link">Log In</router-link>
      </p>
    </form>
  </AuthPanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthPanel from '@/components/layout/AuthPanel.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import RoleSelector from '@/components/RoleSelector.vue'
import { normalizeWebsiteUrl } from '@/lib/url'
import { friendlyAuthError } from '@/lib/authErrors'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const role = ref<'SELLER' | 'BUYER' | null>(
  route.query.role === 'SELLER' ? 'SELLER' : 'BUYER',
)
const organizationName = ref('')
const organizationUrl = ref('')

const cleanError = computed(() => friendlyAuthError(authStore.error))

const handleSubmit = async () => {
  if (!role.value) return
  if (role.value === 'SELLER' && !organizationName.value.trim()) return

  const normalizedUrl = role.value === 'SELLER' ? normalizeWebsiteUrl(organizationUrl.value) : ''

  try {
    await authStore.signup(
      email.value,
      password.value,
      name.value,
      role.value,
      role.value === 'SELLER' ? organizationName.value : undefined,
      role.value === 'SELLER' && normalizedUrl ? normalizedUrl : undefined,
    )
    router.push('/')
  } catch {
    // surfaced via cleanError
  }
}
</script>
