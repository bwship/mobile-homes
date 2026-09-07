<template>
  <div class="container py-6 md:py-8">
    <div class="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="mb-2 text-3xl font-bold">Dealers</h1>
        <p class="text-muted-foreground">
          Dealer companies on the marketplace. Open a dealer to view their company page and manage listings.
        </p>
      </div>
      <Button v-if="userStore.canAccessAdmin" @click="openCreate">+ Add dealer</Button>
    </div>

    <div v-if="!userStore.canAccessAdmin" class="text-destructive">Admin access required.</div>
    <div v-else>
      <div class="mb-4 flex flex-wrap items-center gap-3">
        <div class="relative min-w-[200px] max-w-xs flex-1">
          <svg
            class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
            />
          </svg>
          <Input
            v-model="query"
            placeholder="Filter dealers…"
            class="pl-9"
          />
        </div>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            class="rounded-full border px-3 py-1 text-xs font-semibold transition-colors"
            :class="
              filter === tab.id
                ? 'border-primary bg-primary text-white'
                : 'border-border text-muted-foreground hover:text-foreground'
            "
            @click="filter = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-muted-foreground">Loading…</div>
      <div v-else-if="filtered.length === 0" class="text-muted-foreground">No dealers found.</div>
      <div v-else class="overflow-hidden rounded-xl border border-border">
        <router-link
          v-for="org in filtered"
          :key="org._id"
          :to="`/dealers/${org._id}`"
          class="group flex items-center gap-4 border-b border-border px-4 py-3.5 transition-colors last:border-b-0 hover:bg-muted/50"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background text-sm font-black text-primary"
          >
            <img
              v-if="org.imageUrl"
              :src="org.imageUrl"
              :alt="org.name"
              class="h-full w-full object-contain p-1.5"
            />
            <span v-else>{{ orgInitials(org.name) }}</span>
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="truncate font-semibold group-hover:text-primary">{{ org.name }}</h2>
              <span
                class="rounded-full px-2 py-0.5 text-[11px] font-bold uppercase"
                :class="
                  org.ownerApproved
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                "
              >
                {{ org.ownerApproved ? 'Approved' : 'Pending' }}
              </span>
            </div>
            <p class="mt-0.5 truncate text-sm text-muted-foreground">
              {{ org.owner?.name ?? 'No owner' }}
              <span v-if="org.owner?.email"> · {{ org.owner.email }}</span>
            </p>
            <div class="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span><strong class="text-foreground">{{ org.memberCount }}</strong> members</span>
              <span><strong class="text-foreground">{{ org.approvedListingCount }}</strong> live</span>
              <span><strong class="text-foreground">{{ org.pendingListingCount }}</strong> pending</span>
            </div>
          </div>

          <Button
            v-if="!org.ownerApproved"
            size="sm"
            class="shrink-0"
            @click.prevent.stop="approve(org._id)"
          >
            Approve
          </Button>

          <svg
            class="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </router-link>
      </div>
    </div>

    <!-- Add dealer stepper -->
    <div
      v-if="createOpen"
      class="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
    >
      <div class="absolute inset-0 bg-black/50" @click="closeCreate" />
      <div
        class="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-xl sm:rounded-2xl"
      >
        <div class="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 class="text-lg font-semibold">Add dealer</h2>
            <p class="mt-0.5 text-xs text-muted-foreground">
              Step {{ step }} of 2 · {{ step === 1 ? 'Company profile' : 'Invite team' }}
            </p>
          </div>
          <button type="button" class="text-muted-foreground hover:text-foreground" @click="closeCreate">
            ✕
          </button>
        </div>

        <div class="border-b border-border px-6 py-3">
          <div class="flex items-center gap-2">
            <div
              class="h-1.5 flex-1 rounded-full transition-colors"
              :class="step >= 1 ? 'bg-primary' : 'bg-muted'"
            />
            <div
              class="h-1.5 flex-1 rounded-full transition-colors"
              :class="step >= 2 ? 'bg-primary' : 'bg-muted'"
            />
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <!-- Step 1: profile -->
          <form v-if="step === 1" class="space-y-4" @submit.prevent="saveStep1">
            <div class="flex items-center gap-4">
              <button
                type="button"
                class="group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted/40 text-sm font-black text-primary transition-colors hover:border-primary/50"
                :disabled="uploadingLogo"
                @click="logoInputRef?.click()"
              >
                <img
                  v-if="logoPreview"
                  :src="logoPreview"
                  alt="Logo preview"
                  class="h-full w-full object-contain p-1.5"
                />
                <span v-else class="px-2 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {{ uploadingLogo ? '…' : 'Logo' }}
                </span>
              </button>
              <div class="min-w-0 flex-1 space-y-1">
                <p class="text-sm font-medium">Company logo</p>
                <p class="text-xs text-muted-foreground">Optional. Click to upload (max 5MB).</p>
                <button
                  v-if="logoPreview || pendingLogoId"
                  type="button"
                  class="text-xs font-semibold text-destructive hover:underline"
                  @click="clearLogo"
                >
                  Remove
                </button>
              </div>
              <input
                ref="logoInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onLogoSelected"
              />
            </div>

            <div>
              <label class="auth-field-label">Company name</label>
              <Input v-model="form.name" required placeholder="Sunshine Mobile Homes" />
            </div>
            <div>
              <label class="auth-field-label">Phone</label>
              <Input
                :model-value="form.phone"
                type="tel"
                inputmode="tel"
                placeholder="(555) 010-0100"
                @update:model-value="form.phone = formatPhone(String($event))"
              />
            </div>
            <div>
              <label class="auth-field-label">Website</label>
              <Input v-model="form.url" type="url" placeholder="https://" />
            </div>
            <div>
              <label class="auth-field-label">About</label>
              <textarea
                v-model="form.description"
                rows="4"
                class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Tell buyers about this dealership…"
              />
            </div>

            <p v-if="stepError" class="text-sm text-destructive">{{ stepError }}</p>

            <div class="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" @click="closeCreate">Cancel</Button>
              <Button type="submit" :disabled="savingStep1" class="gap-1.5">
                <template v-if="savingStep1">Creating…</template>
                <template v-else>
                  Continue
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </template>
              </Button>
            </div>
          </form>

          <!-- Step 2: invites -->
          <div v-else class="space-y-5">
            <div>
              <p class="text-sm text-muted-foreground">
                <span class="font-semibold text-foreground">{{ form.name }}</span> is created. Add people to invite,
                then send them all at once — or skip for now.
              </p>
            </div>

            <form class="space-y-3 rounded-xl border border-border p-4" @submit.prevent="addContact">
              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label class="auth-field-label">Name</label>
                  <Input v-model="inviteForm.name" required placeholder="Jordan Lee" />
                </div>
                <div>
                  <label class="auth-field-label">Email</label>
                  <Input v-model="inviteForm.email" type="email" required placeholder="jordan@example.com" />
                </div>
              </div>
              <div class="flex flex-wrap items-end gap-3">
                <div class="min-w-[140px] flex-1">
                  <label class="auth-field-label">Role</label>
                  <select
                    v-model="inviteForm.role"
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="OWNER" :disabled="contacts.some((c) => c.role === 'OWNER')">Owner</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MEMBER">Member</option>
                  </select>
                </div>
                <Button type="submit" variant="outline" class="shrink-0">+ Add</Button>
              </div>
              <p v-if="inviteMessage" class="text-sm" :class="inviteError ? 'text-destructive' : 'text-muted-foreground'">
                {{ inviteMessage }}
              </p>
            </form>

            <ul v-if="contacts.length" class="divide-y divide-border rounded-xl border border-border">
              <li
                v-for="(row, idx) in contacts"
                :key="row.email + idx"
                class="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
              >
                <div class="min-w-0">
                  <p class="truncate font-medium">{{ row.name }}</p>
                  <p class="truncate text-xs text-muted-foreground">{{ row.email }} · {{ row.role }}</p>
                </div>
                <button
                  type="button"
                  class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                  aria-label="Remove contact"
                  title="Remove"
                  @click="removeContact(idx)"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                </button>
              </li>
            </ul>
            <p v-else class="text-center text-sm text-muted-foreground">No contacts added yet.</p>

            <div class="flex justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" :disabled="inviting" @click="skipInvites">
                Skip for now
              </Button>
              <Button
                type="button"
                :disabled="inviting || contacts.length === 0"
                @click="sendAllInvites"
              >
                {{ inviting ? 'Sending…' : `Send invites${contacts.length ? ` (${contacts.length})` : ''}` }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import { useUserStore } from '@/stores/user'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import { formatPhone } from '@/lib/utils'

type InviteRole = 'OWNER' | 'ADMIN' | 'MEMBER'
type StagedContact = { name: string; email: string; role: InviteRole }

const router = useRouter()
const userStore = useUserStore()
const orgs = ref<any[]>([])
const loading = ref(true)
const query = ref('')
const filter = ref<'all' | 'pending' | 'approved'>('all')

const createOpen = ref(false)
const step = ref(1)
const savingStep1 = ref(false)
const stepError = ref('')
const form = ref({ name: '', phone: '', url: '', description: '' })
const logoInputRef = ref<HTMLInputElement | null>(null)
const logoPreview = ref<string | null>(null)
const pendingLogoId = ref<string | null>(null)
const uploadingLogo = ref(false)
const createdOrgId = ref<string | null>(null)

const inviteForm = ref<StagedContact>({
  name: '',
  email: '',
  role: 'OWNER',
})
const contacts = ref<StagedContact[]>([])
const inviting = ref(false)
const inviteMessage = ref('')
const inviteError = ref(false)

const tabs = [
  { id: 'all' as const, label: 'All' },
  { id: 'pending' as const, label: 'Pending' },
  { id: 'approved' as const, label: 'Approved' },
]

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return orgs.value.filter((org) => {
    if (filter.value === 'pending' && org.ownerApproved) return false
    if (filter.value === 'approved' && !org.ownerApproved) return false
    if (!q) return true
    return `${org.name} ${org.owner?.name ?? ''} ${org.owner?.email ?? ''}`.toLowerCase().includes(q)
  })
})

