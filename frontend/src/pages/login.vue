<template>
  <AuthPanel>
    <h1 class="auth-title">Log In</h1>
    <p class="auth-subtitle">Welcome back to MH Marketplace</p>
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="email" class="auth-field-label">Email</label>
        <Input
          id="email"
          v-model="email"
          type="email"
          placeholder="you@acme.com"
          autocomplete="email"
          required
        />
      </div>
      <div>
        <label for="password" class="auth-field-label">Password</label>
        <Input
          id="password"
          v-model="password"
          type="password"
          placeholder="••••••••"
          autocomplete="current-password"
          required
        />
      </div>
      <div v-if="cleanError" class="text-sm text-destructive">
        {{ cleanError }}
      </div>
      <Button
        type="submit"
        :loading="authStore.isLoading"
        loading-text="Logging in..."
        class="w-full"
      >
        Log In
      </Button>
      <div class="auth-footer-text pt-1">
        <router-link to="/forgot-password" class="auth-link">
          Forgot password?
        </router-link>
      </div>
      <div class="auth-footer-text pt-2">
        Don't have an account?
        <router-link to="/signup" class="auth-link">Sign up</router-link>
      </div>
    </form>
  </AuthPanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthPanel from '@/components/layout/AuthPanel.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import { friendlyAuthError } from '@/lib/authErrors'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')

const cleanError = computed(() => friendlyAuthError(authStore.error))

const handleSubmit = async () => {
  try {
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch {
    // Error is handled by the store
  }
}
</script>
