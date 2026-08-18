import { useRouter, usePathname } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useAppIntro } from "@/features/app-intro/model/AppIntroProvider";
import { ADDRESS_PROMPT_UI } from "@/shared/config";
import { ProductBadgeExplainSheet } from "@/entities/product-badge-explain/ui/ProductBadgeExplainSheet";
import { useBlockingOverlayCount } from "@/shared/lib/useBlockingOverlayOccupancy";

import {
  ADDRESS_PROMPT_BADGE_KEY,
  ADDRESS_PROMPT_DELAY_MS,
  hasSeenAddressPromptThisSession,
  isAddressPromptCatalogPath,
  markAddressPromptSeenThisSession,
  resolveAddressPromptUserId,
  userHasProfileAddress,
} from "../model/addressPromptSession";

export const AddressPromptHost = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthorized = useIsAuthorized();
  const sessionQuery = useAuthSessionQuery();
  const { isIntroVisible } = useAppIntro();
  const overlayCount = useBlockingOverlayCount();
  const user = sessionQuery.data?.user ?? null;
  const userId = resolveAddressPromptUserId(
    user && typeof user === "object" && "_id" in user ? user._id : "",
  );
  const [delayElapsed, setDelayElapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [seenThisSession, setSeenThisSession] = useState(() =>
    hasSeenAddressPromptThisSession(userId),
  );

  const hasAddress = userHasProfileAddress(user);
  const isCatalogPath = isAddressPromptCatalogPath(pathname);
  const blockingUi = overlayCount > 0 || isIntroVisible;

  useEffect(() => {
    setDelayElapsed(false);
    setIsOpen(false);
    setSeenThisSession(hasSeenAddressPromptThisSession(userId));
  }, [userId]);

  useEffect(() => {
    if (!userId || !isAuthorized || hasAddress || seenThisSession) {
      return undefined;
    }
    const timer = setTimeout(() => setDelayElapsed(true), ADDRESS_PROMPT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [hasAddress, isAuthorized, seenThisSession, userId]);

  const eligible =
    isAuthorized &&
    !hasAddress &&
    !seenThisSession &&
    delayElapsed &&
    isCatalogPath &&
    !blockingUi;

  useEffect(() => {
    if (!eligible) {
      if (!isCatalogPath || !isAuthorized || hasAddress || blockingUi) {
        setIsOpen(false);
      }
      return;
    }
    setIsOpen(true);
    markAddressPromptSeenThisSession(userId);
    setSeenThisSession(true);
  }, [blockingUi, eligible, hasAddress, isAuthorized, isCatalogPath, userId]);

  const handleClose = useCallback(() => {
    markAddressPromptSeenThisSession(userId);
    setSeenThisSession(true);
    setIsOpen(false);
  }, [userId]);

  const handleCta = useCallback(() => {
    handleClose();
    router.push({ pathname: "/profile/edit", params: { focus: "address" } });
  }, [handleClose, router]);

  return (
    <ProductBadgeExplainSheet
      visible={isOpen}
      title={ADDRESS_PROMPT_UI.TITLE}
      badgeKey={ADDRESS_PROMPT_BADGE_KEY}
      fallbackKey={ADDRESS_PROMPT_BADGE_KEY}
      onClose={handleClose}
      primaryActionLabel={ADDRESS_PROMPT_UI.CTA}
      onPrimaryAction={handleCta}
    />
  );
};
