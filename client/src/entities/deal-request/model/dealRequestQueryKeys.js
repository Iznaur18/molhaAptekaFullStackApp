export const dealRequestQueryKeys = {
  all: ["deal-request"],
  mine: (role) => [...dealRequestQueryKeys.all, "me", String(role)],
};
