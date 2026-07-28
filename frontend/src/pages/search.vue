<template>
  <div class="flex flex-col lg:flex-row gap-0 lg:gap-4 -mx-4 sm:mx-0 lg:h-[calc(100dvh-12rem)] min-h-[70vh]">
    <aside class="lg:w-[420px] shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-border/60 bg-background">
      <div class="p-4 border-b border-border/60 space-y-3">
        <h1 class="text-xl font-semibold">Search homes</h1>
        <form class="flex gap-2" @submit.prevent="loadListings">
          <Input v-model="filters.query" placeholder="City, state, ZIP" class="flex-1" />
          <Button type="submit" size="sm">Go</Button>
        </form>
        <div class="grid grid-cols-2 gap-2">
          <select v-model="filters.listingType" class="h-9 rounded-md border border-input bg-background px-2 text-sm" @change="loadListings">
            <option value="">All types</option>
            <option value="SALE">For sale</option>
            <option value="RENT">For rent</option>
          </select>
          <select v-model="filters.state" class="h-9 rounded-md border border-input bg-background px-2 text-sm" @change="loadListings">
            <option value="">All states</option>
            <option v-for="st in US_STATES" :key="st" :value="st">{{ st }}</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <Input v-model="filters.minPrice" type="number" placeholder="Min $" @change="loadListings" />
          <Input v-model="filters.maxPrice" type="number" placeholder="Max $" @change="loadListings" />
        </div>
        <p class="text-xs text-muted-foreground">{{ listings.length }} homes</p>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <ListingCard
          v-for="listing in listings"
          :key="listing._id"
          :listing="listing"
          :selected="selectedId === listing._id"
          @hover="selectedId = $event"
        />
        <p v-if="!loading && listings.length === 0" class="text-sm text-muted-foreground text-center py-8">
          No listings match your filters.
        </p>
      </div>
    </aside>

    <div class="flex-1 min-h-[360px] lg:min-h-0 p-4 lg:p-0">
      <ListingMap
        :listings="listings"
        :selected-id="selectedId"
        @select="selectedId = $event"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import { US_STATES } from '@/lib/listingFormat'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import ListingCard from '@/components/listings/ListingCard.vue'
import ListingMap from '@/components/listings/ListingMap.vue'

const route = useRoute()
const listings = ref<any[]>([])
const loading = ref(true)
const selectedId = ref<string | null>(null)

const filters = reactive({
  query: (route.query.q as string) ?? '',
  listingType: (route.query.type as string) ?? '',
  state: (route.query.state as string) ?? '',
  minPrice: '',
  maxPrice: '',
})

async function loadListings() {
  loading.value = true
  try {
    listings.value = (await convex.query(api.listings.getPublicListings, {
      query: filters.query || undefined,
      listingType: filters.listingType === 'SALE' || filters.listingType === 'RENT' ? filters.listingType : undefined,
      state: filters.state || undefined,
      minPrice: filters.minPrice ? Math.round(Number(filters.minPrice) * 100) : undefined,
      maxPrice: filters.maxPrice ? Math.round(Number(filters.maxPrice) * 100) : undefined,
    })) as any[]
    if (listings.value.length && !selectedId.value) {
      selectedId.value = listings.value[0]._id
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadListings)
watch(() => route.query, () => {
  filters.query = (route.query.q as string) ?? filters.query
  filters.listingType = (route.query.type as string) ?? filters.listingType
  loadListings()
})
</script>
