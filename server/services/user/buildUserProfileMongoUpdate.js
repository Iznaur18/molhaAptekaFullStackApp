const isEmptyStoredPhone = (value) =>
  value === null || value === undefined || value === "";

/**
 * Пустой телефон храним как отсутствие поля (`$unset`), не `null` —
 * иначе sparse unique index на `userPhoneNumber` даёт E11000.
 *
 * @param {Record<string, unknown>} updateData
 * @returns {{ $set?: Record<string, unknown>; $unset?: Record<string, 1> }}
 */
export const buildUserProfileMongoUpdate = (updateData) => {
  const $set = {};
  const $unset = {};

  for (const [field, value] of Object.entries(updateData)) {
    if (field === "userPhoneNumber" && isEmptyStoredPhone(value)) {
      $unset.userPhoneNumber = 1;
      continue;
    }
    $set[field] = value;
  }

  /** @type {{ $set?: Record<string, unknown>; $unset?: Record<string, 1> }} */
  const query = {};
  if (Object.keys($set).length > 0) {
    query.$set = $set;
  }
  if (Object.keys($unset).length > 0) {
    query.$unset = $unset;
  }
  return query;
};
