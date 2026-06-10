/**
 * @typedef {import('@molha/api-contract').AppIntroSettingsContract} AppIntroSettings
 */

/**
 * @typedef {import('@molha/api-contract').IntroAdPaidIntroContract} IntroAdPaidIntro
 */

/**
 * @typedef {{
 *   settings: AppIntroSettings;
 *   paidIntro?: IntroAdPaidIntro | null;
 * }} AppIntroPublicResponse
 */

/**
 * @typedef {Partial<{
 *   videoMp4Url: string | null;
 *   videoWebmUrl: string | null;
 *   posterUrl: string | null;
 *   fallbackTitle: string | null;
 *   fallbackHint: string | null;
 *   minMs: number;
 *   maxMs: number;
 *   fadeOutMs: number;
 *   prioritizePlatformIntro: boolean;
 * }>} PatchAppIntroSettingsBody
 */

export {};
