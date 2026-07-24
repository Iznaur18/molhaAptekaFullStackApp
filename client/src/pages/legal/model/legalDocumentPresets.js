import { LEGAL_UI } from "../../../shared/config/appUiCopy.js";

import {
  PRIVACY_POLICY_CONTACT_EMAIL,
  PRIVACY_POLICY_OPERATOR_PLACEHOLDER,
  PRIVACY_POLICY_SECTIONS,
  PRIVACY_POLICY_UPDATED_AT,
} from "./privacyPolicyContent.js";
import {
  PRODUCT_LISTING_RULES_CONTACT_EMAIL,
  PRODUCT_LISTING_RULES_OPERATOR_PLACEHOLDER,
  PRODUCT_LISTING_RULES_SECTIONS,
  PRODUCT_LISTING_RULES_UPDATED_AT,
} from "./productListingRulesContent.js";
import {
  PUBLIC_OFFER_CONTACT_EMAIL,
  PUBLIC_OFFER_OPERATOR_PLACEHOLDER,
  PUBLIC_OFFER_SECTIONS,
  PUBLIC_OFFER_UPDATED_AT,
} from "./publicOfferContent.js";
import {
  USER_AGREEMENT_CONTACT_EMAIL,
  USER_AGREEMENT_OPERATOR_PLACEHOLDER,
  USER_AGREEMENT_SECTIONS,
  USER_AGREEMENT_UPDATED_AT,
} from "./userAgreementContent.js";

/**
 * @typedef {"terms" | "privacy" | "listing" | "offer"} LegalDocumentKind
 *
 * @typedef {{
 *   kind: LegalDocumentKind;
 *   title: string;
 *   updatedAt: string;
 *   operatorPlaceholder: string;
 *   sections: Array<{ title: string; paragraphs: string[] }>;
 *   contactEmail: string;
 * }} LegalDocumentPreset
 */

/** @type {Record<LegalDocumentKind, LegalDocumentPreset>} */
export const LEGAL_DOCUMENT_PRESETS = {
  terms: {
    kind: "terms",
    title: LEGAL_UI.TERMS_TITLE,
    updatedAt: USER_AGREEMENT_UPDATED_AT,
    operatorPlaceholder: USER_AGREEMENT_OPERATOR_PLACEHOLDER,
    sections: USER_AGREEMENT_SECTIONS,
    contactEmail: USER_AGREEMENT_CONTACT_EMAIL,
  },
  privacy: {
    kind: "privacy",
    title: LEGAL_UI.PRIVACY_TITLE,
    updatedAt: PRIVACY_POLICY_UPDATED_AT,
    operatorPlaceholder: PRIVACY_POLICY_OPERATOR_PLACEHOLDER,
    sections: PRIVACY_POLICY_SECTIONS,
    contactEmail: PRIVACY_POLICY_CONTACT_EMAIL,
  },
  listing: {
    kind: "listing",
    title: LEGAL_UI.LISTING_TITLE,
    updatedAt: PRODUCT_LISTING_RULES_UPDATED_AT,
    operatorPlaceholder: PRODUCT_LISTING_RULES_OPERATOR_PLACEHOLDER,
    sections: PRODUCT_LISTING_RULES_SECTIONS,
    contactEmail: PRODUCT_LISTING_RULES_CONTACT_EMAIL,
  },
  offer: {
    kind: "offer",
    title: LEGAL_UI.OFFER_TITLE,
    updatedAt: PUBLIC_OFFER_UPDATED_AT,
    operatorPlaceholder: PUBLIC_OFFER_OPERATOR_PLACEHOLDER,
    sections: PUBLIC_OFFER_SECTIONS,
    contactEmail: PUBLIC_OFFER_CONTACT_EMAIL,
  },
};

/** @type {Array<{ id: LegalDocumentKind; label: string }>} */
export const LEGAL_DOCUMENT_TABS = [
  { id: "terms", label: LEGAL_UI.TERMS_TAB },
  { id: "privacy", label: LEGAL_UI.PRIVACY_TAB },
  { id: "listing", label: LEGAL_UI.LISTING_TAB },
  { id: "offer", label: LEGAL_UI.OFFER_TAB },
];
