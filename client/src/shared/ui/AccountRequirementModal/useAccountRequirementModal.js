import { useCallback, useMemo, useState } from "react";

/** @typedef {import("./AccountRequirementModal.jsx").AccountRequirement} AccountRequirement */

/**
 * Управляет состоянием окна-подсказки о премиуме/подтверждённом аккаунте.
 *
 * Пример:
 *   const gate = useAccountRequirementModal();
 *   // при попытке заблокированного действия:
 *   if (!isPremium) return gate.require("premium", "опубликовать сторис");
 *   ...
 *   <AccountRequirementModal {...gate.modalProps} />
 *
 * @returns {{
 *   modalProps: {
 *     isOpen: boolean;
 *     requirement: AccountRequirement;
 *     actionLabel: string | undefined;
 *     onClose: () => void;
 *   };
 *   require: (requirement: AccountRequirement, actionLabel?: string) => void;
 *   close: () => void;
 * }}
 */
export function useAccountRequirementModal() {
  const [state, setState] = useState(
    /** @type {{ requirement: AccountRequirement; actionLabel?: string } | null} */ (null),
  );

  const require = useCallback((requirement, actionLabel) => {
    setState({ requirement, actionLabel });
  }, []);

  const close = useCallback(() => {
    setState(null);
  }, []);

  const modalProps = useMemo(
    () => ({
      isOpen: state != null,
      requirement: state?.requirement ?? "premium",
      actionLabel: state?.actionLabel,
      onClose: close,
    }),
    [state, close],
  );

  return { modalProps, require, close };
}
