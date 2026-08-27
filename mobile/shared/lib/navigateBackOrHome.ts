type BackRouter = {
  canGoBack: () => boolean;
  back: () => void;
  replace: (href: "/") => void;
};

/** Как web `navigateBackOrHome`: назад по истории, иначе на home. */
export function navigateBackOrHome(router: BackRouter): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace("/");
}
