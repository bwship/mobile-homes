<template>
  <AuthPanel>
    <h1 class="auth-title">Sign Up</h1>
    <p class="auth-subtitle">Create your MH Marketplace account</p>
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="name" class="auth-field-label">Full Name</label>
        <Input id="name" v-model="name" type="text" placeholder="Jane Doe" autocomplete="name" required />
      </div>
      <div>
        <label for="email" class="auth-field-label">Email</label>
        <Input id="email" v-model="email" type="email" placeholder="you@acme.com" autocomplete="email" required />
      </div>
      <div>
        <label for="password" class="auth-field-label">Password</label>
        <Input id="password" v-model="password" type="password" placeholder="••••••••" autocomplete="new-password" required />
      </div>
      <div>
        <label class="auth-field-label">I want to sign up as a:</label>
        <RoleSelector v-model="role" />
      </div>

      <div v-if="role === 'SELLER'" class="space-y-4 rounded-xl border border-border/60 bg-muted/40 p-4">
        <div>
          <label for="organizationName" class="auth-field-label">
            Company Name <span class="text-destructive">*</span>
          </label>
          <Input id="organizationName" v-model="organizationName" type="text" placeholder="Acme Inc." required />
        </div>
        <div>
          <label for="organizationUrl" class="auth-field-label">Company URL (optional)</label>
          <Input id="organizationUrl" v-model="organizationUrl" type="text" autocomplete="url" placeholder="https://acme.com" />
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
      <div class="auth-footer-text pt-2">
        Already have an account?
        <router-link to="/login" class="auth-link">Log In</router-link>
      </div>
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
