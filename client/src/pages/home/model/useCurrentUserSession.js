import { useEffect, useState } from "react";

import { fetchCurrentUserProfile } from "../../../entities/user/api/fetchCurrentUserProfile.js";

/**
 * @param {boolean} isAuthorized
 * @param {boolean} isAuthReady
 */
export const useCurrentUserSession = (isAuthorized, isAuthReady) => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(
    /** @type {'user'|'admin'|'moderator'|null} */ (null),
  );
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [loyaltyPointsReserved, setLoyaltyPointsReserved] = useState(0);
  const [isSessionReady, setIsSessionReady] = useState(false);

  useEffect(() => {
    if (!isAuthReady) {
      setIsSessionReady(false);
      return undefined;
    }

    if (!isAuthorized) {
      setCurrentUserId(null);
      setCurrentUserRole(null);
      setIsPremiumUser(false);
      setIsEmailVerified(true);
      setLoyaltyPoints(0);
      setLoyaltyPointsReserved(0);
      setIsSessionReady(true);
      return undefined;
    }

    setIsSessionReady(false);
    let isCancelled = false;

    void (async () => {
      try {
        const { user: me } = await fetchCurrentUserProfile();
        if (!isCancelled) {
          setCurrentUserId(String(me._id));
          setCurrentUserRole(me.userRole ?? "user");
          setIsPremiumUser(Boolean(me.isPremiumUser));
          setIsEmailVerified(me.isEmailVerified !== false);
          setLoyaltyPoints(Number(me.userLoyaltyPoints) || 0);
          setLoyaltyPointsReserved(Number(me.userLoyaltyPointsReserved) || 0);
        }
      } catch {
        if (!isCancelled) {
          setCurrentUserId(null);
          setCurrentUserRole(null);
          setIsPremiumUser(false);
          setIsEmailVerified(true);
          setLoyaltyPoints(0);
          setLoyaltyPointsReserved(0);
        }
      } finally {
        if (!isCancelled) {
          setIsSessionReady(true);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [isAuthorized, isAuthReady]);

  return {
    currentUserId,
    currentUserRole,
    isPremiumUser,
    isEmailVerified,
    loyaltyPoints,
    loyaltyPointsReserved,
    setLoyaltyPoints,
    setLoyaltyPointsReserved,
    setCurrentUserId,
    setIsPremiumUser,
    setIsEmailVerified,
    isSessionReady,
  };
};
