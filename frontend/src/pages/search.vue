<template>
  <div class="relative flex min-h-[calc(100dvh-3.5rem)] flex-col">
    <div class="shrink-0 border-b border-border/60 bg-background px-4 py-4 md:px-6">
      <form class="mx-auto flex w-full max-w-5xl flex-col gap-3 sm:flex-row sm:items-stretch" @submit.prevent="runSearch">
        <div class="search-gradient-border min-w-0 flex-1 rounded-xl p-[1.5px]">
          <div class="flex h-12 items-center gap-2 rounded-[10px] bg-background px-3">
            <svg class="h-4 w-4 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
            </svg>
            <input
              v-model="filters.query"
              type="search"
              placeholder="Search homes, cities, ZIP…"
              class="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <Button type="submit" class="h-12 shrink-0 px-6 sm:w-28" :loading="loading" loading-text="…">
          Search
        </Button>
      </form>

      <div class="mx-auto mt-3 flex w-full max-w-5xl items-center justify-between gap-3">
        <div class="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 p-0.5">
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors"
            :class="view === 'list' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'"
            aria-label="List view"
            @click="view = 'list'"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors"
            :class="view === 'map' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'"
            aria-label="Map view"
            @click="view = 'map'"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </button>
        </div>

        <div class="flex items-center gap-3">
          <p class="hidden text-xs text-muted-foreground sm:block">
            {{ loading ? 'Searching…' : `${listings.length} home${listings.length === 1 ? '' : 's'}` }}
          </p>
          <button
            type="button"
            class="inline-flex h-8 items-center gap-1.5 rounded-md border border-border/60 px-3 text-xs font-semibold transition-colors hover:bg-muted"
            :class="filtersOpen && 'border-primary bg-primary/10 text-primary'"
            @click="filtersOpen = !filtersOpen"
          >
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            <span
              v-if="activeFilterCount > 0"
              class="ml-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white"
            >
              {{ activeFilterCount }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <div class="relative min-h-0 flex-1">
      <div v-show="view === 'map'" class="absolute inset-0">
        <ListingMap
          class="h-full min-h-[420px]"
          :listings="listings"
          :selected-id="selectedId"
          :rounded="false"
          @select="onMapSelect"
        />
        <div
          v-if="selectedListing"
          class="pointer-events-none absolute bottom-4 left-4 right-4 z-10 max-w-sm md:left-6"
        >
          <div class="pointer-events-auto">
            <ListingCard
              :listing="selectedListing"
              :selected="true"
              variant="carousel"
              :show-favorite="Boolean(userStore.user)"
              :favorited="favoriteIds.has(selectedListing._id)"
              @favorite-change="onFavoriteChange"
            />
          </div>
        </div>
      </div>

      <div v-show="view === 'list'" class="h-full overflow-y-auto p-4 md:p-6">
        <div v-if="!loading && listings.length === 0" class="py-16 text-center text-sm text-muted-foreground">
          No listings match your filters.
        </div>
        <div v-else class="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ListingCard
            v-for="listing in listings"
            :key="listing._id"
            :listing="listing"
            :selected="selectedId === listing._id"
            :show-favorite="Boolean(userStore.user)"
            :favorited="favoriteIds.has(listing._id)"
            @hover="selectedId = $event"
            @favorite-change="onFavoriteChange"
          />
        </div>
      </div>
    </div>

    <!-- Filters drawer -->
    <Teleport to="body">
      <div v-if="filtersOpen" class="fixed inset-0 z-[70]">
        <div class="absolute inset-0 bg-black/45" @click="filtersOpen = false" />
        <aside
          class="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col border-l border-border bg-card shadow-2xl"
        >
          <div class="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
            <h2 class="text-sm font-semibold">Filters</h2>
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close filters"
              @click="filtersOpen = false"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex-1 space-y-5 overflow-y-auto p-4">
            <div>
              <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Transaction</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="opt in listingTypeOptions"
                  :key="opt.value"
                  type="button"
                  class="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
                  :class="
                    filters.listingType === opt.value
                      ? 'border-primary bg-primary text-white'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  "
                  @click="filters.listingType = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <div>
              <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Asset type</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="opt in assetTypeOptions"
                  :key="opt.value"
                  type="button"
                  class="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
                  :class="
                    filters.assetType === opt.value
                      ? 'border-primary bg-primary text-white'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  "
                  @click="filters.assetType = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <div>
              <label class="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">State</label>
              <select
                v-model="filters.state"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All states</option>
                <option v-for="st in US_STATES" :key="st" :value="st">{{ st }}</option>
              </select>
            </div>

            <div>
              <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Price</p>
              <div class="grid grid-cols-2 gap-2">
                <Input v-model="filters.minPrice" type="number" min="0" placeholder="Min $" />
                <Input v-model="filters.maxPrice" type="number" min="0" placeholder="Max $" />
              </div>
            </div>
          </div>

          <div class="flex shrink-0 gap-2 border-t border-border p-4">
            <Button type="button" variant="outline" class="flex-1" @click="clearFilters">Clear</Button>
            <Button type="button" class="flex-1" @click="applyFilters">Apply</Button>
          </div>
        </aside>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import { US_STATES } from '@/lib/listingFormat'
import { useUserStore } from '@/stores/user'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import ListingCard from '@/components/listings/ListingCard.vue'
import ListingMap from '@/components/listings/ListingMap.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const listings = ref<any[]>([])
const loading = ref(true)
const selectedId = ref<string | null>(null)
const favoriteIds = ref(new Set<string>())
const VIEW_STORAGE_KEY = 'mh-search-view'

function readStoredView(): 'map' | 'list' {
  try {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY)
    if (stored === 'list' || stored === 'map') return stored
  } catch {
    // ignore
  }
  return 'map'
}

