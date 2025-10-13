/**
 * Feature flags for ScryVault
 * Use these to enable/disable features during development
 */
export const FEATURES = {
    // Barcode scanner (Phase 1)
    // Set to true once scanner component is tested and integrated
    BARCODE_SCANNER: true,

    // eBay integration (Phase 2)
    // Set to true once OAuth and listing flows are fully tested
    EBAY_INTEGRATION: true,

    // Always on features
    DEMO_MODE: true,
    MANUAL_ISBN_ENTRY: true,
} as const

export type FeatureFlag = keyof typeof FEATURES

/**
 * Check if a feature is enabled
 * @param flag - The feature flag to check
 * @returns true if feature is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
    return FEATURES[flag]
}

