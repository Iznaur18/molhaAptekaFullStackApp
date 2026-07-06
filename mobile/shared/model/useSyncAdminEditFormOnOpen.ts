import { useEffect, useRef } from "react";

type SyncAdminEditFormOnOpenOptions = {
  visible: boolean;
  sessionKey: string | null;
  enabled: boolean;
  onSync: () => void;
};

/** Сбрасывает поля формы только при открытии модалки или смене сущности — не на каждый re-render. */
export const useSyncAdminEditFormOnOpen = ({
  visible,
  sessionKey,
  enabled,
  onSync,
}: SyncAdminEditFormOnOpenOptions) => {
  const wasVisibleRef = useRef(false);
  const sessionKeyRef = useRef<string | null>(null);
  const onSyncRef = useRef(onSync);
  onSyncRef.current = onSync;

  useEffect(() => {
    const wasVisible = wasVisibleRef.current;
    wasVisibleRef.current = visible;

    if (!visible) {
      sessionKeyRef.current = null;
      return;
    }

    const didOpen = !wasVisible;
    const sessionChanged = sessionKey !== sessionKeyRef.current;
    sessionKeyRef.current = sessionKey;

    if (!enabled || !sessionKey || (!didOpen && !sessionChanged)) {
      return;
    }

    onSyncRef.current();
  }, [enabled, sessionKey, visible]);
};