const view = ref<'map' | 'list'>(readStoredView())
const filtersOpen = ref(false)

watch(view, (v) => {
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, v)
  } catch {
    // ignore
  }
})

const listingTypeOptions = [
  { value: '', label: 'All' },
  { value: 'SALE', label: 'Sale' },
  { value: 'RENT', label: 'Rent' },
]

const assetTypeOptions = [
  { value: '', label: 'All' },
  { value: 'MOBILE_HOME', label: 'Mobile Home' },
  { value: 'TINY_HOUSE', label: 'Tiny House' },
]

const filters = reactive({
  query: (route.query.q as string) ?? '',
  listingType: (route.query.type as string) ?? '',
  assetType: (route.query.asset as string) ?? '',
  state: (route.query.state as string) ?? '',
  minPrice: (route.query.min as string) ?? '',
  maxPrice: (route.query.max as string) ?? '',
})

const selectedListing = computed(
  () => listings.value.find((l) => l._id === selectedId.value) ?? null,
)

const activeFilterCount = computed(() => {
  let n = 0
  if (filters.listingType) n += 1
  if (filters.assetType) n += 1
  if (filters.state) n += 1
  if (filters.minPrice) n += 1
  if (filters.maxPrice) n += 1
  return n
})

async function loadFavoriteIds() {
  if (!userStore.user?.email) {
    favoriteIds.value = new Set()
    return
  }
  try {
    const rows = (await convex.query(api.favorites.getUserFavorites, {
      userEmail: userStore.user.email,
    })) as any[]
    favoriteIds.value = new Set(rows.map((r) => r._id))
  } catch {
    favoriteIds.value = new Set()
  }
}

function onFavoriteChange({ listingId, favorited }: { listingId: string; favorited: boolean }) {
  const next = new Set(favoriteIds.value)
  if (favorited) next.add(listingId)
  else next.delete(listingId)
  favoriteIds.value = next
}

async function loadListings() {
  loading.value = true
  try {
    listings.value = (await convex.query(api.listings.getPublicListings, {
      query: filters.query || undefined,
      listingType:
        filters.listingType === 'SALE' || filters.listingType === 'RENT'
          ? filters.listingType
          : undefined,
      assetType:
        filters.assetType === 'MOBILE_HOME' || filters.assetType === 'TINY_HOUSE'
          ? filters.assetType
          : undefined,
      state: filters.state || undefined,
      minPrice: filters.minPrice ? Math.round(Number(filters.minPrice) * 100) : undefined,
      maxPrice: filters.maxPrice ? Math.round(Number(filters.maxPrice) * 100) : undefined,
    })) as any[]

    if (listings.value.length) {
      if (!selectedId.value || !listings.value.some((l) => l._id === selectedId.value)) {
        selectedId.value = listings.value[0]._id
      }
    } else {
      selectedId.value = null
    }
  } finally {
    loading.value = false
  }
}

function syncQueryToRoute() {
  const q: Record<string, string> = {}
  if (filters.query) q.q = filters.query
  if (filters.listingType) q.type = filters.listingType
  if (filters.assetType) q.asset = filters.assetType
  if (filters.state) q.state = filters.state
  if (filters.minPrice) q.min = filters.minPrice
  if (filters.maxPrice) q.max = filters.maxPrice
  void router.replace({ query: q })
}

async function runSearch() {
  syncQueryToRoute()
  await loadListings()
}

async function applyFilters() {
  filtersOpen.value = false
  await runSearch()
}

function clearFilters() {
  filters.listingType = ''
  filters.assetType = ''
  filters.state = ''
  filters.minPrice = ''
  filters.maxPrice = ''
}

function onMapSelect(id: string) {
  selectedId.value = id
}

function hydrateFromRoute() {
  filters.query = (route.query.q as string) ?? ''
  filters.listingType = (route.query.type as string) ?? ''
  filters.assetType = (route.query.asset as string) ?? ''
  filters.state = (route.query.state as string) ?? ''
  filters.minPrice = (route.query.min as string) ?? ''
  filters.maxPrice = (route.query.max as string) ?? ''
}

onMounted(() => {
  void loadListings()
  void loadFavoriteIds()
})

watch(
  () => userStore.user?.email,
  () => {
    void loadFavoriteIds()
  },
)

watch(
  () => route.query,
  () => {
    hydrateFromRoute()
    void loadListings()
  },
)
</script>

<style scoped>
.search-gradient-border {
  background: linear-gradient(
    105deg,
    hsl(var(--primary)) 0%,
    hsl(280 70% 55%) 45%,
    hsl(25 90% 55%) 100%
  );
}
</style>
