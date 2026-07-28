<template>
  <div>
    <h1 class="text-3xl font-bold mb-2">Seller approvals</h1>
    <p class="text-muted-foreground mb-8">Approve dealer accounts before they can publish listings.</p>

    <div v-if="!userStore.isAdmin" class="text-destructive">Admin access required.</div>
    <div v-else-if="loading" class="text-muted-foreground">Loading…</div>
    <div v-else-if="pending.length === 0" class="text-muted-foreground">No pending sellers.</div>
    <div v-else class="space-y-4">
      <Card v-for="item in pending" :key="item.organization._id">
        <CardContent class="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 class="font-semibold">{{ item.organization.name }}</h2>
            <p class="text-sm text-muted-foreground">{{ item.owner.name }} · {{ item.owner.email }}</p>
            <p v-if="item.organization.url" class="text-sm text-muted-foreground">{{ item.organization.url }}</p>
          </div>
          <Button @click="approve(item.organization._id)">Approve seller</Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import { useUserStore } from '@/stores/user'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'

const userStore = useUserStore()
const pending = ref<any[]>([])
const loading = ref(true)

async function load() {
  if (!userStore.user?.email) return
  pending.value = (await convex.query(api.organizations.getPendingSellers, {
    adminEmail: userStore.user.email,
  })) as any[]
}

async function approve(organizationId: string) {
  if (!userStore.user?.email) return
  await convex.mutation(api.organizations.approveOrganization, {
    adminEmail: userStore.user.email,
    organizationId: organizationId as any,
  })
  await load()
}

onMounted(async () => {
  try {
    await load()
  } finally {
    loading.value = false
  }
})
</script>
