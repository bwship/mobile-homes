<template>
  <div>
    <div v-if="loading" class="container py-16 text-muted-foreground">Loading company…</div>
    <div v-else-if="!org" class="container py-16 text-center">Company not found</div>
    <div v-else>
      <div class="border-b border-border/60 bg-card/40">
        <div class="container py-8 md:py-10">
          <p class="mb-4 text-[11px] leading-none text-muted-foreground">
            <router-link to="/" class="hover:text-foreground">Home</router-link>
            <template v-if="userStore.canAccessAdmin">
              <span class="mx-1.5">›</span>
              <router-link to="/admin/dealers" class="hover:text-foreground">Dealers</router-link>
            </template>
            <span class="mx-1.5">›</span>
            <span class="text-foreground">{{ org.name }}</span>
          </p>

          <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div class="flex min-w-0 flex-1 gap-4 sm:gap-5">
              <div class="shrink-0">
                <div
                  class="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background text-xl font-black tracking-tight text-primary sm:h-24 sm:w-24 sm:text-2xl"
                  :class="
                    canManage
                      ? 'cursor-pointer transition-colors ' +
                        (logoDragging ? 'border-primary border-dashed bg-primary/5' : 'hover:border-primary/50')
                      : ''
                  "
                  @click="canManage && triggerLogoPick()"
                  @dragenter.prevent="onLogoDragEnter"
                  @dragover.prevent="onLogoDragEnter"
                  @dragleave.prevent="onLogoDragLeave"
                  @drop.prevent="onLogoDrop"
                >
                  <img
                    v-if="logoDisplayUrl"
                    :src="logoDisplayUrl"
                    :alt="org.name"
                    class="pointer-events-none h-full w-full object-contain p-2"
                  />
                  <span v-else class="pointer-events-none">{{ initials }}</span>

                  <div
                    v-if="canManage"
                    class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    :class="logoDragging || uploadingLogo ? 'opacity-100' : ''"
                  >
                    <span class="px-2 text-center text-[10px] font-semibold uppercase tracking-wide">
                      {{ uploadingLogo ? 'Uploading…' : logoDragging ? 'Drop photo' : 'Change photo' }}
                    </span>
                  </div>
                </div>

                <div v-if="canManage" class="mt-2 flex items-center justify-center gap-1">
                  <button
                    type="button"
                    class="rounded px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    :disabled="uploadingLogo"
                    @click.stop="triggerLogoPick"
                  >
                    Change photo
                  </button>
                  <button
                    v-if="logoDisplayUrl"
                    type="button"
                    class="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                    aria-label="Remove photo"
                    title="Remove photo"
                    :disabled="uploadingLogo"
                    @click.stop="openRemoveLogoConfirm"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </button>
                </div>

                <input
                  ref="logoInputRef"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="onLogoSelected"
                />
              </div>
              <div class="min-w-0">
                <h1 class="text-3xl font-extrabold tracking-tight md:text-4xl">{{ org.name }}</h1>
                <p class="mt-1 text-sm text-muted-foreground">
                  Dealer
                  <span v-if="memberSince"> · Member since {{ memberSince }}</span>
                  <span v-if="org.memberCount"> · {{ org.memberCount }} team</span>
                </p>
                <div v-if="org.teamPreview?.length" class="mt-3 flex -space-x-2">
                  <div
                    v-for="member in org.teamPreview"
                    :key="member._id"
                    class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-muted text-[10px] font-bold"
                    :title="member.name"
                  >
                    <img
                      v-if="member.imageUrl"
                      :src="member.imageUrl"
                      :alt="member.name"
                      class="h-full w-full object-cover"
                    />
                    <span v-else>{{ memberInitials(member.name) }}</span>
                  </div>
                </div>
                <p v-if="org.phone" class="mt-2 text-sm text-muted-foreground">{{ formatPhone(org.phone) }}</p>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <a
                v-if="org.url"
                :href="org.url"
                target="_blank"
                rel="noopener"
                class="inline-flex h-10 items-center gap-2 rounded-full border border-primary/40 px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                Website
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </a>
              <Button
                v-if="userStore.canAccessAdmin && org.ownerApproved === false"
                :disabled="approving"
                @click="approveDealer"
              >
                {{ approving ? 'Approving…' : 'Approve' }}
              </Button>
              <Button v-if="canManage" @click="openCreate">+ Add Listing</Button>
            </div>
          </div>
        </div>

        <div v-if="org.stats" class="border-t border-border/60 bg-muted/30">
          <div class="container grid grid-cols-2 gap-4 py-5 sm:grid-cols-3 lg:grid-cols-6">
            <div class="text-center">
              <p class="text-lg font-extrabold tabular-nums text-deal md:text-xl">
                {{ formatMoney(org.stats.soldVolumeCents) }}
              </p>
              <p class="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sold volume</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-extrabold tabular-nums md:text-xl">{{ org.stats.closed }}</p>
              <p class="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Closed</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-extrabold tabular-nums md:text-xl">{{ org.stats.live }}</p>
              <p class="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Live</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-extrabold tabular-nums md:text-xl">{{ org.stats.forSale }}</p>
              <p class="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">For sale</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-extrabold tabular-nums md:text-xl">{{ org.stats.forRent }}</p>
              <p class="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">For rent</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-extrabold tabular-nums text-deal md:text-xl">
                {{ formatMoney(org.stats.leasedVolumeCents) }}
              </p>
              <p class="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Leased</p>
            </div>
          </div>
        </div>
      </div>

      <div class="container py-8 md:py-10">
        <div
          v-if="canManage && userStore.canAccessAdmin && !isOwnDealer"
          class="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm"
        >
          <p>
            Viewing as admin — you can manage this dealer’s profile and listings here.
            <span v-if="org.ownerApproved === false" class="font-medium text-amber-700 dark:text-amber-400">
              This dealer is pending approval.
            </span>
          </p>
          <Button
            v-if="org.ownerApproved === false"
            size="sm"
            :disabled="approving"
            @click="approveDealer"
          >
            {{ approving ? 'Approving…' : 'Approve dealer' }}
          </Button>
        </div>

        <div
          v-if="canManage && !userStore.user?.isApproved && isOwnDealer"
          class="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm dark:border-yellow-900 dark:bg-yellow-900/20"
        >
          Your dealer account is pending approval. You can draft listings, but they won't go live until an admin
          approves your account and each listing.
        </div>

        <div class="mb-6 flex flex-wrap items-center gap-1 border-b border-border/60">
          <button
            v-for="tab in mainTabs"
            :key="tab.id"
            type="button"
            class="whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors"
            :class="
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
            "
            @click="setTab(tab.id)"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- About -->
        <section v-if="activeTab === 'about'">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <h2 class="text-lg font-bold">About</h2>
                <Button
                  v-if="canManage"
                  size="icon"
                  variant="ghost"
                  type="button"
                  class="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary"
                  aria-label="Edit profile"
                  title="Edit profile"
                  @click="openEditProfile"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                    />
                  </svg>
                </Button>
              </div>
              <p v-if="org.description" class="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {{ org.description }}
              </p>
              <p v-else class="mt-4 text-sm text-muted-foreground">
                {{ canManage ? 'No about text yet. Use the pencil to add a company bio.' : 'No about information yet.' }}
              </p>
              <dl v-if="org.url || org.phone" class="mt-6 space-y-2 text-sm">
                <div v-if="org.url" class="flex gap-2">
                  <dt class="w-24 shrink-0 text-muted-foreground">Website</dt>
                  <dd>
                    <a
                      :href="org.url"
                      target="_blank"
                      rel="noopener"
                      class="inline-flex items-center gap-1.5 text-primary hover:underline"
                    >
                      {{ org.url }}
                      <svg class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                        />
                      </svg>
                    </a>
                  </dd>
                </div>
                <div v-if="org.phone" class="flex gap-2">
                  <dt class="w-24 shrink-0 text-muted-foreground">Phone</dt>
                  <dd>{{ formatPhone(org.phone) }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <!-- Deals -->
        <section v-else-if="activeTab === 'deals'">
          <h2 class="mb-4 text-lg font-bold">Closed deals</h2>
          <div v-if="dealListings.length === 0" class="py-12 text-center text-muted-foreground">
            No closed deals yet.
          </div>
          <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <ClosedDealCard
              v-for="listing in dealListings"
              :key="listing._id"
              :listing="listing"
              variant="grid"
            />
          </div>
        </section>

        <!-- Listings -->
        <section v-else-if="activeTab === 'listings'">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-lg font-bold">Listings</h2>
            <Button v-if="canManage" size="sm" @click="openCreate">+ Add Listing</Button>
          </div>
          <div v-if="canManage" class="mb-5 flex flex-wrap gap-2">
            <button
              v-for="chip in listingChips"
              :key="chip.id"
              type="button"
              class="rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
              :class="
                listingFilter === chip.id
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              "
              @click="listingFilter = chip.id"
            >
              {{ chip.label }}
            </button>
          </div>
          <div v-if="filteredListings.length === 0" class="py-12 text-center text-muted-foreground">
            No listings in this section.
          </div>
          <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div v-for="listing in filteredListings" :key="listing._id" class="relative">
              <ListingCard :listing="listing" />
              <div v-if="canManage" class="mt-2 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" @click="editListing(listing)">Edit</Button>
                <Button
                  v-if="listing.status === 'APPROVED'"
                  size="sm"
                  @click="markSold(listing._id)"
                >
                  Mark sold
                </Button>
                <Button
                  v-if="listing.status !== 'ARCHIVED' && listing.status !== 'SOLD'"
                  size="sm"
                  variant="outline"
                  @click="archiveListing(listing._id)"
                >
                  Archive
                </Button>
              </div>
            </div>
          </div>
        </section>

        <!-- Team -->
        <section v-else-if="activeTab === 'team'">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-lg font-bold">Team</h2>
            <Button
              v-if="canManage"
              size="icon"
              variant="outline"
              type="button"
              aria-label="Invite member"
              title="Invite member"
              @click="openInviteModal"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </Button>
          </div>

          <div v-if="!team?.members?.length" class="py-8 text-center text-muted-foreground">No team members yet.</div>
          <ul v-else class="divide-y divide-border rounded-xl border border-border">
            <li
              v-for="row in team.members"
              :key="row.membershipId"
              class="flex flex-wrap items-center gap-3 px-4 py-3"
            >
              <div
                class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-bold"
              >
                <img
                  v-if="row.user.imageUrl"
                  :src="row.user.imageUrl"
                  :alt="row.user.name"
                  class="h-full w-full object-cover"
                />
                <span v-else>{{ memberInitials(row.user.name) }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold">{{ row.user.name }}</p>
                <p class="truncate text-xs text-muted-foreground">{{ row.user.email }}</p>
              </div>
              <span class="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                {{ row.role }}
              </span>
              <template v-if="canManage && row.role !== 'OWNER'">
                <select
                  class="h-8 rounded-md border border-input bg-background px-2 text-xs"
                  :value="row.role"
                  @change="changeRole(row.membershipId, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MEMBER">Member</option>
                </select>
                <Button size="sm" variant="outline" @click="removeTeamMember(row.membershipId)">Remove</Button>
              </template>
            </li>
          </ul>

          <div v-if="canManage && team?.pendingInvites?.length" class="mt-8">
            <h3 class="mb-3 text-sm font-semibold">Pending invites</h3>
            <ul class="divide-y divide-border rounded-xl border border-border">
              <li
                v-for="invite in team.pendingInvites"
                :key="invite._id"
                class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div>
                  <p class="font-medium">{{ invite.name || invite.email }}</p>
                  <p class="text-xs text-muted-foreground">
                    <span v-if="invite.name">{{ invite.email }} · </span>
                    {{ invite.role }} · expires {{ formatDate(invite.expiresAt) }}
                  </p>
                </div>
                <Button size="sm" variant="outline" @click="revokeTeamInvite(invite._id)">Revoke</Button>
              </li>
            </ul>
          </div>
        </section>

        <!-- Insights -->
        <section v-else-if="activeTab === 'insights'">
          <h2 class="mb-4 text-lg font-bold">Insights</h2>
          <div v-if="!insights" class="py-12 text-center text-muted-foreground">No insight data yet.</div>
          <div v-else class="space-y-8">
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div class="rounded-xl border border-border bg-card/40 p-4">
                <p class="text-2xl font-extrabold tabular-nums">{{ insights.liveCount }}</p>
                <p class="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Live</p>
              </div>
              <div class="rounded-xl border border-border bg-card/40 p-4">
                <p class="text-2xl font-extrabold tabular-nums">{{ insights.closedCount }}</p>
                <p class="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Closed</p>
              </div>
              <div class="rounded-xl border border-border bg-card/40 p-4">
                <p class="text-2xl font-extrabold tabular-nums text-primary">
                  {{ formatMoney(insights.soldVolumeCents) }}
                </p>
                <p class="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Sold volume</p>
              </div>
              <div class="rounded-xl border border-border bg-card/40 p-4">
                <p class="text-2xl font-extrabold tabular-nums">
                  {{ formatMoney(insights.leasedVolumeCents) }}
                </p>
                <p class="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Leased volume</p>
              </div>
            </div>

            <div class="grid gap-6 lg:grid-cols-2">
              <div class="rounded-xl border border-border p-4">
                <h3 class="text-sm font-semibold">Sale vs lease (closed)</h3>
                <div class="mt-4 flex h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    class="bg-primary transition-all"
                    :style="{ width: saleLeasePct.sale + '%' }"
                    :title="`Sales ${insights.saleCount}`"
                  />
                  <div
                    class="bg-deal transition-all"
                    :style="{ width: saleLeasePct.lease + '%' }"
                    :title="`Leases ${insights.leaseCount}`"
                  />
                </div>
                <div class="mt-3 flex gap-4 text-xs text-muted-foreground">
                  <span><span class="mr-1 inline-block h-2 w-2 rounded-full bg-primary" />Sales {{ insights.saleCount }}</span>
                  <span><span class="mr-1 inline-block h-2 w-2 rounded-full bg-deal" />Leases {{ insights.leaseCount }}</span>
                </div>
              </div>

              <div class="rounded-xl border border-border p-4">
                <h3 class="text-sm font-semibold">Top states</h3>
                <ul v-if="insights.topStates.length" class="mt-4 space-y-2">
                  <li v-for="row in insights.topStates" :key="row.state" class="flex items-center gap-3 text-sm">
                    <span class="w-8 font-semibold">{{ row.state }}</span>
                    <div class="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        class="h-full rounded-full bg-primary/80"
                        :style="{ width: stateBarWidth(row.count) + '%' }"
                      />
                    </div>
                    <span class="w-6 text-right tabular-nums text-muted-foreground">{{ row.count }}</span>
                  </li>
                </ul>
                <p v-else class="mt-4 text-sm text-muted-foreground">No location data yet.</p>
              </div>
            </div>

            <div class="rounded-xl border border-border p-4">
              <h3 class="text-sm font-semibold">Closed volume by month</h3>
              <div v-if="insights.volumeByMonth.length" class="mt-4 flex h-40 items-end gap-2">
                <div
                  v-for="row in insights.volumeByMonth"
                  :key="row.month"
                  class="flex min-w-0 flex-1 flex-col items-center gap-1"
                >
                  <div
                    class="w-full max-w-10 rounded-t bg-primary/80 transition-all"
                    :style="{ height: monthBarHeight(row) + '%' }"
                    :title="`${row.month}: ${formatMoney(row.salesCents + row.leaseCents)}`"
                  />
                  <span class="truncate text-[10px] text-muted-foreground">{{ row.month.slice(5) }}</span>
                </div>
              </div>
              <p v-else class="mt-4 text-sm text-muted-foreground">No closed deals yet.</p>
            </div>
          </div>
        </section>
      </div>

      <!-- Remove logo confirm -->
      <div
        v-if="removeLogoOpen"
        class="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      >
        <div class="absolute inset-0 bg-black/50" @click="removeLogoOpen = false" />
        <div
          class="relative w-full max-w-sm rounded-t-2xl border border-border bg-background p-6 shadow-xl sm:rounded-2xl"
        >
          <h2 class="text-lg font-semibold">Remove photo?</h2>
          <p class="mt-2 text-sm text-muted-foreground">
            This will remove the company logo from the dealer page. You can upload a new one anytime.
          </p>
          <div class="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" :disabled="uploadingLogo" @click="removeLogoOpen = false">
              Cancel
            </Button>
            <Button type="button" variant="destructive" :disabled="uploadingLogo" @click="confirmRemoveLogo">
              {{ uploadingLogo ? 'Removing…' : 'Remove photo' }}
            </Button>
          </div>
        </div>
      </div>

      <!-- Edit profile modal -->
      <div
        v-if="editOpen"
        class="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      >
        <div class="absolute inset-0 bg-black/50" @click="editOpen = false" />
        <div
          class="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-background shadow-xl sm:rounded-2xl"
        >
          <div class="sticky top-0 flex items-center justify-between border-b border-border bg-background px-6 py-4">
            <h2 class="text-lg font-semibold">Edit profile</h2>
            <button type="button" class="text-muted-foreground hover:text-foreground" @click="editOpen = false">
              ✕
            </button>
          </div>
          <form class="space-y-4 p-6" @submit.prevent="saveProfile">
            <div>
              <label class="auth-field-label">Company name</label>
              <Input v-model="editForm.name" required />
            </div>
            <div>
              <label class="auth-field-label">Phone</label>
              <Input
                :model-value="editForm.phone"
                type="tel"
                inputmode="tel"
                placeholder="(555) 010-0100"
                @update:model-value="editForm.phone = formatPhone(String($event))"
              />
            </div>
            <div>
              <label class="auth-field-label">Website</label>
              <Input v-model="editForm.url" type="url" placeholder="https://" />
            </div>
            <div>
              <label class="auth-field-label">About</label>
              <textarea
                v-model="editForm.description"
                rows="5"
                class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Tell buyers about your dealership…"
              />
            </div>
            <p v-if="editMessage" class="text-sm" :class="editError ? 'text-destructive' : 'text-muted-foreground'">
              {{ editMessage }}
            </p>
            <div class="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" @click="editOpen = false">Cancel</Button>
              <Button type="submit" :disabled="savingProfile">{{ savingProfile ? 'Saving…' : 'Save' }}</Button>
            </div>
          </form>
        </div>
      </div>

      <!-- Invite member modal -->
      <div
        v-if="inviteOpen"
        class="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      >
        <div class="absolute inset-0 bg-black/50" @click="closeInviteModal" />
        <div
          class="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-border bg-background shadow-xl sm:rounded-2xl"
        >
          <div class="sticky top-0 flex items-center justify-between border-b border-border bg-background px-6 py-4">
            <h2 class="text-lg font-semibold">Invite member</h2>
            <button type="button" class="text-muted-foreground hover:text-foreground" @click="closeInviteModal">
              ✕
            </button>
          </div>
          <form class="space-y-4 p-6" @submit.prevent="sendInvite">
            <div>
              <label class="auth-field-label">Name</label>
              <Input v-model="inviteName" required placeholder="Jordan Lee" />
            </div>
            <div>
              <label class="auth-field-label">Email</label>
              <Input v-model="inviteEmail" type="email" required placeholder="colleague@example.com" />
            </div>
            <div>
              <label class="auth-field-label">Role</label>
              <select
                v-model="inviteRole"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <p v-if="inviteMessage" class="text-sm" :class="inviteError ? 'text-destructive' : 'text-muted-foreground'">
              {{ inviteMessage }}
            </p>
            <p v-if="lastInviteToken" class="break-all rounded-md bg-muted/60 p-2 text-xs">
              Accept link (share manually):
              <code>{{ inviteAcceptUrl }}</code>
            </p>
            <div class="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" @click="closeInviteModal">
                {{ lastInviteToken && !inviteError ? 'Done' : 'Cancel' }}
              </Button>
              <Button
                v-if="!lastInviteToken || inviteError"
                type="submit"
                :disabled="inviting"
              >
                {{ inviting ? 'Inviting…' : 'Send invite' }}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <ListingModal
        :open="modalOpen"
        :user-email="userStore.adminApiEmail || userStore.user?.email || ''"
        :organization-id="orgId"
        :listing="editingListing"
        @close="modalOpen = false"
        @saved="onListingSaved"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { convex } from '@/lib/convex'
import { api } from '@/lib/convex-generated'
import { useUserStore } from '@/stores/user'
import { formatListingPrice } from '@/lib/listingFormat'
import { formatPhone } from '@/lib/utils'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import ListingCard from '@/components/listings/ListingCard.vue'
import ClosedDealCard from '@/components/listings/ClosedDealCard.vue'
import ListingModal from '@/components/listings/ListingModal.vue'

type MainTab = 'about' | 'deals' | 'listings' | 'team' | 'insights'
type ListingFilter = 'APPROVED' | 'PENDING' | 'ARCHIVED'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const org = ref<any>(null)
const listings = ref<any[]>([])
const team = ref<any>(null)
const insights = ref<any>(null)
const loading = ref(true)
const listingFilter = ref<ListingFilter>('APPROVED')
const modalOpen = ref(false)
const editingListing = ref<any | null>(null)
const approving = ref(false)

const editOpen = ref(false)
const savingProfile = ref(false)
const uploadingLogo = ref(false)
const editMessage = ref('')
const editError = ref(false)
const editForm = ref({ name: '', phone: '', url: '', description: '' })
const logoInputRef = ref<HTMLInputElement | null>(null)
const logoPreview = ref<string | null>(null)
const logoDragging = ref(false)
const removeLogoOpen = ref(false)
let logoDragDepth = 0

const inviteOpen = ref(false)
const inviteName = ref('')
const inviteEmail = ref('')
const inviteRole = ref<'ADMIN' | 'MEMBER'>('MEMBER')
const inviting = ref(false)
const inviteMessage = ref('')
const inviteError = ref(false)
const lastInviteToken = ref<string | null>(null)

const orgId = computed(() => route.params.id as string)

const canManage = computed(() => Boolean(org.value?.canManage))

const isOwnDealer = computed(() => userStore.user?.organizationId === orgId.value)

const mainTabs = [
  { id: 'about' as const, label: 'About' },
  { id: 'deals' as const, label: 'Deals' },
  { id: 'listings' as const, label: 'Listings' },
  { id: 'team' as const, label: 'Team' },
  { id: 'insights' as const, label: 'Insights' },
]

const activeTab = computed<MainTab>(() => {
  const tab = String(route.query.tab || 'about').toLowerCase()
  if (mainTabs.some((t) => t.id === tab)) return tab as MainTab
  return 'about'
})

const listingChips = [
  { id: 'APPROVED' as const, label: 'Live' },
  { id: 'PENDING' as const, label: 'Pending' },
  { id: 'ARCHIVED' as const, label: 'Archived' },
]

const initials = computed(() => {
  const name = String(org.value?.name ?? 'D')
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? '')
    .join('')
})

const memberSince = computed(() => {
  const ts = org.value?.createdAt
  if (!ts) return null
  return new Date(ts).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const dealListings = computed(() => listings.value.filter((l) => l.status === 'SOLD'))

const filteredListings = computed(() => {
  if (!canManage.value) {
    return listings.value.filter((l) => l.status === 'APPROVED')
  }
  return listings.value.filter((l) => l.status === listingFilter.value)
})

const inviteAcceptUrl = computed(() => {
  if (!lastInviteToken.value || typeof window === 'undefined') return ''
  return `${window.location.origin}/dealers/${orgId.value}?tab=team&invite=${lastInviteToken.value}`
})

const saleLeasePct = computed(() => {
  const sale = insights.value?.saleCount ?? 0
  const lease = insights.value?.leaseCount ?? 0
  const total = sale + lease
  if (!total) return { sale: 0, lease: 0 }
  return { sale: (sale / total) * 100, lease: (lease / total) * 100 }
})

function memberInitials(name: string) {
  return String(name || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function formatMoney(cents: number) {
  if (!cents) return '$0'
  if (cents >= 100_000_000) return `$${(cents / 100_000_000).toFixed(1)}M`
  return formatListingPrice(cents, 'SALE')
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function stateBarWidth(count: number) {
  const max = insights.value?.topStates?.[0]?.count || 1
  return Math.max(8, (count / max) * 100)
}

function monthBarHeight(row: { salesCents: number; leaseCents: number }) {
  const vols = (insights.value?.volumeByMonth ?? []).map(
    (r: any) => r.salesCents + r.leaseCents,
  )
  const max = Math.max(...vols, 1)
  const val = row.salesCents + row.leaseCents
  return Math.max(4, (val / max) * 100)
}

async function approveDealer() {
  if (!userStore.adminApiEmail || !orgId.value) return
  approving.value = true
  try {
    await convex.mutation(api.organizations.approveOrganization, {
      adminEmail: userStore.adminApiEmail,
      organizationId: orgId.value as any,
    })
    await loadOrg()
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Could not approve dealer')
  } finally {
    approving.value = false
  }
}

function setTab(tab: MainTab) {
  router.replace({ query: { ...route.query, tab } })
}

function openEditProfile() {
  editForm.value = {
    name: org.value?.name ?? '',
    phone: formatPhone(org.value?.phone ?? ''),
    url: org.value?.url ?? '',
    description: org.value?.description ?? '',
  }
  editMessage.value = ''
  editError.value = false
  editOpen.value = true
}

const logoDisplayUrl = computed(() => logoPreview.value || org.value?.imageUrl || null)

function triggerLogoPick() {
  if (!canManage.value || uploadingLogo.value) return
  logoInputRef.value?.click()
}

function onLogoDragEnter(event: DragEvent) {
  if (!canManage.value) return
  event.preventDefault()
  logoDragDepth += 1
  logoDragging.value = true
}

function onLogoDragLeave() {
  if (!canManage.value) return
  logoDragDepth = Math.max(0, logoDragDepth - 1)
  if (logoDragDepth === 0) logoDragging.value = false
}

async function onLogoDrop(event: DragEvent) {
  if (!canManage.value) return
  logoDragDepth = 0
  logoDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) await uploadLogoFile(file)
}

async function onLogoSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) await uploadLogoFile(file)
}

async function uploadLogoFile(file: File) {
  const email = userStore.adminApiEmail || userStore.user?.email
  if (!email || !canManage.value) return

  if (!file.type.startsWith('image/')) {
    alert('Please choose an image file.')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    alert('Logo must be under 5MB.')
    return
  }

  uploadingLogo.value = true
  try {
    const uploadUrl = await convex.mutation(api.files.generateUploadUrl, {})
    const result = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    })
    if (!result.ok) throw new Error('Upload failed')
    const { storageId } = await result.json()

    if (logoPreview.value) URL.revokeObjectURL(logoPreview.value)
    logoPreview.value = URL.createObjectURL(file)

    await convex.mutation(api.organizations.updateOrganization, {
      userEmail: email,
      organizationId: orgId.value as any,
      imageStorageId: storageId as any,
    })
    await loadOrg()
    if (logoPreview.value) {
      URL.revokeObjectURL(logoPreview.value)
      logoPreview.value = null
    }
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Could not upload logo')
  } finally {
    uploadingLogo.value = false
  }
}

function openRemoveLogoConfirm() {
  if (!canManage.value || uploadingLogo.value) return
  removeLogoOpen.value = true
}

async function confirmRemoveLogo() {
  const email = userStore.adminApiEmail || userStore.user?.email
  if (!email || !canManage.value) return
  uploadingLogo.value = true
  try {
    if (logoPreview.value) {
      URL.revokeObjectURL(logoPreview.value)
      logoPreview.value = null
    }
    await convex.mutation(api.organizations.updateOrganization, {
      userEmail: email,
      organizationId: orgId.value as any,
      clearImage: true,
    })
    removeLogoOpen.value = false
    await loadOrg()
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Could not remove logo')
  } finally {
    uploadingLogo.value = false
  }
}

async function saveProfile() {
  const email = userStore.adminApiEmail || userStore.user?.email
  if (!email) return
  savingProfile.value = true
  editMessage.value = ''
  editError.value = false
  try {
    await convex.mutation(api.organizations.updateOrganization, {
      userEmail: email,
      organizationId: orgId.value as any,
      name: editForm.value.name,
      phone: editForm.value.phone || undefined,
      url: editForm.value.url || undefined,
      description: editForm.value.description || undefined,
    })
    editOpen.value = false
    await loadOrg()
  } catch (err) {
    editError.value = true
    editMessage.value = err instanceof Error ? err.message : 'Could not save profile'
  } finally {
    savingProfile.value = false
  }
}

async function loadOrg() {
  org.value = await convex.query(api.organizations.getOrganization, {
    organizationId: orgId.value as any,
    viewerEmail: userStore.adminApiEmail || userStore.user?.email,
  })
}

async function loadListings() {
  const email = userStore.adminApiEmail || userStore.user?.email
  listings.value = (await convex.query(api.listings.getOrganizationListings, {
    organizationId: orgId.value as any,
    userEmail: email,
    includeNonPublic: Boolean(org.value?.canManage),
  })) as any[]
}

async function loadTeam() {
  team.value = await convex.query(api.organizations.getOrganizationTeam, {
    organizationId: orgId.value as any,
    viewerEmail: userStore.adminApiEmail || userStore.user?.email,
  })
}

async function loadInsights() {
  insights.value = await convex.query(api.organizations.getOrganizationInsights, {
    organizationId: orgId.value as any,
  })
}

function openCreate() {
  editingListing.value = null
  modalOpen.value = true
}

function editListing(listing: any) {
  editingListing.value = listing
  modalOpen.value = true
}

async function onListingSaved() {
  await loadListings()
  await loadOrg()
  if (activeTab.value === 'insights') await loadInsights()
}

async function archiveListing(listingId: string) {
  if (!userStore.user?.email) return
  await convex.mutation(api.listings.updateListing, {
    userEmail: userStore.user.email,
    listingId: listingId as any,
    status: 'ARCHIVED',
  })
  await onListingSaved()
}

async function markSold(listingId: string) {
  if (!userStore.user?.email) return
  await convex.mutation(api.listings.markListingSold, {
    userEmail: userStore.user.email,
    listingId: listingId as any,
  })
  await onListingSaved()
}

function openInviteModal() {
  inviteName.value = ''
  inviteEmail.value = ''
  inviteRole.value = 'MEMBER'
  inviteMessage.value = ''
  inviteError.value = false
  lastInviteToken.value = null
  inviteOpen.value = true
}

function closeInviteModal() {
  inviteOpen.value = false
}

async function sendInvite() {
  const email = userStore.adminApiEmail || userStore.user?.email
  if (!email) return
  inviting.value = true
  inviteMessage.value = ''
  inviteError.value = false
  lastInviteToken.value = null
  try {
    const result = await convex.mutation(api.organizations.inviteTeamMember, {
      userEmail: email,
      organizationId: orgId.value as any,
      name: inviteName.value,
      email: inviteEmail.value,
      role: inviteRole.value,
    })
    if (result.attached) {
      inviteMessage.value = 'User already had an account — added to the team.'
      inviteOpen.value = false
    } else {
      inviteMessage.value = 'Invite created. Share the accept link below (email sending not wired yet).'
      lastInviteToken.value = result.token
    }
    inviteName.value = ''
    inviteEmail.value = ''
    await loadTeam()
    await loadOrg()
  } catch (err) {
    inviteError.value = true
    inviteMessage.value = err instanceof Error ? err.message : 'Could not invite'
  } finally {
    inviting.value = false
  }
}

async function revokeTeamInvite(inviteId: string) {
  const email = userStore.adminApiEmail || userStore.user?.email
  if (!email) return
  await convex.mutation(api.organizations.revokeInvite, {
    userEmail: email,
    inviteId: inviteId as any,
  })
  await loadTeam()
}

async function changeRole(membershipId: string, role: string) {
  const email = userStore.adminApiEmail || userStore.user?.email
  if (!email || (role !== 'ADMIN' && role !== 'MEMBER')) return
  await convex.mutation(api.organizations.updateMemberRole, {
    userEmail: email,
    membershipId: membershipId as any,
    role,
  })
  await loadTeam()
}

async function removeTeamMember(membershipId: string) {
  const email = userStore.adminApiEmail || userStore.user?.email
  if (!email) return
  if (!confirm('Remove this team member?')) return
  await convex.mutation(api.organizations.removeMember, {
    userEmail: email,
    membershipId: membershipId as any,
  })
  await loadTeam()
  await loadOrg()
}

async function tryAcceptInviteFromQuery() {
  const token = route.query.invite
  if (!token || typeof token !== 'string' || !userStore.user?.email) return
  try {
    await convex.mutation(api.organizations.acceptInvite, {
      userEmail: userStore.user.email,
      token,
    })
    const q = { ...route.query }
    delete q.invite
    await router.replace({ query: q })
    await loadTeam()
    await loadOrg()
    await userStore.fetchUserByEmail(userStore.user.email)
  } catch (err) {
    console.warn('Invite accept failed', err)
  }
}

async function load() {
  loading.value = true
  try {
    await loadOrg()
    await loadListings()
    if (activeTab.value === 'team') await loadTeam()
    if (activeTab.value === 'insights') await loadInsights()
    await tryAcceptInviteFromQuery()
  } finally {
    loading.value = false
  }
}

watch(orgId, load)

watch(activeTab, async (tab) => {
  if (tab === 'team' && !team.value) await loadTeam()
  if (tab === 'insights' && !insights.value) await loadInsights()
  if (tab === 'listings' || tab === 'deals') await loadListings()
})

watch(
  () => userStore.user?.email,
  async () => {
    await loadOrg()
    await loadListings()
    if (canManage.value) await loadTeam()
    await tryAcceptInviteFromQuery()
  },
)

onMounted(load)

onUnmounted(() => {
  if (logoPreview.value) URL.revokeObjectURL(logoPreview.value)
})
</script>
