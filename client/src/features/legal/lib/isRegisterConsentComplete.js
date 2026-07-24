/**
 * @param {{ termsAccepted: boolean; personalDataConsentAccepted: boolean }} consent
 */
export function isRegisterConsentComplete(consent) {
  return Boolean(consent.termsAccepted && consent.personalDataConsentAccepted);
}
