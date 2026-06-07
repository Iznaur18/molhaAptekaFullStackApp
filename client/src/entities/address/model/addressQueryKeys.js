export const addressQueryKeys = {
  all: ["address"],
  /**
   * @param {string} query
   */
  suggestions: (query) => [...addressQueryKeys.all, "suggestions", query],
};
