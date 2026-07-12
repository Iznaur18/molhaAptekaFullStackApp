export type RegisterConsentState = {
  termsAccepted: boolean;
  personalDataConsentAccepted: boolean;
};

export const isRegisterConsentComplete = (consent: RegisterConsentState): boolean =>
  consent.termsAccepted && consent.personalDataConsentAccepted;
