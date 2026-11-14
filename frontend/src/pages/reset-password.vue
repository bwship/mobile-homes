<template>
  <AuthPanel title="Reset password" subtitle="Choose a new password for your account.">
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <label for="password" class="auth-field-label mb-0">New password</label>
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
            required
            autocomplete="new-password"
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
      <div v-if="error" class="text-sm text-destructive">{{ error }}</div>
      <Button type="submit" class="w-full" :loading="loading" loading-text="Saving…">
        Update password
      </Button>
      <p class="auth-footer-text">
        <router-link to="/login" class="auth-link">Back to Log In</router-link>
      </p>
    </form>
  </AuthPanel>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import AuthPanel from '@/components/layout/AuthPanel.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const route = useRoute()
const router = useRouter()
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

async function handleSubmit() {
  const token = route.query.token as string
  if (!token) {
    error.value = 'Invalid reset link'
    return
  }
  loading.value = true
  error.value = null
  try {
    await convex.mutation(api.auth.resetPassword, { token, newPassword: password.value })
    router.push('/login')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Could not reset password'
  } finally {
    loading.value = false
  }
}
</script>
