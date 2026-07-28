<template>
  <input
    ref="inputRef"
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    :class="cn(
      'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      error ? 'border-destructive focus-visible:ring-destructive' : 'border-input focus-visible:ring-ring',
      $attrs.class as string
    )"
    v-bind="$attrs"
    autocomplete="off"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { cn } from '@/lib/utils'

const GOOGLE_MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim() ?? ''

defineProps<{
  modelValue?: string
  error?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'place-selected': [place: { address1: string; city: string; state: string; zip: string; country: string }]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
let autocomplete: google.maps.places.Autocomplete | null = null
let listener: google.maps.MapsEventListener | null = null
let scriptLoadPromise: Promise<void> | null = null

function loadGoogleMapsScript(): Promise<void> {
  if (typeof google !== 'undefined' && google.maps?.places) {
    return Promise.resolve()
  }

  if (scriptLoadPromise) return scriptLoadPromise

  const existing = document.getElementById('google-maps-places-script')
  if (existing) {
    scriptLoadPromise = new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Maps script')))
      if (typeof google !== 'undefined' && google.maps?.places) resolve()
    })
    return scriptLoadPromise
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = 'google-maps-places-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Maps script'))
    document.head.appendChild(script)
  })
  return scriptLoadPromise
}

function extractAddressComponents(place: google.maps.places.PlaceResult) {
  const components = place.address_components || []

  let streetNumber = ''
  let route = ''
  let city = ''
  let state = ''
  let zip = ''
  let country = ''

  for (const component of components) {
    const types = component.types
    if (types.includes('street_number')) {
      streetNumber = component.long_name
    } else if (types.includes('route')) {
      route = component.long_name
    } else if (types.includes('locality')) {
      city = component.long_name
    } else if (types.includes('postal_town') && !city) {
      city = component.long_name
    } else if (types.includes('administrative_area_level_2') && !city) {
      city = component.long_name
    } else if (types.includes('sublocality_level_1') && !city) {
      city = component.long_name
    } else if (types.includes('administrative_area_level_1')) {
      state = component.short_name
    } else if (types.includes('postal_code')) {
      zip = component.long_name
    } else if (types.includes('country')) {
      country = component.long_name
    }
  }

  const address1 = streetNumber ? `${streetNumber} ${route}` : route
  return { address1, city, state, zip, country }
}

async function initAutocomplete() {
  if (!inputRef.value) return

  if (!GOOGLE_MAPS_API_KEY) {
    if (import.meta.env.DEV) {
      console.warn(
        '[AddressAutocomplete] VITE_GOOGLE_MAPS_API_KEY is not set. Add it to .env.local at the repo root and enable Places API in Google Cloud.',
      )
    }
    return
  }

  try {
    await loadGoogleMapsScript()
  } catch {
    console.error('Google Maps Places script failed to load')
    return
  }

  if (!inputRef.value) return

  autocomplete = new google.maps.places.Autocomplete(inputRef.value, {
    types: ['address'],
    componentRestrictions: { country: 'us' },
    fields: ['address_components'],
  })

  listener = autocomplete.addListener('place_changed', () => {
    const place = autocomplete!.getPlace()
    if (!place.address_components) return

    const parsed = extractAddressComponents(place)
    emit('update:modelValue', parsed.address1)
    emit('place-selected', parsed)
  })
}

onMounted(() => {
  // nextTick: input may mount via Teleport (e.g. checkout modal on mobile)
  nextTick(() => initAutocomplete())
})

onBeforeUnmount(() => {
  if (listener) {
    google.maps.event.removeListener(listener)
  }
  if (autocomplete) {
    google.maps.event.clearInstanceListeners(autocomplete)
  }
})
</script>
