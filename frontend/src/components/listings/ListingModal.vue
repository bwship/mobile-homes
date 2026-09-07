<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
  >
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />
    <div class="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-border bg-background shadow-xl sm:rounded-2xl">
      <div class="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-6 py-4">
        <h2 class="text-lg font-semibold">{{ editing ? 'Edit listing' : 'New listing' }}</h2>
        <button type="button" class="text-muted-foreground hover:text-foreground" @click="$emit('close')">✕</button>
      </div>

      <form class="space-y-4 p-6" @submit.prevent="handleSubmit">
        <div>
          <label class="auth-field-label">Photos</label>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="(img, index) in images"
              :key="img._id || img.storageId || index"
              class="group relative h-20 w-20 shrink-0 cursor-grab overflow-hidden rounded-lg border-2 bg-muted active:cursor-grabbing"
              :class="index === 0 ? 'border-primary' : 'border-border'"
              draggable="true"
              @dragstart="onDragStart(index)"
              @dragover.prevent
              @drop.prevent="onDrop(index)"
            >
              <img :src="img.url" alt="" class="h-full w-full object-cover" />
              <span
                class="absolute left-1 top-1 rounded bg-black/60 px-1 text-[10px] font-bold text-white"
              >
                {{ index + 1 }}
              </span>
              <button
                type="button"
                class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                :disabled="photosBusy"
                aria-label="Remove photo"
                @click.stop="removeImage(index)"
              >
                <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <label
              class="flex h-20 w-20 shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              :class="photosBusy && 'pointer-events-none opacity-50'"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span class="mt-0.5 text-[10px] font-semibold">Add</span>
              <input
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                :disabled="photosBusy"
                @change="onFilesSelected"
              />
            </label>
          </div>
          <p class="mt-1.5 text-xs text-muted-foreground">
            {{
              images.length === 0
                ? 'Add photos. First image is the main photo.'
                : `${images.length} photo${images.length === 1 ? '' : 's'}. Drag to reorder. First is main.`
            }}
          </p>
        </div>

        <div>
          <label class="auth-field-label">Title</label>
          <Input v-model="form.title" required placeholder="2021 Clayton 3 bed / 2 bath" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="auth-field-label">Type</label>
            <select v-model="form.listingType" class="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="SALE">For Sale</option>
              <option value="RENT">For Rent</option>
            </select>
          </div>
          <div>
            <label class="auth-field-label">Asset type</label>
            <select v-model="form.assetType" class="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="MOBILE_HOME">Mobile Home</option>
              <option value="TINY_HOUSE">Tiny House</option>
            </select>
          </div>
        </div>

        <div>
          <label class="auth-field-label">Price ($)</label>
          <Input v-model="form.priceDollars" type="number" min="0" step="1" required />
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="auth-field-label">Beds</label>
            <Input v-model="form.beds" type="number" min="0" />
          </div>
          <div>
            <label class="auth-field-label">Baths</label>
            <Input v-model="form.baths" type="number" min="0" step="0.5" />
          </div>
          <div>
            <label class="auth-field-label">Sq ft</label>
            <Input v-model="form.sqft" type="number" min="0" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="auth-field-label">Year built</label>
            <Input v-model="form.yearBuilt" type="number" min="1950" max="2030" />
          </div>
          <div>
            <label class="auth-field-label">Lot rent ($/mo, optional)</label>
            <Input v-model="form.lotRentDollars" type="number" min="0" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="auth-field-label">Factory / manufacturer</label>
            <Input v-model="form.manufacturer" placeholder="Clayton" />
          </div>
          <div>
            <label class="auth-field-label">Model</label>
            <Input v-model="form.model" placeholder="Inspiration" />
          </div>
        </div>

        <div>
          <label class="auth-field-label">Community / park (optional)</label>
          <Input v-model="form.communityName" placeholder="Buccaneer Estates MHP" />
        </div>

        <div>
          <label class="auth-field-label">Street address</label>
          <Input v-model="form.address1" required placeholder="4521 Palm Bay Rd NE" />
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="col-span-1">
            <label class="auth-field-label">City</label>
            <Input v-model="form.city" required />
          </div>
          <div>
            <label class="auth-field-label">State</label>
            <select
              v-model="form.state"
              required
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="" disabled>Select</option>
              <option v-for="st in US_STATES" :key="st" :value="st">{{ st }}</option>
            </select>
          </div>
          <div>
            <label class="auth-field-label">ZIP</label>
            <Input v-model="form.zip" required />
          </div>
        </div>

        <div>
          <label class="auth-field-label">Description</label>
          <textarea
            v-model="form.description"
            rows="4"
            class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Describe the home, community amenities, and tour availability."
          />
        </div>

        <div v-if="error" class="text-sm text-destructive">{{ error }}</div>

        <div class="flex gap-3 pt-2">
          <Button type="button" variant="outline" class="flex-1" @click="$emit('close')">Cancel</Button>
          <Button type="submit" class="flex-1" :loading="saving" loading-text="Saving…">
            {{ editing ? 'Save changes' : 'Submit for review' }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import { geocodeAddress } from '@/lib/geocode'
import { US_STATES } from '@/lib/listingFormat'

type ListingImageRow = {
  _id?: string
  storageId: string
  url: string
  isNew?: boolean
}

const props = defineProps<{
  open: boolean
  userEmail: string
  listing?: any | null
  organizationId?: string
}>()

const emit = defineEmits<{ close: []; saved: [] }>()

const saving = ref(false)
const photosBusy = ref(false)
const error = ref<string | null>(null)
const editing = ref(false)
const images = ref<ListingImageRow[]>([])
const dragFrom = ref<number | null>(null)

const emptyForm = () => ({
  title: '',
  listingType: 'SALE' as 'SALE' | 'RENT',
  assetType: 'MOBILE_HOME' as 'MOBILE_HOME' | 'TINY_HOUSE',
  priceDollars: '',
  lotRentDollars: '',
  beds: '',
  baths: '',
  sqft: '',
  yearBuilt: '',
  manufacturer: '',
  model: '',
  communityName: '',
  address1: '',
  city: '',
  state: '',
  zip: '',
  description: '',
})

const form = reactive(emptyForm())

function syncImagesFromListing(listing: any) {
  const rows = Array.isArray(listing?.images) ? [...listing.images] : []
  rows.sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  images.value = rows
    .filter((img: any) => img.url && img.storageId)
    .map((img: any) => ({
      _id: img._id,
      storageId: img.storageId,
      url: img.url,
      isNew: false,
    }))
}

watch(
  () => [props.open, props.listing] as const,
  () => {
    error.value = null
    if (!props.open) return
    if (props.listing) {
      editing.value = true
      const l = props.listing
      Object.assign(form, {
        title: l.title ?? '',
        listingType: l.listingType ?? 'SALE',
        assetType: l.assetType === 'TINY_HOUSE' ? 'TINY_HOUSE' : 'MOBILE_HOME',
        priceDollars: String((l.priceCents ?? 0) / 100),
        lotRentDollars: l.lotRentCents != null ? String(l.lotRentCents / 100) : '',
        beds: l.beds != null ? String(l.beds) : '',
        baths: l.baths != null ? String(l.baths) : '',
        sqft: l.sqft != null ? String(l.sqft) : '',
        yearBuilt: l.yearBuilt != null ? String(l.yearBuilt) : '',
        manufacturer: l.manufacturer ?? '',
        model: l.model ?? '',
        communityName: l.communityName ?? '',
        address1: l.address1 ?? '',
        city: l.city ?? '',
        state: (l.state ?? '').toUpperCase(),
        zip: l.zip ?? '',
        description: l.description ?? '',
      })
      syncImagesFromListing(l)
    } else {
      editing.value = false
      Object.assign(form, emptyForm())
      images.value = []
    }
  },
  { immediate: true },
)

async function uploadFile(file: File): Promise<{ storageId: string; url: string } | null> {
  try {
    const uploadUrl = await convex.mutation(api.files.generateUploadUrl, {})
    const res = await fetch(uploadUrl, { method: 'POST', body: file })
    if (!res.ok) throw new Error(`Upload failed (${res.status})`)
    const responseText = await res.text()
    let storageId: string
    try {
      const parsed = JSON.parse(responseText)
      storageId = parsed.storageId || parsed
    } catch {
      storageId = responseText
    }
    storageId = String(storageId).trim()
    const url = await convex.query(api.files.getFileUrl, { storageId: storageId as any })
    if (!url) throw new Error('Could not resolve file URL')
    return { storageId, url }
  } catch (err) {
    console.error(err)
    return null
  }
}

async function onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files?.length) return
  photosBusy.value = true
  error.value = null
  try {
    const start = images.value.length
    for (let i = 0; i < files.length; i += 1) {
      const uploaded = await uploadFile(files[i])
      if (!uploaded) {
        error.value = 'Some photos failed to upload'
        continue
      }
      if (editing.value && props.listing?._id) {
        const imageId = await convex.mutation(api.listings.addListingImage, {
          userEmail: props.userEmail,
          listingId: props.listing._id,
          storageId: uploaded.storageId as any,
          sortOrder: start + i,
        })
        images.value.push({
          _id: imageId as string,
          storageId: uploaded.storageId,
          url: uploaded.url,
          isNew: false,
        })
      } else {
        images.value.push({
          storageId: uploaded.storageId,
          url: uploaded.url,
          isNew: true,
        })
      }
    }
  } finally {
    photosBusy.value = false
    input.value = ''
  }
}

