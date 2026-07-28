<template>
  <div v-if="loading" class="text-muted-foreground">Loading listing…</div>
  <div v-else-if="!listing" class="text-center py-16">
    <h1 class="text-2xl font-semibold mb-2">Listing not found</h1>
    <router-link to="/search" class="text-primary hover:underline">Back to search</router-link>
  </div>
  <div v-else class="max-w-6xl mx-auto">
    <div class="grid lg:grid-cols-5 gap-8">
      <div class="lg:col-span-3 space-y-4">
        <div class="aspect-[16/10] rounded-2xl overflow-hidden bg-muted">
          <img
            v-if="heroImage"
            :src="heroImage"
            :alt="listing.title"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-muted-foreground">No photos yet</div>
        </div>
        <div v-if="listing.images?.length > 1" class="flex gap-2 overflow-x-auto">
          <button
            v-for="(img, idx) in listing.images"
            :key="img._id"
            type="button"
            class="shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2"
            :class="activeImage === idx ? 'border-primary' : 'border-transparent'"
            @click="activeImage = idx"
          >
            <img :src="img.url" alt="" class="w-full h-full object-cover" />
          </button>
        </div>

        <div>
          <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <span
                class="text-xs font-semibold px-2 py-1 rounded-full mb-2 inline-block"
                :class="listing.listingType === 'RENT' ? 'bg-blue-600 text-white' : 'bg-primary text-primary-foreground'"
              >
                {{ listing.listingType === 'RENT' ? 'For Rent' : 'For Sale' }}
              </span>
              <h1 class="text-3xl font-bold">{{ listing.title }}</h1>
              <p class="text-muted-foreground mt-1">{{ fullAddress(listing) }}</p>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-primary">{{ formatListingPrice(listing.priceCents, listing.listingType) }}</div>
              <p v-if="lotRent" class="text-sm text-muted-foreground">{{ lotRent }}</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-4 text-sm mb-6">
            <span v-if="listing.beds != null"><strong>{{ listing.beds }}</strong> beds</span>
            <span v-if="listing.baths != null"><strong>{{ listing.baths }}</strong> baths</span>
            <span v-if="listing.sqft != null"><strong>{{ listing.sqft.toLocaleString() }}</strong> sq ft</span>
            <span v-if="listing.yearBuilt"><strong>{{ listing.yearBuilt }}</strong> built</span>
            <span v-if="listing.manufacturer">{{ listing.manufacturer }} {{ listing.model }}</span>
          </div>

          <p v-if="listing.communityName" class="text-sm text-muted-foreground mb-4">Community: {{ listing.communityName }}</p>

          <div class="prose prose-sm dark:prose-invert max-w-none">
            <p class="whitespace-pre-wrap">{{ listing.description || 'Contact the seller for more details about this home.' }}</p>
          </div>
        </div>

        <div class="h-64 rounded-xl overflow-hidden">
          <ListingMap :listings="[listing]" :center="{ lat: listing.lat, lng: listing.lng }" :zoom="14" />
        </div>
      </div>

      <div class="lg:col-span-2 space-y-4">
        <Card>
          <CardContent class="p-6 space-y-4">
            <div>
              <h2 class="font-semibold text-lg">Seller</h2>
              <router-link
                v-if="listing.organizationId"
                :to="`/sellers/${listing.organizationId}`"
                class="text-primary hover:underline"
              >
                {{ listing.organizationName }}
              </router-link>
            </div>

            <Button
              v-if="userStore.user"
              variant="outline"
              class="w-full"
              @click="toggleFavorite"
            >
              {{ favorited ? 'Saved' : 'Save home' }}
            </Button>

            <form class="space-y-3 pt-2 border-t border-border" @submit.prevent="submitInquiry">
              <h3 class="font-medium">Contact seller</h3>
              <Input v-model="inquiry.name" placeholder="Your name" required />
              <Input v-model="inquiry.email" type="email" placeholder="you@acme.com" required />
              <textarea
                v-model="inquiry.message"
                rows="4"
                required
                class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="I'm interested in scheduling a tour…"
              />
              <p v-if="inquiryError" class="text-sm text-destructive">{{ inquiryError }}</p>
              <p v-if="inquirySent" class="text-sm text-green-600">Message sent!</p>
              <Button type="submit" class="w-full" :loading="inquiryLoading" loading-text="Sending…">
                Send message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import { useUserStore } from '@/stores/user'
import { formatListingPrice, formatLotRent, fullAddress } from '@/lib/listingFormat'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import ListingMap from '@/components/listings/ListingMap.vue'

const route = useRoute()
const userStore = useUserStore()

const listing = ref<any>(null)
const loading = ref(true)
const activeImage = ref(0)
const favorited = ref(false)
const inquiryLoading = ref(false)
const inquirySent = ref(false)
const inquiryError = ref<string | null>(null)

const inquiry = reactive({
  name: userStore.user?.name ?? '',
  email: userStore.user?.email ?? '',
  message: '',
})

const heroImage = computed(() => listing.value?.images?.[activeImage.value]?.url ?? null)
const lotRent = computed(() => formatLotRent(listing.value?.lotRentCents))

onMounted(async () => {
  const id = route.params.id as string
  try {
    listing.value = await convex.query(api.listings.getPublicListing, { listingId: id as any })
    if (userStore.user?.email) {
      favorited.value = await convex.query(api.favorites.isFavorite, {
        userEmail: userStore.user.email,
        listingId: id as any,
      })
    }
  } finally {
    loading.value = false
  }
})

async function toggleFavorite() {
  if (!userStore.user?.email || !listing.value) return
  const res = await convex.mutation(api.favorites.toggleFavorite, {
    userEmail: userStore.user.email,
    listingId: listing.value._id,
  })
  favorited.value = (res as any).favorited
}

async function submitInquiry() {
  if (!listing.value) return
  inquiryLoading.value = true
  inquiryError.value = null
  try {
    await convex.mutation(api.listings.submitListingInquiry, {
      listingId: listing.value._id,
      name: inquiry.name,
      email: inquiry.email,
      message: inquiry.message,
    })
    inquirySent.value = true
    inquiry.message = ''
  } catch (err) {
    inquiryError.value = err instanceof Error ? err.message : 'Could not send message'
  } finally {
    inquiryLoading.value = false
  }
}
</script>
