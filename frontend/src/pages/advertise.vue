<template>
  <div class="mx-auto max-w-2xl px-4 py-16 md:py-24">
    <div class="text-center">
      <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Advertise</p>
      <h1 class="mt-2 text-3xl font-extrabold tracking-tight">Reach home shoppers</h1>
      <p class="mt-3 text-sm text-muted-foreground">
        List inventory and grow your dealership presence on MH Marketplace. Full advertising
        products are coming soon — get started by creating a dealer account today.
      </p>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <router-link
          to="/signup?role=SELLER"
          class="inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
        >
          Sign up as a dealer
        </router-link>
        <router-link
          to="/dealers"
          class="inline-flex rounded-lg border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted"
        >
          Browse dealers
        </router-link>
      </div>
    </div>
  </div>
</template>
