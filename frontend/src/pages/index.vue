<template>
  <div>
    <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-background to-primary/5 border border-border/60 px-6 py-12 md:py-16 mb-10">
      <div class="max-w-3xl">
        <h1 class="text-3xl md:text-5xl font-bold tracking-tight mb-4">
          Buy, sell, or rent manufactured & mobile homes
        </h1>
        <p class="text-muted-foreground text-lg mb-8 max-w-2xl">
          Browse listings on the map, save favorites, and connect with approved sellers across the country.
        </p>

        <form class="flex flex-col sm:flex-row gap-3" @submit.prevent="goSearch">
          <Input v-model="query" placeholder="City, state, or ZIP" class="sm:flex-1 bg-background" />
          <select v-model="listingType" class="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">Sale & rent</option>
            <option value="SALE">For sale</option>
            <option value="RENT">For rent</option>
          </select>
          <Button type="submit" class="shrink-0">Search homes</Button>
        </form>

        <div v-if="stats" class="flex flex-wrap gap-4 mt-8 text-sm">
          <span class="rounded-full bg-background/80 border border-border px-4 py-2 font-medium">
            {{ stats.forSale.toLocaleString() }} for sale
          </span>
          <span class="rounded-full bg-background/80 border border-border px-4 py-2 font-medium">
            {{ stats.forRent.toLocaleString() }} for rent
          </span>
          <span class="rounded-full bg-background/80 border border-border px-4 py-2 font-medium">
            {{ stats.communities.toLocaleString() }} communities
          </span>
        </div>
      </div>
    </section>

    <Card
      v-if="userStore.isSeller && !userStore.user?.isApproved"
      class="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20 mb-8"
    >
      <CardContent class="p-6">
        <h3 class="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Seller account pending approval</h3>
        <p class="text-sm text-yellow-800 dark:text-yellow-200">
          An administrator will review your account before you can publish listings.
        </p>
      </CardContent>
    </Card>

    <section class="grid md:grid-cols-2 gap-6 mb-12">
      <div class="rounded-2xl border border-border/60 p-6 bg-card">
        <h2 class="text-xl font-semibold mb-2">Sell a mobile home</h2>
        <p class="text-sm text-muted-foreground mb-4">List your inventory and reach buyers searching nationwide.</p>
        <router-link to="/signup">
          <Button>List a home</Button>
        </router-link>
      </div>
      <div class="rounded-2xl border border-border/60 p-6 bg-card">
        <h2 class="text-xl font-semibold mb-2">Browse on the map</h2>
        <p class="text-sm text-muted-foreground mb-4">Explore homes for sale and rent with a Redfin-style map view.</p>
        <router-link to="/search">
          <Button variant="outline">Open map search</Button>
        </router-link>
      </div>
    </section>

    <section>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-semibold">Featured homes</h2>
        <router-link to="/search" class="text-sm text-primary font-medium hover:underline">View all</router-link>
      </div>
      <div v-if="loading" class="text-muted-foreground">Loading listings…</div>
      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ListingCard v-for="listing in listings" :key="listing._id" :listing="listing" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import { useUserStore } from '@/stores/user'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import ListingCard from '@/components/listings/ListingCard.vue'

const router = useRouter()
const userStore = useUserStore()

const query = ref('')
const listingType = ref('')
const stats = ref<{ forSale: number; forRent: number; communities: number } | null>(null)
const listings = ref<any[]>([])
const loading = ref(true)

function goSearch() {
  router.push({
    path: '/search',
    query: {
      q: query.value || undefined,
      type: listingType.value || undefined,
    },
  })
}

onMounted(async () => {
  try {
    const [statsRes, listingsRes] = await Promise.all([
      convex.query(api.listings.getListingStats, {}),
      convex.query(api.listings.getPublicListings, { limit: 6 }),
    ])
    stats.value = statsRes as any
    listings.value = listingsRes as any[]
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>
