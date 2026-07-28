<template>
  <AuthPanel>
    <h1 class="auth-title">Forgot password</h1>
    <p class="auth-subtitle">We'll email you a link to reset your password</p>

    <div v-if="submitted" class="space-y-4">
      <p class="text-sm text-foreground">
        If an account exists for <span class="font-medium">{{ submittedEmail }}</span>,
        we've sent a password reset link to that email.
      </p>
      <p class="text-sm text-muted-foreground">
        The link expires in 1 hour. If you don't see it, check your spam folder.
      </p>
      <Button variant="outline" class="w-full" @click="reset">Send another link</Button>
      <div class="auth-footer-text pt-2">
        <router-link to="/login" class="auth-link">Back to Log In</router-link>
      </div>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-4">
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
      <div v-if="cleanError" class="text-sm text-destructive">{{ cleanError }}</div>
      <Button type="submit" :loading="isLoading" loading-text="Sending..." class="w-full">
        Send reset link
      </Button>
      <div class="auth-footer-text pt-2">
        <router-link to="/login" class="auth-link">Back to Log In</router-link>
      </div>
    </form>
  </AuthPanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import AuthPanel from '@/components/layout/AuthPanel.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import { friendlyAuthError } from '@/lib/authErrors'

const email = ref('')
const submitted = ref(false)
const submittedEmail = ref('')
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const cleanError = computed(() => friendlyAuthError(errorMessage.value))

function reset() {
  submitted.value = false
  submittedEmail.value = ''
  errorMessage.value = null
}

async function handleSubmit() {
  isLoading.value = true
  errorMessage.value = null
  try {
    await convex.mutation(api.auth.requestPasswordReset, { email: email.value })
    submittedEmail.value = email.value
    submitted.value = true
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Could not send reset link'
  } finally {
    isLoading.value = false
  }
}
</script>
