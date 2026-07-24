import { randomInt } from "node:crypto";

import {
  REFERRAL_CODE_ALPHABET,
  REFERRAL_CODE_LENGTH,
} from "../../constants/referralConstants.js";

/**
 * @returns {string}
 */
export function generateReferralCode() {
  let code = "";
  for (let i = 0; i < REFERRAL_CODE_LENGTH; i += 1) {
    code += REFERRAL_CODE_ALPHABET[randomInt(REFERRAL_CODE_ALPHABET.length)];
  }
  return code;
}
