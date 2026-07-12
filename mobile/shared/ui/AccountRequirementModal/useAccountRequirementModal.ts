import { useCallback, useMemo, useState } from "react";

import type { AccountRequirement } from "./AccountRequirementModal";

type AccountRequirementState = {
  requirement: AccountRequirement;
  actionLabel?: string;
};

export const useAccountRequirementModal = () => {
  const [state, setState] = useState<AccountRequirementState | null>(null);

  const require = useCallback((requirement: AccountRequirement, actionLabel?: string) => {
    setState({ requirement, actionLabel });
  }, []);

  const close = useCallback(() => {
    setState(null);
  }, []);

  const modalProps = useMemo(
    () => ({
      visible: state != null,
      requirement: state?.requirement ?? ("premium" as const),
      actionLabel: state?.actionLabel,
      onClose: close,
    }),
    [state, close],
  );

  return { modalProps, require, close };
};
