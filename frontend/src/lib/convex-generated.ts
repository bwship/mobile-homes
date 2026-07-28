export const api = {
  auth: {
    signup: 'auth:signup' as any,
    login: 'auth:login' as any,
    requestPasswordReset: 'auth:requestPasswordReset' as any,
    resetPassword: 'auth:resetPassword' as any,
  },
  users: {
    getCurrentUser: 'users:getCurrentUser' as any,
    getUserByEmail: 'users:getUserByEmail' as any,
    listAllUsers: 'users:listAllUsers' as any,
    adminSetUserApproved: 'users:adminSetUserApproved' as any,
    updateProfile: 'users:updateProfile' as any,
  },
  organizations: {
    getOrganization: 'organizations:getOrganization' as any,
    getMyOrganization: 'organizations:getMyOrganization' as any,
    getAllSellerOrganizations: 'organizations:getAllSellerOrganizations' as any,
    getPendingSellers: 'organizations:getPendingSellers' as any,
    approveOrganization: 'organizations:approveOrganization' as any,
    updateOrganization: 'organizations:updateOrganization' as any,
  },
  listings: {
    getListingStats: 'listings:getListingStats' as any,
    getPublicListings: 'listings:getPublicListings' as any,
    getPublicListing: 'listings:getPublicListing' as any,
    getOrganizationListings: 'listings:getOrganizationListings' as any,
    getPendingListings: 'listings:getPendingListings' as any,
    createListing: 'listings:createListing' as any,
    updateListing: 'listings:updateListing' as any,
    adminUpdateListingStatus: 'listings:adminUpdateListingStatus' as any,
    addListingImage: 'listings:addListingImage' as any,
    submitListingInquiry: 'listings:submitListingInquiry' as any,
  },
  favorites: {
    getUserFavorites: 'favorites:getUserFavorites' as any,
    isFavorite: 'favorites:isFavorite' as any,
    toggleFavorite: 'favorites:toggleFavorite' as any,
  },
  files: {
    generateUploadUrl: 'files:generateUploadUrl' as any,
    getFileUrl: 'files:getFileUrl' as any,
  },
  seed: {
    seedDemo: 'seed:seedDemo' as any,
  },
}
