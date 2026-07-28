<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
  >
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />
    <div class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background rounded-t-2xl sm:rounded-2xl border border-border shadow-xl">
      <div class="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold">{{ editing ? 'Edit listing' : 'New listing' }}</h2>
        <button type="button" class="text-muted-foreground hover:text-foreground" @click="$emit('close')">✕</button>
      </div>

      <form class="p-6 space-y-4" @submit.prevent="handleSubmit">
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
            <label class="auth-field-label">Price ($)</label>
            <Input v-model="form.priceDollars" type="number" min="0" step="1" required />
          </div>
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
            <label class="auth-field-label">Manufacturer</label>
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
            <Input v-model="form.state" required maxlength="2" placeholder="FL" />
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
          <Button type="submit" class="flex-1" :loading="saving" loading-text="Saving...">
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

const props = defineProps<{
  open: boolean
  userEmail: string
  listing?: any | null
}>()

const emit = defineEmits<{ close: []; saved: [] }>()

const saving = ref(false)
const error = ref<string | null>(null)
const editing = ref(false)

const emptyForm = () => ({
  title: '',
  listingType: 'SALE' as 'SALE' | 'RENT',
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
        state: l.state ?? '',
        zip: l.zip ?? '',
        description: l.description ?? '',
      })
    } else {
      editing.value = false
      Object.assign(form, emptyForm())
    }
  },
  { immediate: true },
)

async function handleSubmit() {
  saving.value = true
  error.value = null
  try {
    const geo = await geocodeAddress(`${form.address1}, ${form.city}, ${form.state} ${form.zip}`)
    const payload = {
      userEmail: props.userEmail,
      title: form.title,
      listingType: form.listingType,
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
      await convex.mutation(api.listings.createListing, payload)
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
