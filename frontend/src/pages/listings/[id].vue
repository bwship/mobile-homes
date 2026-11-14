<template>
  <div class="container py-6 md:py-8">
    <div v-if="loading" class="text-muted-foreground">Loading listing…</div>
    <div v-else-if="!listing" class="py-16 text-center">
      <h1 class="mb-2 text-2xl font-semibold">Listing not found</h1>
      <router-link to="/search" class="text-primary hover:underline">Back to search</router-link>
    </div>
    <div v-else class="mx-auto max-w-6xl">
      <p class="mb-4 text-[11px] leading-none text-muted-foreground">
        <router-link to="/" class="hover:text-foreground">Home</router-link>
        <span class="mx-1.5">›</span>
        <router-link to="/search" class="hover:text-foreground">Search</router-link>
        <span class="mx-1.5">›</span>
        <span class="text-foreground">{{ listing.title }}</span>
      </p>

    <div class="grid gap-8 lg:grid-cols-5">
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
                v-if="listing.previewOnly || listing.status === 'PENDING'"
                class="mb-2 mr-2 inline-block rounded-full bg-amber-500/15 px-2 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400"
              >
                Pending preview
              </span>
              <span
                class="text-xs font-semibold px-2 py-1 rounded-full mb-2 inline-block"
                :class="listing.listingType === 'RENT' ? 'bg-blue-600 text-white' : 'bg-primary text-white'"
              >
                {{ listing.listingType === 'RENT' ? 'For Rent' : 'For Sale' }}
              </span>
              <div class="flex flex-wrap items-center gap-2">
                <h1 class="text-3xl font-bold">{{ listing.title }}</h1>
                <button
                  type="button"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
                  :aria-label="favorited ? 'Remove from favorites' : 'Save to favorites'"
                  :title="favorited ? 'Remove from favorites' : 'Save to favorites'"
                  @click="toggleFavorite"
                >
                  <svg
                    class="h-5 w-5 transition-colors"
                    :class="favorited ? 'fill-red-500 text-red-500' : 'fill-none text-muted-foreground'"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
                    />
                  </svg>
                </button>
                <button
                  v-if="canManage"
                  type="button"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10"
                  aria-label="Edit listing"
                  title="Edit listing"
                  @click="editOpen = true"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              </div>
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
            <p class="whitespace-pre-wrap">{{ listing.description || 'Contact the dealer for more details about this home.' }}</p>
          </div>
        </div>

        <div class="h-64 rounded-xl overflow-hidden">
          <ListingMap :listings="[listing]" :center="{ lat: listing.lat, lng: listing.lng }" :zoom="14" />
        </div>
      </div>

      <div class="lg:col-span-2 space-y-4">
        <Card>
          <CardContent class="p-6 space-y-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h2 class="font-semibold text-lg">Dealer</h2>
                <router-link
                  v-if="listing.organizationId"
                  :to="`/dealers/${listing.organizationId}`"
                  class="text-primary hover:underline"
                >
                  {{ listing.organizationName }}
                </router-link>
              </div>
            </div>

            <form
              v-if="userStore.user"
              class="space-y-3 pt-2 border-t border-border"
              @submit.prevent="submitMessage"
            >
              <h3 class="font-medium">Message dealer</h3>
              <textarea
                v-model="messageBody"
                rows="4"
                required
                class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="I'm interested in scheduling a tour…"
              />
              <p v-if="inquiryError" class="text-sm text-destructive">{{ inquiryError }}</p>
              <p v-if="inquirySent" class="text-sm text-green-600">Message sent — check Messages in the top bar.</p>
              <Button type="submit" class="w-full" :loading="inquiryLoading" loading-text="Sending…">
                Send message
              </Button>
            </form>
            <div v-else class="space-y-3 border-t border-border pt-2">
              <h3 class="font-medium">Message dealer</h3>
              <p class="text-sm text-muted-foreground">Log in to message this dealer in-app.</p>
              <router-link to="/login">
                <Button class="w-full" variant="outline">Log in to message</Button>
              </router-link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
  </div>

  <ListingModal
    v-if="userStore.user?.email"
    :open="editOpen"
    :user-email="userStore.adminApiEmail || userStore.user.email"
    :organization-id="listing?.organizationId"
    :listing="listing"
    @close="editOpen = false"
    @saved="onListingSaved"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import { useUserStore } from '@/stores/user'
import { useInboxStore } from '@/stores/inbox'
import { useMessagesStore } from '@/stores/messages'
import { useFavoritesStore } from '@/stores/favorites'
import { useAuthModalStore } from '@/stores/authModal'
import { formatListingPrice, formatLotRent, fullAddress } from '@/lib/listingFormat'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import ListingMap from '@/components/listings/ListingMap.vue'
import ListingModal from '@/components/listings/ListingModal.vue'

const route = useRoute()
const userStore = useUserStore()
const inboxStore = useInboxStore()
const messagesStore = useMessagesStore()
const favoritesStore = useFavoritesStore()
const authModal = useAuthModalStore()

const listing = ref<any>(null)
const loading = ref(true)
const activeImage = ref(0)
const favorited = ref(false)
const canManage = ref(false)
const editOpen = ref(false)
const inquiryLoading = ref(false)
const inquirySent = ref(false)
const inquiryError = ref<string | null>(null)
const messageBody = ref('')

const heroImage = computed(() => listing.value?.images?.[activeImage.value]?.url ?? null)
const lotRent = computed(() => formatLotRent(listing.value?.lotRentCents))

async function loadListing() {
  const id = route.params.id as string
  loading.value = true
  try {
    listing.value = await convex.query(api.listings.getPublicListing, {
      listingId: id as any,
      viewerEmail: userStore.adminApiEmail || userStore.user?.email,
    })
    activeImage.value = 0
    if (userStore.user?.email && listing.value) {
      const [isFav, manage] = await Promise.all([
        convex.query(api.favorites.isFavorite, {
          userEmail: userStore.user.email,
          listingId: id as any,
        }),
        convex.query(api.listings.canManageListing, {
          userEmail: userStore.adminApiEmail || userStore.user.email,
          listingId: id as any,
        }),
      ])
      favorited.value = Boolean(isFav)
      canManage.value = Boolean(manage)
    } else {
      favorited.value = false
      canManage.value = false
    }
  } finally {
    loading.value = false
  }
}

async function onListingSaved() {
  await loadListing()
}

onMounted(loadListing)

watch(
  () => [route.params.id, userStore.user?.email, userStore.adminApiEmail],
  () => {
    void loadListing()
  },
)

async function toggleFavorite() {
  if (!listing.value) return
  if (!userStore.user?.email) {
    authModal.requireFavorites()
    return
  }
  const res = await convex.mutation(api.favorites.toggleFavorite, {
    userEmail: userStore.user.email,
    listingId: listing.value._id,
  })
  favorited.value = (res as any).favorited
  await favoritesStore.refresh()
}

async function submitMessage() {
  if (!listing.value) return
  inquiryLoading.value = true
  inquiryError.value = null
  inquirySent.value = false
  try {
    const result = await messagesStore.sendListingMessage(listing.value._id, messageBody.value)
    messageBody.value = ''
    inquirySent.value = true
    inboxStore.open('messages', result.conversationId)
  } catch (err) {
    inquiryError.value = err instanceof Error ? err.message : 'Could not send message'
  } finally {
    inquiryLoading.value = false
  }
}
</script>
