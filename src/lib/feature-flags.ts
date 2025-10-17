/**
 * Feature flags for ScryVault
 */
export const FEATURES = {
    DEMO_MODE: false,
    MANUAL_ISBN_ENTRY: true,
} as const

export type FeatureFlag = keyof typeof FEATURES

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
    return FEATURES[flag]
}