function orgInitials(name: string) {
  return String(name || 'D')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function resetInviteForm() {
  inviteForm.value = {
    name: '',
    email: '',
    role: contacts.value.some((c) => c.role === 'OWNER') ? 'MEMBER' : 'OWNER',
  }
}

function openCreate() {
  step.value = 1
  stepError.value = ''
  form.value = { name: '', phone: '', url: '', description: '' }
  clearLogo()
  createdOrgId.value = null
  contacts.value = []
  resetInviteForm()
  inviteMessage.value = ''
  inviteError.value = false
  createOpen.value = true
}

function closeCreate() {
  createOpen.value = false
  if (createdOrgId.value) load()
}

async function goToDealerPage() {
  const id = createdOrgId.value
  createOpen.value = false
  await load()
  if (id) await router.push(`/dealers/${id}`)
}

function addContact() {
  inviteMessage.value = ''
  inviteError.value = false
  const name = inviteForm.value.name.trim()
  const email = inviteForm.value.email.trim().toLowerCase()
  const role = inviteForm.value.role
  if (!name || !email || !email.includes('@')) {
    inviteError.value = true
    inviteMessage.value = 'Enter a valid name and email.'
    return
  }
  if (contacts.value.some((c) => c.email === email)) {
    inviteError.value = true
    inviteMessage.value = 'That email is already in the list.'
    return
  }
  if (role === 'OWNER' && contacts.value.some((c) => c.role === 'OWNER')) {
    inviteError.value = true
    inviteMessage.value = 'Only one owner can be invited.'
    return
  }
  contacts.value.push({ name, email, role })
  resetInviteForm()
}

function removeContact(index: number) {
  contacts.value.splice(index, 1)
  if (!contacts.value.some((c) => c.role === 'OWNER') && inviteForm.value.role !== 'OWNER') {
    inviteForm.value.role = 'OWNER'
  }
}

async function skipInvites() {
  await goToDealerPage()
}

async function sendAllInvites() {
  const email = userStore.adminApiEmail
  if (!email || !createdOrgId.value || contacts.value.length === 0) return
  inviting.value = true
  inviteMessage.value = ''
  inviteError.value = false
  try {
    for (const contact of contacts.value) {
      await convex.mutation(api.organizations.inviteTeamMember, {
        userEmail: email,
        organizationId: createdOrgId.value as any,
        name: contact.name,
        email: contact.email,
        role: contact.role,
      })
    }
    await goToDealerPage()
  } catch (err) {
    inviteError.value = true
    inviteMessage.value = err instanceof Error ? err.message : 'Could not send invites'
  } finally {
    inviting.value = false
  }
}

function clearLogo() {
  if (logoPreview.value) URL.revokeObjectURL(logoPreview.value)
  logoPreview.value = null
  pendingLogoId.value = null
}

async function onLogoSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    stepError.value = 'Please choose an image file.'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    stepError.value = 'Logo must be under 5MB.'
    return
  }
  uploadingLogo.value = true
  stepError.value = ''
  try {
    const uploadUrl = await convex.mutation(api.files.generateUploadUrl, {})
    const result = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    })
    if (!result.ok) throw new Error('Upload failed')
    const { storageId } = await result.json()
    pendingLogoId.value = storageId
    if (logoPreview.value) URL.revokeObjectURL(logoPreview.value)
    logoPreview.value = URL.createObjectURL(file)
  } catch (err) {
    stepError.value = err instanceof Error ? err.message : 'Could not upload logo'
  } finally {
    uploadingLogo.value = false
  }
}

