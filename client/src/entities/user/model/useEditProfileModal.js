import { useEffect, useMemo, useRef, useState } from "react";

import { useUserProfileMutations } from "./useUserProfileMutations.js";
import { buildAdminPatchUserProfileBody } from "../lib/buildAdminPatchUserProfileBody.js";
import { buildPatchUserProfileBody } from "../lib/buildPatchUserProfileBody.js";
import { isPremiumExpiresAtInputActive } from "../lib/computeStaffPremiumExpiry.js";
import { willFormDisablePremium } from "../lib/willFormDisablePremium.js";
import { addressStructuredValueFromUser } from "../../address/lib/addressStructuredValueFromUser.js";
import { mapUserToEditProfileForm } from "../lib/mapUserToEditProfileForm.js";
import { maskRuPhoneInput } from "../lib/ruPhone.js";
import { keepDigitsOnly } from "../../../shared/lib/numericInput.js";
import { validateEditProfileForm } from "../lib/validateEditProfileForm.js";
import { ADMIN_EDIT_USER_UI, EDIT_PROFILE_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { isHttpProfileImageUrl } from "../lib/profileImageFocus.js";
import { resolveImageUrlForDisplay } from "../../../shared/lib/resolveUploadedImageUrl.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   user: import('./types.js').UserPublicProfile | null;
 *   onSaved: (user: import('./types.js').UserPublicProfile) => void;
 *   adminMode?: boolean;
 *   staffCanEditRole?: boolean;
 *   staffCanEditPremium?: boolean;
 *   allowStaffLoyaltyEdit?: boolean;
 *   onPremiumRevoked?: () => void;
 * }} params
 */
export function useEditProfileModal({
  isOpen,
  onClose,
  user,
  onSaved,
  adminMode = false,
  staffCanEditRole = false,
  staffCanEditPremium = false,
  allowStaffLoyaltyEdit = false,
  onPremiumRevoked,
}) {
  const { patchMutation } = useUserProfileMutations();
  const [form, setForm] = useState(() => mapUserToEditProfileForm({ _id: "" }));
  const [feedback, setFeedback] = useState({ kind: "idle", message: "" });
  const wasOpenRef = useRef(false);
  const initialStructuredAddressRef = useRef(
    /** @type {import('../../address/model/structuredTypes.js').RuStructuredDeliveryAddressValue | null} */ (
      null
    ),
  );

  useEffect(() => {
    const didOpen = isOpen && !wasOpenRef.current;
    wasOpenRef.current = isOpen;

    if (!didOpen || !user) {
      return undefined;
    }

    setForm(mapUserToEditProfileForm(user));
    initialStructuredAddressRef.current = addressStructuredValueFromUser(user);
    setFeedback({ kind: "idle", message: "" });
    return undefined;
  }, [isOpen, user]);

  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const notesChars = useMemo(
    () => String(form.notesAboutUser ?? "").length,
    [form.notesAboutUser],
  );

  const isPremiumUser = isPremiumExpiresAtInputActive(form.premiumExpiresAt);
  const backgroundMode = adminMode ? "admin" : isPremiumUser ? "image" : "preset";

  const avatarFocusImageUrl = useMemo(() => {
    const url = resolveImageUrlForDisplay(form.userAvatarUrl ?? "");
    return isHttpProfileImageUrl(url) ? url : "";
  }, [form.userAvatarUrl]);

  const backgroundFocusImageUrl = useMemo(() => {
    const url = resolveImageUrlForDisplay(form.backgroundImageUrl ?? "");
    if (!isHttpProfileImageUrl(url)) return "";
    if (backgroundMode === "image" || backgroundMode === "admin") return url;
    return "";
  }, [backgroundMode, form.backgroundImageUrl]);

  const isSubmitting = feedback.kind === "loading";

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    let nextValue = type === "checkbox" ? checked : value;
    if (name === "userName" && typeof nextValue === "string") {
      nextValue = nextValue.toLowerCase().replace(/[^a-z0-9]/g, "");
    }
    if (name === "userPhoneNumber" && typeof nextValue === "string") {
      nextValue = maskRuPhoneInput(nextValue);
    }
    if (
      (name === "userLoyaltyPoints" || name === "userDiscountPercent") &&
      typeof nextValue === "string"
    ) {
      nextValue = keepDigitsOnly(nextValue);
    }
    setForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleClose = () => {
    setFeedback({ kind: "idle", message: "" });
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user?._id) return;

    const canEditLoyaltyPoints = adminMode || allowStaffLoyaltyEdit;
    const clientError = validateEditProfileForm(form, {
      includeAdmin: adminMode,
      includeLoyaltyPoints: canEditLoyaltyPoints,
      backgroundMode,
    });
    if (clientError) {
      setFeedback({ kind: "error", message: clientError });
      return;
    }

    const premiumWillBeDisabled =
      adminMode && staffCanEditPremium && willFormDisablePremium(user, form);
    if (premiumWillBeDisabled) {
      const userName = String(user.userName ?? "").trim() || "пользователя";
      if (!window.confirm(ADMIN_EDIT_USER_UI.DISABLE_PREMIUM_CONFIRM(userName))) {
        return;
      }
    }

    setFeedback({ kind: "loading", message: "" });

    try {
      const profilePatchOptions = {
        initialPhoneNumber: user.userPhoneNumber,
        initialStructuredAddress: initialStructuredAddressRef.current ?? undefined,
      };
      const body = adminMode
        ? buildAdminPatchUserProfileBody(form, {
            ...profilePatchOptions,
            includePremium: staffCanEditPremium,
          })
        : buildPatchUserProfileBody(form, {
            backgroundMode,
            includeLoyaltyPoints: allowStaffLoyaltyEdit,
            ...profilePatchOptions,
          });
      const updated = await patchMutation.mutateAsync({
        userId: String(user._id),
        body,
      });
      if (premiumWillBeDisabled) {
        onPremiumRevoked?.();
      }
      handleClose();
      onSaved(updated);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : EDIT_PROFILE_MODAL_UI.SUBMIT_IDLE;
      setFeedback({ kind: "error", message });
    }
  };

  return {
    form,
    setForm,
    feedback,
    notesChars,
    backgroundMode,
    avatarFocusImageUrl,
    backgroundFocusImageUrl,
    isSubmitting,
    handleChange,
    handleClose,
    handleSubmit,
  };
}
