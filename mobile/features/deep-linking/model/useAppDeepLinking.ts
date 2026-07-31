import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useEffect } from "react";

import { parseAppDeepLink } from "@/features/deep-linking/lib/parseAppDeepLink";
import { captureAffiliateCodeFromUrl } from "@/shared/lib/affiliateCodeStorage";
import { captureReferralCodeFromUrl } from "@/shared/lib/referralCodeStorage";

const navigateToDeepLink = (
  router: ReturnType<typeof useRouter>,
  url: string,
): boolean => {
  const route = parseAppDeepLink(url);
  if (!route) {
    return false;
  }
  router.push(route as never);
  return true;
};

export const useAppDeepLinking = (): void => {
  const router = useRouter();

  useEffect(() => {
    const handleUrl = (url: string) => {
      void captureReferralCodeFromUrl(url);
      void captureAffiliateCodeFromUrl(url);
      navigateToDeepLink(router, url);
    };

    void Linking.getInitialURL().then((initialUrl) => {
      if (initialUrl) {
        handleUrl(initialUrl);
      }
    });

    const subscription = Linking.addEventListener("url", (event) => {
      handleUrl(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [router]);
};
