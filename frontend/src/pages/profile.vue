<template>
  <div class="container max-w-2xl py-8 md:py-10">
    <div v-if="!userStore.user" class="py-16 text-center">
      <p class="mb-4 text-muted-foreground">Log in to view your profile.</p>
      <router-link to="/login">
        <Button>Log in</Button>
      </router-link>
    </div>

    <div v-else>
      <h1 class="mb-1 text-3xl font-extrabold tracking-tight">Profile</h1>
      <p class="mb-8 text-muted-foreground">Manage your account details.</p>

      <form class="space-y-5 rounded-2xl border border-border/60 bg-card p-6" @submit.prevent="save">
        <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div class="relative">
            <div
              class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-border bg-primary text-2xl font-black text-white"
            >
              <img
                v-if="previewUrl || userStore.user.imageUrl"
                :src="previewUrl || userStore.user.imageUrl"
                alt="Profile"
                class="h-full w-full object-cover"
              />
              <span v-else>{{ initials }}</span>
            </div>
          </div>
          <div class="min-w-0 flex-1 space-y-2">
            <label class="block text-sm font-medium">Profile photo</label>
            <div class="flex flex-wrap gap-2">
              <label class="inline-flex cursor-pointer items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted">
                {{ uploading ? 'Uploading…' : 'Upload photo' }}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  class="hidden"
                  :disabled="uploading"
                  @change="onFileChange"
                />
              </label>
              <Button
                v-if="previewUrl || userStore.user.imageUrl || pendingStorageId"
                type="button"
                variant="outline"
                size="sm"
                @click="removePhoto"
              >
                Remove
              </Button>
            </div>
            <p class="text-xs text-muted-foreground">JPG, PNG, or WebP. Max 5MB.</p>
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium">Full name</label>
          <Input v-model="name" required />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium">Email</label>
          <Input :model-value="userStore.user.email" disabled class="opacity-70" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium">Phone</label>
          <Input v-model="phone" type="tel" placeholder="Optional" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium">Role</label>
          <Input :model-value="roleLabel" disabled class="opacity-70" />
        </div>

        <p v-if="message" class="text-sm" :class="error ? 'text-destructive' : 'text-primary'">
          {{ message }}
        </p>

        <Button type="submit" :loading="saving" loading-text="Saving…">Save changes</Button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import { useUserStore } from '@/stores/user'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const userStore = useUserStore()

const name = ref(userStore.user?.name ?? '')
const phone = ref(userStore.user?.phone ?? '')
const saving = ref(false)
const uploading = ref(false)
const message = ref('')
const error = ref(false)
const previewUrl = ref<string | null>(null)
const pendingStorageId = ref<string | null>(null)
const clearImage = ref(false)

watch(
  () => userStore.user,
  (u) => {
    if (!u) return
    name.value = u.name
    phone.value = u.phone ?? ''
  },
)

const initials = computed(() => {
  const n = userStore.user?.name ?? '?'
  return n
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
})

const roleLabel = computed(() => {
  const role = userStore.user?.role
  if (role === 'ADMIN') return 'Admin'
  if (role === 'DEALER') return 'Dealer'
  return 'Customer'
})

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !userStore.user?.email) return

  if (file.size > 5 * 1024 * 1024) {
    error.value = true
    message.value = 'Photo must be under 5MB.'
    return
  }

  uploading.value = true
  message.value = ''
  error.value = false
  try {
    const uploadUrl = await convex.mutation(api.files.generateUploadUrl, {})
    const result = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    })
    if (!result.ok) throw new Error('Upload failed')
    const { storageId } = await result.json()
    pendingStorageId.value = storageId
    clearImage.value = false
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = URL.createObjectURL(file)
  } catch (err) {
    error.value = true
    message.value = err instanceof Error ? err.message : 'Could not upload photo'
  } finally {
    uploading.value = false
  }
}

function removePhoto() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
  pendingStorageId.value = null
  clearImage.value = true
}

async function save() {
  if (!userStore.user?.email) return
  saving.value = true
  message.value = ''
  error.value = false
  try {
    const updated = await convex.mutation(api.users.updateProfile, {
      userEmail: userStore.user.email,
      name: name.value,
      phone: phone.value || undefined,
      ...(pendingStorageId.value
        ? { imageStorageId: pendingStorageId.value as any }
        : {}),
      ...(clearImage.value ? { clearImage: true } : {}),
    })
    if (updated) userStore.setUser(updated as any)
    pendingStorageId.value = null
    clearImage.value = false
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = null
    }
    message.value = 'Profile saved.'
  } catch (err) {
    error.value = true
    message.value = err instanceof Error ? err.message : 'Could not save profile'
  } finally {
    saving.value = false
  }
}
</script>
