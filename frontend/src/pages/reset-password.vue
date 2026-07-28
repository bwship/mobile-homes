<template>
  <AuthPanel>
    <h1 class="auth-title">Reset password</h1>
    <p class="auth-subtitle">Choose a new password for your account.</p>
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label for="password" class="auth-field-label">New password</label>
        <Input id="password" v-model="password" type="password" required autocomplete="new-password" />
      </div>
      <div v-if="error" class="text-sm text-destructive">{{ error }}</div>
      <Button type="submit" class="w-full" :loading="loading" loading-text="Saving…">Update password</Button>
      <div class="auth-footer-text pt-2">
        <router-link to="/login" class="auth-link">Back to Log In</router-link>
      </div>
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
