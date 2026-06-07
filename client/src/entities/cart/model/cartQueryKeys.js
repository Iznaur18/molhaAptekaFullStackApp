export const cartQueryKeys = {
  all: ["cart"],
  my: () => [...cartQueryKeys.all, "my"],
};