async function removeImage(index: number) {
  const img = images.value[index]
  if (!img) return
  photosBusy.value = true
  error.value = null
  try {
    if (img._id && editing.value) {
      await convex.mutation(api.listings.removeListingImage, {
        userEmail: props.userEmail,
        imageId: img._id as any,
      })
    }
    images.value.splice(index, 1)
    if (editing.value && props.listing?._id) {
      await persistOrder()
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Could not remove photo'
  } finally {
    photosBusy.value = false
  }
}

function onDragStart(index: number) {
  dragFrom.value = index
}

async function onDrop(targetIndex: number) {
  const from = dragFrom.value
  dragFrom.value = null
  if (from == null || from === targetIndex) return
  const next = [...images.value]
  const [moved] = next.splice(from, 1)
  next.splice(targetIndex, 0, moved)
  images.value = next
  if (editing.value && props.listing?._id) {
    photosBusy.value = true
    try {
      await persistOrder()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Could not reorder photos'
    } finally {
      photosBusy.value = false
    }
  }
}

async function persistOrder() {
  if (!props.listing?._id) return
  const orderedImageIds = images.value
    .map((img) => img._id)
    .filter(Boolean) as string[]
  if (!orderedImageIds.length) return
  await convex.mutation(api.listings.reorderListingImages, {
    userEmail: props.userEmail,
    listingId: props.listing._id,
    orderedImageIds: orderedImageIds as any,
  })
}

async function handleSubmit() {
  saving.value = true
  error.value = null
  try {
    const geo = await geocodeAddress(`${form.address1}, ${form.city}, ${form.state} ${form.zip}`)
    const payload = {
      userEmail: props.userEmail,
      title: form.title,
      listingType: form.listingType,
      assetType: form.assetType,
      priceCents: Math.round(Number(form.priceDollars) * 100),
      lotRentCents: form.lotRentDollars ? Math.round(Number(form.lotRentDollars) * 100) : undefined,
      beds: form.beds ? Number(form.beds) : undefined,
      baths: form.baths ? Number(form.baths) : undefined,
      sqft: form.sqft ? Number(form.sqft) : undefined,
      yearBuilt: form.yearBuilt ? Number(form.yearBuilt) : undefined,
      manufacturer: form.manufacturer || undefined,
      model: form.model || undefined,
      communityName: form.communityName || undefined,
      address1: form.address1,
      city: form.city,
      state: form.state.toUpperCase(),
      zip: form.zip,
      lat: geo.lat,
      lng: geo.lng,
      description: form.description || undefined,
    }

    if (editing.value && props.listing?._id) {
      await convex.mutation(api.listings.updateListing, {
        listingId: props.listing._id,
        ...payload,
      })
    } else {
      const listingId = await convex.mutation(api.listings.createListing, {
        ...payload,
        ...(props.organizationId ? { organizationId: props.organizationId as any } : {}),
      })
      for (let i = 0; i < images.value.length; i += 1) {
        const img = images.value[i]
        await convex.mutation(api.listings.addListingImage, {
          userEmail: props.userEmail,
          listingId: listingId as any,
          storageId: img.storageId as any,
          sortOrder: i,
        })
      }
    }

    emit('saved')
    emit('close')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Could not save listing'
  } finally {
    saving.value = false
  }
}
</script>
