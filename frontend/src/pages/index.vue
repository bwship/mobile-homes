<template>
  <div>
    <!-- Hero — traded-style fold -->
    <section class="hero-fold">
      <div class="container flex flex-col items-center px-4 pb-10 pt-14 text-center md:pb-12 md:pt-20 lg:pt-24">
        <p class="mb-5 text-xs font-black uppercase tracking-[0.28em] text-white/70 sm:text-sm">
          MH Marketplace
        </p>

        <h1 class="hero-headline mb-5 max-w-4xl text-white">
          Where homebuyers<br />
          <span class="hero-accent">belong</span>
        </h1>

        <p class="mb-8 max-w-xl text-base text-white/60 md:text-lg">
          Closings, listings, dealers, and factories — manufactured homes nationwide in one place.
        </p>

        <div class="mb-10 flex flex-wrap items-center justify-center gap-3">
          <router-link to="/signup" class="hero-cta-primary">List a home</router-link>
          <router-link to="/closings" class="hero-cta-secondary">Browse Closings</router-link>
        </div>

        <form class="hero-search-shell w-full" @submit.prevent="goSearch">
          <div class="hero-search-inner">
            <input
              v-model="query"
              type="search"
              placeholder="Search homes, cities, dealers…"
              class="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/40 outline-none sm:text-base"
            />
            <select
              v-model="listingType"
              class="hidden h-9 cursor-pointer rounded-full border-0 bg-transparent text-xs font-medium text-white/70 outline-none sm:block"
            >
              <option value="" class="bg-zinc-900 text-white">Sale & rent</option>
              <option value="SALE" class="bg-zinc-900 text-white">For sale</option>
              <option value="RENT" class="bg-zinc-900 text-white">For rent</option>
            </select>
            <button type="submit" class="hero-search-btn" aria-label="Search">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      <CompanyMarquee :companies="dealers" />
    </section>

    <div class="container py-8 md:py-12">
      <Card
        v-if="userStore.isDealer && !userStore.user?.isApproved"
        class="mb-10 border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20"
      >
        <CardContent class="p-6">
          <h3 class="mb-2 font-semibold text-yellow-900 dark:text-yellow-100">Dealer account pending approval</h3>
          <p class="text-sm text-yellow-800 dark:text-yellow-200">
            An administrator will review your account before you can publish listings.
          </p>
        </CardContent>
      </Card>

      <!-- Market chips -->
      <section v-if="topStates.length" class="mb-10 md:mb-14">
        <h2 class="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">Browse by market</h2>
        <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          <button
            v-for="state in topStates"
            :key="state"
            type="button"
            class="market-chip"
            @click="goState(state)"
          >
            {{ state }}
          </button>
          <button type="button" class="market-chip text-primary" @click="goAllMarkets">
            All markets →
          </button>
        </div>
      </section>

      <!-- Carousels -->
      <ListingCarousel
        title="Recently listed"
        subtitle="Fresh inventory from approved dealers"
        :view-all-to="{ path: '/search' }"
        :listings="recentListings"
        :loading="loading"
      />

      <RecentlyClosedSection
        v-model:deal-kind="closedDealKind"
        :listings="closedListings"
        :loading="loading || closedLoading"
      />

      <TrendingThisWeek
        v-if="!loading"
        :data="trending"
        @select-state="goState"
      />

      <ListingCarousel
        v-if="!loading && rentListings.length"
        title="Homes for rent"
        subtitle="Monthly rentals in mobile home communities"
        :view-all-to="{ path: '/search', query: { type: 'RENT' } }"
        :listings="rentListings"
        :loading="loading"
      />

      <ListingCarousel
        v-if="!loading && saleListings.length"
        title="Homes for sale"
        subtitle="Manufactured & mobile homes on the market"
        :view-all-to="{ path: '/search', query: { type: 'SALE' } }"
        :listings="saleListings"
        :loading="loading"
      />

      <!-- CTA tiles -->
      <section class="grid gap-4 md:grid-cols-2 md:gap-6">
        <div class="feature-tile">
          <h2 class="mb-2 text-xl font-extrabold tracking-tight">Sell a mobile home</h2>
          <p class="mb-5 text-sm text-muted-foreground">List your inventory and reach buyers searching nationwide.</p>
          <router-link to="/signup">
            <Button class="font-semibold">List a home</Button>
          </router-link>
        </div>
        <div class="feature-tile">
          <h2 class="mb-2 text-xl font-extrabold tracking-tight">Browse on the map</h2>
          <p class="mb-5 text-sm text-muted-foreground">Explore homes for sale and rent with a map + list split view.</p>
          <router-link to="/search">
            <Button variant="outline" class="font-semibold">Open map search</Button>
          </router-link>
        </div>
      </section>
    </div>

    <AuthModal
      :open="authModalOpen"
      :initial-mode="authModalMode"
      reason="You must be logged in to change market filters."
      @close="authModalOpen = false"
      @success="onAuthSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import { useUserStore } from '@/stores/user'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import ListingCarousel from '@/components/listings/ListingCarousel.vue'
