export const orderQueryKeys = {
  all: ["order"],
  my: () => [...orderQueryKeys.all, "my"],
  myActionCount: () => [...orderQueryKeys.all, "my", "action-count"],
  salesActionCount: () => [...orderQueryKeys.all, "sales", "action-count"],
  /**
   * @param {{ status?: string; search?: string }} params
   */
  sales: (params) => [...orderQueryKeys.all, "sales", params],
  /**
   * @param {{ status?: string; limit?: number; page?: number }} params
   */
  admin: (params) => [...orderQueryKeys.all, "admin", params],
};
