<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
    >
      <div class="absolute inset-0 bg-black/70 backdrop-blur-md" @click="emit('close')" />

      <div
        class="relative z-10 max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-border bg-card p-6 shadow-2xl sm:rounded-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
        :aria-label="mode === 'login' ? 'Log in' : 'Create account'"
      >
        <div class="mb-6 flex items-start justify-between gap-3">
          <div>
            <BrandLogo show-wordmark size="sm" :tagline="false" class="mb-4" />
            <h2 class="text-xl font-extrabold tracking-tight">
              {{
                title ||
                (mode === 'login' ? 'Welcome back' : 'Create your free account')
              }}
            </h2>
            <p class="mt-1.5 text-sm text-muted-foreground">
              {{ reason || 'Log in to continue.' }}
            </p>
          </div>
          <button
            type="button"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
            @click="emit('close')"
          >
            ✕
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="submit">
          <div v-if="mode === 'signup'">
            <label class="mb-1.5 block text-sm text-muted-foreground">Full name</label>
            <Input v-model="name" type="text" placeholder="Alex Morgan" autocomplete="name" required />
          </div>

          <div>
            <label class="mb-1.5 block text-sm text-muted-foreground">Email</label>
            <Input v-model="email" type="email" placeholder="you@company.com" autocomplete="email" required />
          </div>

          <div>
            <label class="mb-1.5 block text-sm text-muted-foreground">Password</label>
            <div class="relative">
              <Input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
                class="pr-10"
                required
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <svg v-if="!showPassword" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <div v-if="mode === 'login'" class="mt-2 text-right">
              <router-link to="/forgot-password" class="text-sm font-semibold text-primary hover:underline" @click="emit('close')">
                Forgot password?
              </router-link>
            </div>
          </div>

          <div v-if="mode === 'signup'">
            <label class="mb-1.5 block text-sm text-muted-foreground">I want to</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                class="rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors"
                :class="role === 'BUYER' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'"
                @click="role = 'BUYER'"
              >
                Browse homes
              </button>
              <button
                type="button"
                class="rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors"
                :class="role === 'SELLER' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'"
                @click="role = 'SELLER'"
              >
                List as dealer
              </button>
            </div>
          </div>

          <div v-if="mode === 'signup' && role === 'SELLER'">
            <label class="mb-1.5 block text-sm text-muted-foreground">Company name</label>
            <Input v-model="organizationName" type="text" placeholder="Sunshine Mobile Homes" required />
          </div>

          <div v-if="error" class="text-sm text-destructive">{{ error }}</div>

          <button
            type="submit"
            class="flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
            :disabled="authStore.isLoading || (mode === 'signup' && role === 'SELLER' && !organizationName.trim())"
          >
            {{
              authStore.isLoading
                ? mode === 'login'
                  ? 'Logging in…'
                  : 'Creating account…'
                : mode === 'login'
                  ? 'Log in'
                  : 'Create free account'
            }}
          </button>
        </form>

        <p class="mt-5 text-center text-sm text-muted-foreground">
          <template v-if="mode === 'login'">
            New to MH Marketplace?
            <button type="button" class="font-semibold text-primary hover:underline" @click="switchMode('signup')">
              Create a free account
            </button>
          </template>
          <template v-else>
            Already have an account?
            <button type="button" class="font-semibold text-primary hover:underline" @click="switchMode('login')">
              Log in
            </button>
          </template>
        </p>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BrandLogo from '@/components/BrandLogo.vue'
import Input from '@/components/ui/Input.vue'
import { friendlyAuthError } from '@/lib/authErrors'

const props = withDefaults(
  defineProps<{
    open: boolean
    initialMode?: 'login' | 'signup'
    reason?: string
    title?: string | null
  }>(),
  {
    initialMode: 'login',
    reason: 'Log in to continue.',
    title: null,
  },
)

const emit = defineEmits<{
  close: []
  success: []
}>()

const authStore = useAuthStore()

const mode = ref<'login' | 'signup'>(props.initialMode)
const name = ref('')
const email = ref('')
const password = ref('')
const organizationName = ref('')
const role = ref<'BUYER' | 'SELLER'>('BUYER')
const showPassword = ref(false)
const localError = ref<string | null>(null)

const error = computed(() => localError.value || friendlyAuthError(authStore.error))

watch(
  () => props.open,
  (open) => {
    if (!open) return
    mode.value = props.initialMode
    localError.value = null
    authStore.error = null
    showPassword.value = false
  },
)

function switchMode(next: 'login' | 'signup') {
  mode.value = next
  localError.value = null
  authStore.error = null
}

async function submit() {
  localError.value = null
  try {
    if (mode.value === 'login') {
      await authStore.login(email.value, password.value)
    } else {
      await authStore.signup(
        email.value,
        password.value,
        name.value,
        role.value,
        role.value === 'SELLER' ? organizationName.value : undefined,
      )
    }
    emit('success')
  } catch {
    // store surfaces error
  }
}
</script>
