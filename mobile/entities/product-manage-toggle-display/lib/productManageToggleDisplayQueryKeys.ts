export const productManageToggleDisplayQueryKeys = {
  all: ["product-manage-toggle-display"] as const,
  list: () => [...productManageToggleDisplayQueryKeys.all, "list"] as const,
};
