<template>
  <div class="relative h-full w-full min-h-[320px]" :class="roundedClass">
    <div ref="mapEl" class="absolute inset-0 bg-muted" :class="roundedClass" />
    <div
      v-if="mapReady"
      class="absolute right-3 top-3 z-[1] inline-flex overflow-hidden rounded-md border border-white/30 bg-black/55 p-0.5 shadow-lg backdrop-blur-sm"
    >
      <button
        type="button"
        class="rounded px-2 py-1 text-[11px] font-semibold leading-none transition-colors"
        :class="mapType === 'roadmap' ? 'bg-white text-black' : 'text-white/85 hover:text-white'"
        @click="setMapType('roadmap')"
      >
        Map
      </button>
      <button
        type="button"
        class="rounded px-2 py-1 text-[11px] font-semibold leading-none transition-colors"
        :class="mapType === 'hybrid' ? 'bg-white text-black' : 'text-white/85 hover:text-white'"
        @click="setMapType('hybrid')"
      >
        Satellite
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    listings: any[]
    selectedId?: string | null
    center?: { lat: number; lng: number }
    zoom?: number
    rounded?: boolean
  }>(),
  { rounded: true },
)

const emit = defineEmits<{ select: [id: string] }>()

const roundedClass = computed(() => (props.rounded ? 'rounded-xl' : 'rounded-none'))

const mapEl = ref<HTMLElement | null>(null)
const mapReady = ref(false)
const mapType = ref<'hybrid' | 'roadmap'>('hybrid')
const GOOGLE_MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim() ?? ''

let map: google.maps.Map | null = null
let markers: google.maps.Marker[] = []
let markerById = new Map<string, google.maps.Marker>()

function loadGoogleMapsScript(): Promise<void> {
  if (typeof google !== 'undefined' && google.maps) return Promise.resolve()
  return new Promise((resolve, reject) => {
    if (!GOOGLE_MAPS_API_KEY) {
      reject(new Error('Missing VITE_GOOGLE_MAPS_API_KEY'))
      return
    }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })
}

function pinIcon(selected: boolean): google.maps.Icon {
  // Unselected: solid primary with white rim (readable on satellite).
  // Selected: larger, brighter fill + yellow accent ring.
  const fill = selected ? '%238b5cf6' : '%236d28d9'
  const stroke = selected ? '%23fde68a' : '%23ffffff'
  const strokeWidth = selected ? 2.25 : 2
  const size = selected ? 46 : 34
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 36">
      <path fill="%23000000" opacity="0.35" d="M12 3C7.2 3 3.2 7 3.2 12.2c0 6.8 8.8 20.3 8.8 20.3s8.8-13.5 8.8-20.3C20.8 7 16.8 3 12 3z" transform="translate(0 1)"/>
      <path fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"
        d="M12 1C6.5 1 2 5.5 2 11c0 7.5 10 23 10 23s10-15.5 10-23C22 5.5 17.5 1 12 1z"/>
      <circle cx="12" cy="11" r="3.6" fill="%23ffffff"/>
    </svg>
  `.trim()
  return {
    url: `data:image/svg+xml;charset=UTF-8,${svg.replace(/\s+/g, ' ')}`,
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size),
  }
}

function setMapType(type: 'hybrid' | 'roadmap') {
  mapType.value = type
  map?.setMapTypeId(type)
}

function applySelectionStyles() {
  for (const [id, marker] of markerById) {
    const selected = id === props.selectedId
    marker.setIcon(pinIcon(selected))
    marker.setZIndex(selected ? 1000 : 1)
    marker.setAnimation(selected ? google.maps.Animation.BOUNCE : null)
    if (selected) {
      window.setTimeout(() => {
        if (markerById.get(id) === marker) marker.setAnimation(null)
      }, 700)
    }
  }
}

function syncMarkers() {
  if (!map) return
  markers.forEach((m) => m.setMap(null))
  markers = []
  markerById = new Map()

  for (const listing of props.listings) {
    if (listing.lat == null || listing.lng == null) continue
    const selected = listing._id === props.selectedId
    const marker = new google.maps.Marker({
      map,
      position: { lat: listing.lat, lng: listing.lng },
      title: listing.title,
      icon: pinIcon(selected),
      zIndex: selected ? 1000 : 1,
    })
    marker.addListener('click', () => emit('select', listing._id))
    markers.push(marker)
    markerById.set(listing._id, marker)
  }

  if (props.selectedId) {
    const selected = props.listings.find((l) => l._id === props.selectedId)
    if (selected?.lat != null && selected?.lng != null) {
      map.panTo({ lat: selected.lat, lng: selected.lng })
    }
  } else if (props.listings.length > 1) {
    const bounds = new google.maps.LatLngBounds()
    props.listings.forEach((l) => {
      if (l.lat != null && l.lng != null) bounds.extend({ lat: l.lat, lng: l.lng })
    })
    if (!bounds.isEmpty()) map.fitBounds(bounds, 48)
  }
}

onMounted(async () => {
  if (!mapEl.value) return
  try {
    await loadGoogleMapsScript()
    map = new google.maps.Map(mapEl.value, {
      center: props.center ?? { lat: 28.5383, lng: -81.3792 },
      zoom: props.zoom ?? 7,
      mapTypeId: 'hybrid',
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM,
      },
    })
    mapReady.value = true
    syncMarkers()
  } catch (err) {
    console.error(err)
    if (mapEl.value) {
      mapEl.value.innerHTML = '<div class="flex h-full items-center justify-center text-sm text-muted-foreground p-4 text-center">Add VITE_GOOGLE_MAPS_API_KEY to show the map.</div>'
    }
  }
})

watch(
  () => props.listings,
  () => syncMarkers(),
  { deep: true },
)

watch(
  () => props.selectedId,
  () => {
    if (!map || markerById.size === 0) {
      syncMarkers()
      return
    }
    applySelectionStyles()
    const selected = props.listings.find((l) => l._id === props.selectedId)
    if (selected?.lat != null && selected?.lng != null) {
      map.panTo({ lat: selected.lat, lng: selected.lng })
    }
  },
)

onUnmounted(() => {
  markers.forEach((m) => m.setMap(null))
  markers = []
  markerById.clear()
  map = null
})
</script>
