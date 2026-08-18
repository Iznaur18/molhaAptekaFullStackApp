export const ADDRESS_PROMPT_DELAY_MS = 5000;
export const ADDRESS_PROMPT_BADGE_KEY = "profile_address" as const;

const seenByUserId = new Set<string>();

export const resolveAddressPromptUserId = (userId: unknown) =>
  String(userId ?? "").trim();

export const hasSeenAddressPromptThisSession = (userId: unknown) => {
  const id = resolveAddressPromptUserId(userId);
  return id.length > 0 && seenByUserId.has(id);
};

export const markAddressPromptSeenThisSession = (userId: unknown) => {
  const id = resolveAddressPromptUserId(userId);
  if (id) {
    seenByUserId.add(id);
  }
};

export const userHasProfileAddress = (
  user: { userAddress?: unknown } | null | undefined,
) => String(user?.userAddress ?? "").trim().length > 0;

export const isAddressPromptCatalogPath = (pathname: string) => {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return (
    normalized === "/" ||
    normalized === "/(tabs)" ||
    normalized === "/(tabs)/index" ||
    normalized === "/catalog" ||
    normalized === "/(tabs)/catalog"
  );
};