import RecentlyClosedSection, { type ClosedDealKind } from '@/components/listings/RecentlyClosedSection.vue'
import TrendingThisWeek, { type TrendingData } from '@/components/listings/TrendingThisWeek.vue'
import CompanyMarquee, { type MarqueeCompany } from '@/components/layout/CompanyMarquee.vue'
import AuthModal from '@/components/auth/AuthModal.vue'

const router = useRouter()
const userStore = useUserStore()

const query = ref('')
const listingType = ref('')
const listings = ref<any[]>([])
const dealers = ref<MarqueeCompany[]>([])
const closedListings = ref<any[]>([])
const closedDealKind = ref<ClosedDealKind>('SALE')
const closedLoading = ref(false)
const trending = ref<TrendingData | null>(null)
const loading = ref(true)

const authModalOpen = ref(false)
const authModalMode = ref<'login' | 'signup'>('login')
const pendingMarket = ref<string | null>(null)

const recentListings = computed(() => listings.value.slice(0, 12))
const rentListings = computed(() => listings.value.filter((l) => l.listingType === 'RENT').slice(0, 10))
const saleListings = computed(() => listings.value.filter((l) => l.listingType === 'SALE').slice(0, 10))

const topStates = computed(() => {
  const counts = new Map<string, number>()
  for (const listing of listings.value) {
    counts.set(listing.state, (counts.get(listing.state) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([state]) => state)
})

function goSearch() {
  router.push({
    path: '/search',
    query: {
      q: query.value || undefined,
      type: listingType.value || undefined,
    },
  })
}

function requireAuthForMarket(state?: string) {
  if (userStore.user) {
    router.push({
      path: '/search',
      query: state ? { state } : undefined,
    })
    return
  }
  pendingMarket.value = state ?? null
  authModalMode.value = 'login'
  authModalOpen.value = true
}

function goState(state: string) {
  requireAuthForMarket(state)
}

function goAllMarkets() {
  requireAuthForMarket()
}

function onAuthSuccess() {
  authModalOpen.value = false
  const state = pendingMarket.value
  pendingMarket.value = null
  router.push({
    path: '/search',
    query: state ? { state } : undefined,
  })
}

async function loadClosed() {
  closedLoading.value = true
  try {
    closedListings.value = (await convex.query(api.listings.getRecentlyClosed, {
      limit: 12,
      listingType: closedDealKind.value,
    })) as any[]
  } finally {
    closedLoading.value = false
  }
}

watch(closedDealKind, () => {
  loadClosed()
})

onMounted(async () => {
  try {
    const [listingsRes, trendingRes, dealersRes] = await Promise.all([
      convex.query(api.listings.getPublicListings, { limit: 24 }),
      convex.query(api.listings.getTrendingThisWeek, {}),
      convex.query(api.organizations.getFeaturedDealers, {}),
      loadClosed(),
    ])
    listings.value = listingsRes as any[]
    trending.value = trendingRes as TrendingData
    dealers.value = dealersRes as MarqueeCompany[]
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>
