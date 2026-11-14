<template>
  <AuthPanel title="Forgot password" subtitle="We'll email you a link to reset your password">
    <div v-if="submitted" class="space-y-4">
      <p class="text-sm text-foreground">
        If an account exists for <span class="font-medium">{{ submittedEmail }}</span>,
        we've sent a password reset link to that email.
      </p>
      <p class="text-sm text-muted-foreground">
        The link expires in 1 hour. If you don't see it, check your spam folder.
      </p>
      <Button variant="outline" class="w-full" @click="reset">Send another link</Button>
      <p class="auth-footer-text">
        <router-link to="/login" class="auth-link">Back to Log In</router-link>
      </p>
    </div>

    <form v-else class="space-y-4" @submit.prevent="handleSubmit">
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
      <div v-if="cleanError" class="text-sm text-destructive">{{ cleanError }}</div>
      <Button type="submit" :loading="isLoading" loading-text="Sending..." class="w-full">
        Send reset link
      </Button>
      <p class="auth-footer-text">
        <router-link to="/login" class="auth-link">Back to Log In</router-link>
      </p>
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
