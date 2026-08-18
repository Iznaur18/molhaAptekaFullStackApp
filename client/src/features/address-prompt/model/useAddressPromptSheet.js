import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuthSession } from "../../../entities/user/model/useAuthSession.js";
import { isCatalogMainViewPath } from "../../../shared/lib/catalogMainViewPaths.js";
import { mainViewToPathname } from "../../../shared/lib/homeMainViewPaths.js";
import { useBlockingOverlayCount } from "../../../shared/lib/useBlockingOverlayOccupancy.js";
import { useAppIntro } from "../../app-intro/model/AppIntroContext.jsx";
import { COOKIE_NOTICE_ACCEPTED_EVENT } from "../../legal/model/cookieNoticeConstants.js";
import { hasAcceptedCookieNotice } from "../../legal/lib/cookieNoticeStorage.js";
import { useAppShellStateContext } from "../../../widgets/app-shell/model/AppShellStateContext.jsx";
import {
  ADDRESS_PROMPT_DELAY_MS,
  ADDRESS_PROMPT_HASH,
} from "../model/addressPromptConstants.js";
import {
  hasSeenAddressPromptThisSession,
  markAddressPromptSeenThisSession,
  resolveAddressPromptUserId,
} from "../lib/addressPromptSession.js";
import {
  shouldShowAddressPrompt,
  userHasProfileAddress,
} from "../lib/shouldShowAddressPrompt.js";

export function useAddressPromptSheet() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthorized, user } = useAuthSession();
  const { isIntroVisible } = useAppIntro();
  const shell = useAppShellStateContext();
  const overlayCount = useBlockingOverlayCount();
  const userId = resolveAddressPromptUserId(user?._id);
  const [cookieAccepted, setCookieAccepted] = useState(() => hasAcceptedCookieNotice());
  const [delayElapsed, setDelayElapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [seenThisSession, setSeenThisSession] = useState(() =>
    hasSeenAddressPromptThisSession(userId),
  );

  const hasAddress = userHasProfileAddress(user);
  const isCatalogPath = isCatalogMainViewPath(location.pathname);
  const blockingUi = Boolean(
    overlayCount > 0 ||
      isIntroVisible ||
      shell.isLoginModalOpen ||
      shell.isRegisterModalOpen ||
      shell.isEmailVerificationModalOpen ||
      shell.isCreateProductModalOpen ||
      shell.productToEdit ||
      shell.productToCopy ||
      shell.isDataConfirmationModalOpen ||
      shell.raffleModal ||
      shell.promotionProduct ||
      shell.isSellerProductsLimitModalOpen ||
      shell.isProductCategoryListOpen ||
      shell.editingFeedTileKey ||
      shell.editingCategorySlug ||
      shell.editingCategoryNode,
  );

  useEffect(() => {
    setDelayElapsed(false);
    setIsOpen(false);
    setSeenThisSession(hasSeenAddressPromptThisSession(userId));
  }, [userId]);

  useEffect(() => {
    if (cookieAccepted) {
      return undefined;
    }
    const onAccepted = () => setCookieAccepted(true);
    window.addEventListener(COOKIE_NOTICE_ACCEPTED_EVENT, onAccepted);
    return () => window.removeEventListener(COOKIE_NOTICE_ACCEPTED_EVENT, onAccepted);
  }, [cookieAccepted]);

  useEffect(() => {
    if (!cookieAccepted || !userId || !isAuthorized || hasAddress || seenThisSession) {
      return undefined;
    }
    const timer = window.setTimeout(() => setDelayElapsed(true), ADDRESS_PROMPT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [cookieAccepted, hasAddress, isAuthorized, seenThisSession, userId]);

  const eligible = shouldShowAddressPrompt({
    cookieAccepted,
    isAuthorized,
    hasAddress,
    seenThisSession,
    delayElapsed,
    isCatalogPath,
    blockingUi,
  });

  useEffect(() => {
    if (!eligible) {
      if (blockingUi || !isCatalogPath || !isAuthorized || hasAddress) {
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
    navigate({
      pathname: mainViewToPathname("edit-profile"),
      hash: ADDRESS_PROMPT_HASH,
    });
  }, [handleClose, navigate]);

  return {
    isOpen,
    handleClose,
    handleCta,
  };
}