async function saveStep1() {
  if (!userStore.adminApiEmail) return
  savingStep1.value = true
  stepError.value = ''
  try {
    const org = await convex.mutation(api.organizations.createDealer, {
      adminEmail: userStore.adminApiEmail,
      name: form.value.name,
      phone: form.value.phone || undefined,
      url: form.value.url || undefined,
      description: form.value.description || undefined,
      ...(pendingLogoId.value ? { imageStorageId: pendingLogoId.value as any } : {}),
    })
    createdOrgId.value = org._id
    step.value = 2
    await load()
  } catch (err) {
    stepError.value = err instanceof Error ? err.message : 'Could not create dealer'
  } finally {
    savingStep1.value = false
  }
}

async function load() {
  if (!userStore.adminApiEmail) return
  orgs.value = (await convex.query(api.organizations.getAllOrganizationsForAdmin, {
    adminEmail: userStore.adminApiEmail,
  })) as any[]
}

async function approve(organizationId: string) {
  if (!userStore.adminApiEmail) return
  await convex.mutation(api.organizations.approveOrganization, {
    adminEmail: userStore.adminApiEmail,
    organizationId: organizationId as any,
  })
  await load()
}

onMounted(async () => {
  try {
    await load()
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (logoPreview.value) URL.revokeObjectURL(logoPreview.value)
})
</script>
