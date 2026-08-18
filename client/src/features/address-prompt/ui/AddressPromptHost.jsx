import { ADDRESS_PROMPT_BADGE_KEY } from "../model/addressPromptConstants.js";
import { ADDRESS_PROMPT_UI } from "../../../shared/config/appUiCopy.js";
import { ProductBadgeExplainSheet } from "../../../entities/product-badge-explain/ui/ProductBadgeExplainSheet.jsx";
import { useAddressPromptSheet } from "../model/useAddressPromptSheet.js";

export function AddressPromptHost() {
  const { isOpen, handleClose, handleCta } = useAddressPromptSheet();

  return (
    <ProductBadgeExplainSheet
      isOpen={isOpen}
      title={ADDRESS_PROMPT_UI.TITLE}
      badgeKey={ADDRESS_PROMPT_BADGE_KEY}
      fallbackKey={ADDRESS_PROMPT_BADGE_KEY}
      onClose={handleClose}
      primaryActionLabel={ADDRESS_PROMPT_UI.CTA}
      onPrimaryAction={handleCta}
    />
  );
}
