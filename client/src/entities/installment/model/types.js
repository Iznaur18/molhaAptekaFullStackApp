/**
 * @typedef {Object} InstallmentPlanFromApi
 * @property {string} _id
 * @property {string} title
 * @property {number} monthsCount
 * @property {number} monthlyAmountRub
 * @property {boolean} firstPaymentRequiredNow
 */

/**
 * @typedef {Object} InstallmentProgramFromApi
 * @property {string} _id
 * @property {string} productId
 * @property {string} sellerId
 * @property {boolean} isEnabled
 * @property {string} moderationStatus
 * @property {string} [moderationComment]
 * @property {boolean} [wasEverApproved]
 * @property {InstallmentPlanFromApi[]} plans
 */

/**
 * @typedef {Object} InstallmentPaymentFromApi
 * @property {string | null} [_id]
 * @property {number} paymentIndex
 * @property {number} amountRub
 * @property {string} dueAt
 * @property {string} status
 * @property {string | null} [paidAt]
 * @property {string | null} [buyerMarkedPaidAt]
 */

/**
 * @typedef {Object} InstallmentCounterpartyFromApi
 * @property {string} _id
 * @property {string} userName
 * @property {string} email
 * @property {string} userPhoneNumber
 */

/**
 * @typedef {Object} InstallmentContractFromApi
 * @property {string} _id
 * @property {string} productId
 * @property {string} buyerUserId
 * @property {string} sellerUserId
 * @property {string | null} [orderId]
 * @property {number} quantity
 * @property {string} planTitle
 * @property {number} monthsCount
 * @property {number} monthlyPaymentRub
 * @property {number} totalAmountRub
 * @property {number} paidAmountRub
 * @property {string} productNameAtContract
 * @property {string} status
 * @property {InstallmentPaymentFromApi[]} payments
 * @property {string} finalDueAt
 * @property {string | null} [nextPaymentDueAt]
 * @property {boolean} hasOverduePayment
 * @property {InstallmentCounterpartyFromApi | null} [seller]
 * @property {InstallmentCounterpartyFromApi | null} [buyer]
 */

export {};
