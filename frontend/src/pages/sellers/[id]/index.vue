<template>
  <div v-if="loading" class="text-muted-foreground">Loading seller…</div>
  <div v-else-if="!org" class="text-center py-16">Seller not found</div>
  <div v-else>
    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold">{{ org.name }}</h1>
        <p v-if="org.url" class="text-sm text-muted-foreground mt-1">
          <a :href="org.url" target="_blank" rel="noopener" class="text-primary hover:underline">{{ org.url }}</a>
        </p>
        <p v-if="org.phone" class="text-sm text-muted-foreground mt-1">{{ org.phone }}</p>
      </div>
      <Button
        v-if="canManage"
        @click="openCreate"
      >
        Add listing
      </Button>
    </div>

    <div v-if="canManage && !userStore.user?.isApproved" class="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20 p-4 text-sm">
      Your seller account is pending approval. You can draft listings, but they won't go live until an admin approves your account and each listing.
    </div>

    <div v-if="canManage" class="flex gap-2 mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
        :class="activeTab === tab.id ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="visibleListings.length === 0" class="text-muted-foreground py-12 text-center">
      No listings in this section.
    </div>
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="listing in visibleListings" :key="listing._id" class="relative">
        <ListingCard :listing="listing" />
        <div v-if="canManage" class="mt-2 flex gap-2">
          <Button size="sm" variant="outline" @click="editListing(listing)">Edit</Button>
          <Button
            v-if="listing.status !== 'ARCHIVED'"
            size="sm"
            variant="outline"
            @click="archiveListing(listing._id)"
          >
            Archive
          </Button>
        </div>
        <span
          v-if="canManage && listing.status !== 'APPROVED'"
          class="absolute top-3 right-3 text-xs font-medium px-2 py-1 rounded-full bg-background/90 border"
        >
          {{ listing.status }}
        </span>
      </div>
    </div>

    <ListingModal
      :open="modalOpen"
      :user-email="userStore.user?.email ?? ''"
      :listing="editingListing"
      @close="modalOpen = false"
      @saved="loadListings"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import { useUserStore } from '@/stores/user'
import Button from '@/components/ui/Button.vue'
import ListingCard from '@/components/listings/ListingCard.vue'
import ListingModal from '@/components/listings/ListingModal.vue'

const route = useRoute()
const userStore = useUserStore()

const org = ref<any>(null)
const listings = ref<any[]>([])
const loading = ref(true)
const activeTab = ref<'APPROVED' | 'PENDING' | 'ARCHIVED'>('APPROVED')
const modalOpen = ref(false)
const editingListing = ref<any | null>(null)

const orgId = computed(() => route.params.id as string)
const canManage = computed(
  () => userStore.user?.organizationId === orgId.value && userStore.isSeller,
)

const tabs = [
  { id: 'APPROVED' as const, label: 'Live' },
  { id: 'PENDING' as const, label: 'Pending' },
  { id: 'ARCHIVED' as const, label: 'Archived' },
]

const visibleListings = computed(() =>
  listings.value.filter((l) => l.status === activeTab.value),
)

async function loadOrg() {
  org.value = await convex.query(api.organizations.getOrganization, {
    organizationId: orgId.value as any,
  })
}

async function loadListings() {
  listings.value = (await convex.query(api.listings.getOrganizationListings, {
    organizationId: orgId.value as any,
    userEmail: userStore.user?.email,
    includeNonPublic: true,
  })) as any[]
}

function openCreate() {
  editingListing.value = null
  modalOpen.value = true
}

function editListing(listing: any) {
  editingListing.value = listing
  modalOpen.value = true
}

async function archiveListing(listingId: string) {
  if (!userStore.user?.email) return
  await convex.mutation(api.listings.updateListing, {
    userEmail: userStore.user.email,
    listingId: listingId as any,
    status: 'ARCHIVED',
  })
  await loadListings()
}

onMounted(async () => {
  try {
    await loadOrg()
    await loadListings()
  } finally {
    loading.value = false
  }
})
</script>
