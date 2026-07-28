<template>
  <div>
    <h1 class="text-3xl font-bold mb-2">Pending listings</h1>
    <p class="text-muted-foreground mb-8">Review and approve seller submissions.</p>

    <div v-if="!userStore.isAdmin" class="text-destructive">Admin access required.</div>
    <div v-else-if="loading" class="text-muted-foreground">Loading…</div>
    <div v-else-if="listings.length === 0" class="text-muted-foreground">No pending listings.</div>
    <div v-else class="space-y-4">
      <Card v-for="listing in listings" :key="listing._id">
        <CardContent class="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 class="font-semibold">{{ listing.title }}</h2>
            <p class="text-sm text-muted-foreground">{{ listing.organizationName }} · {{ listing.city }}, {{ listing.state }}</p>
            <p class="text-sm mt-1">{{ formatListingPrice(listing.priceCents, listing.listingType) }}</p>
          </div>
          <div class="flex gap-2 shrink-0">
            <router-link :to="`/listings/${listing._id}`">
              <Button variant="outline" size="sm">Preview</Button>
            </router-link>
            <Button size="sm" @click="setStatus(listing._id, 'APPROVED')">Approve</Button>
            <Button size="sm" variant="outline" @click="setStatus(listing._id, 'REJECTED')">Reject</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import { useUserStore } from '@/stores/user'
import { formatListingPrice } from '@/lib/listingFormat'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'

const userStore = useUserStore()
const listings = ref<any[]>([])
const loading = ref(true)

async function load() {
  if (!userStore.user?.email) return
  listings.value = (await convex.query(api.listings.getPendingListings, {
    adminEmail: userStore.user.email,
  })) as any[]
}

async function setStatus(listingId: string, status: 'APPROVED' | 'REJECTED') {
  if (!userStore.user?.email) return
  await convex.mutation(api.listings.adminUpdateListingStatus, {
    adminEmail: userStore.user.email,
    listingId: listingId as any,
    status,
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
</script>
