import { useEffect, useMemo, useRef, useState } from "react";
import { sanitizeUserNameInputLive } from "@molha/api-contract";

import { useUserProfileMutations } from "./useUserProfileMutations.js";
import { buildAdminPatchUserProfileBody } from "../lib/buildAdminPatchUserProfileBody.js";
import { buildPatchUserProfileBody } from "../lib/buildPatchUserProfileBody.js";
import { isPremiumExpiresAtInputActive } from "../lib/computeStaffPremiumExpiry.js";
import { willFormDisablePremium } from "../lib/willFormDisablePremium.js";
import { mapUserToEditProfileForm } from "../lib/mapUserToEditProfileForm.js";
import { maskRuPhoneInput } from "../lib/ruPhone.js";
import { keepDigitsOnly } from "../../../shared/lib/numericInput.js";
import { validateEditProfileForm } from "../lib/validateEditProfileForm.js";
import { ADMIN_EDIT_USER_UI, EDIT_PROFILE_MODAL_UI, USER_SAVED_ADDRESSES_UI } from "../../../shared/config/appUiCopy.js";
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
 *   variant?: 'modal' | 'page';
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
  variant = "modal",
}) {
  const isPageVariant = variant === "page";
  const { patchMutation } = useUserProfileMutations();
  const [form, setForm] = useState(() => mapUserToEditProfileForm({ _id: "" }));
  const [feedback, setFeedback] = useState({ kind: "idle", message: "" });
  const [addressEditorOpen, setAddressEditorOpen] = useState(false);
  const [contactVerified, setContactVerified] = useState({
    email: true,
    phone: true,
  });
  const wasOpenRef = useRef(false);
  const initialSavedAddressesRef = useRef(
    /** @type {import('../../address/model/userSavedAddressTypes.js').UserSavedAddressFormValue[]} */ (
      []
    ),
  );
  const baselineEmailRef = useRef("");
  const baselinePhoneRef = useRef("");

  useEffect(() => {
    const didOpen = isOpen && !wasOpenRef.current;
    wasOpenRef.current = isOpen;

    if (!didOpen || !user) {
      return undefined;
    }

    const nextForm = mapUserToEditProfileForm(user);
    setForm(nextForm);
    initialSavedAddressesRef.current = nextForm.savedAddresses;
    baselineEmailRef.current = nextForm.email;
    baselinePhoneRef.current = nextForm.userPhoneNumber;
    setContactVerified({
      email: user.isEmailVerified === true,
      phone: user.isPhoneVerified === true,
    });
    setFeedback({ kind: "idle", message: "" });
    setAddressEditorOpen(false);
    return undefined;
  }, [isOpen, user]);

  useScrollLock(isOpen && !isPageVariant);

  useEffect(() => {
    if (!isOpen || isPageVariant) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isPageVariant, onClose]);

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
      nextValue = sanitizeUserNameInputLive(nextValue);
    }
    if (name === "userPhoneNumber" && typeof nextValue === "string") {
      nextValue = maskRuPhoneInput(nextValue);
    }
    if (name === "email" && typeof nextValue === "string") {
      nextValue = nextValue.trim().toLowerCase();
    }
    if (
      (name === "userLoyaltyPoints" || name === "userDiscountPercent") &&
      typeof nextValue === "string"
    ) {
      nextValue = keepDigitsOnly(nextValue);
    }
    setForm((prev) => ({ ...prev, [name]: nextValue }));
    if (name === "email" && typeof nextValue === "string") {
      const normalized = nextValue.trim().toLowerCase();
      setContactVerified((prev) => ({
        ...prev,
        email:
          normalized === baselineEmailRef.current && user?.isEmailVerified === true,
      }));
    }
    if (name === "userPhoneNumber" && typeof nextValue === "string") {
      setContactVerified((prev) => ({
        ...prev,
        phone:
          nextValue === baselinePhoneRef.current && user?.isPhoneVerified === true,
      }));
    }
  };

  const handleEmailVerified = (verifiedEmail) => {
    const normalized = String(verifiedEmail ?? "")
      .trim()
      .toLowerCase();
    baselineEmailRef.current = normalized;
    setForm((prev) => ({ ...prev, email: normalized }));
    setContactVerified((prev) => ({ ...prev, email: true }));
  };

  const handlePhoneVerified = (verifiedPhone) => {
    const nextPhone = String(verifiedPhone ?? form.userPhoneNumber ?? "").trim();
    baselinePhoneRef.current = nextPhone;
    setForm((prev) => ({ ...prev, userPhoneNumber: nextPhone }));
    setContactVerified((prev) => ({ ...prev, phone: true }));
  };

  const handleClose = () => {
    setFeedback({ kind: "idle", message: "" });
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user?._id) return;

    if (addressEditorOpen) {
      setFeedback({ kind: "error", message: USER_SAVED_ADDRESSES_UI.ERROR_DRAFT_OPEN });
      return;
    }

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

    if (!adminMode) {
      const emailTrim = String(form.email ?? "")
        .trim()
        .toLowerCase();
      const phoneTrim = String(form.userPhoneNumber ?? "").trim();

      if (!emailTrim && baselineEmailRef.current) {
        setFeedback({ kind: "error", message: EDIT_PROFILE_MODAL_UI.EMAIL_CLEAR_FORBIDDEN });
        return;
      }
      if (emailTrim !== baselineEmailRef.current && contactVerified.email !== true) {
        setFeedback({ kind: "error", message: EDIT_PROFILE_MODAL_UI.EMAIL_CHANGE_PENDING });
        return;
      }

      if (!phoneTrim && baselinePhoneRef.current) {
        setFeedback({ kind: "error", message: EDIT_PROFILE_MODAL_UI.PHONE_CLEAR_FORBIDDEN });
        return;
      }
      if (phoneTrim !== baselinePhoneRef.current && contactVerified.phone !== true) {
        setFeedback({ kind: "error", message: EDIT_PROFILE_MODAL_UI.PHONE_CHANGE_PENDING });
        return;
      }
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
        initialSavedAddresses: initialSavedAddressesRef.current,
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
      onSaved(updated);
      if (isPageVariant) {
        onClose();
        return;
      }
      handleClose();
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
    baselineEmail: baselineEmailRef.current,
    baselinePhone: baselinePhoneRef.current,
    contactVerified,
    handleChange,
    handleEmailVerified,
    handlePhoneVerified,
    handleClose,
    handleSubmit,
    setAddressEditorOpen,
  };
}
