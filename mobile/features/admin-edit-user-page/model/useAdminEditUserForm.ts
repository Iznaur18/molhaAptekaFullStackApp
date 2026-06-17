import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

import { useUserAccess } from "@/entities/access/model/useUserAccess";
import { patchUserProfile } from "@/entities/user/api/patchUserProfile";
import { buildAdminPatchUserProfileBody } from "@/entities/user/lib/buildAdminPatchUserProfileBody";
import { canStaffEditTargetUserPremium } from "@/entities/user/lib/canStaffEditTargetUserPremium";
import {
  mapUserToAdminEditProfileForm,
  type AdminEditProfileFormState,
} from "@/entities/user/lib/mapUserToAdminEditProfileForm";
import { validateAdminEditProfileForm } from "@/entities/user/lib/validateAdminEditProfileForm";
import { willFormDisablePremium } from "@/entities/user/lib/willFormDisablePremium";
import { userProfileQueryKeys } from "@/entities/user/model/userProfileQueryKeys";
import { useUserProfileQuery } from "@/entities/user/model/useUserProfileQuery";
import { ADMIN_EDIT_USER_UI, EDIT_PROFILE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

type UseAdminEditUserFormParams = {
  userId: string;
  currentUserId: string | null;
};

export const useAdminEditUserForm = ({ userId, currentUserId }: UseAdminEditUserFormParams) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canModerate, isAdmin, role } = useUserAccess();
  const profileQuery = useUserProfileQuery({ userId, enabled: userId.length > 0 });

  const user = profileQuery.data as Record<string, unknown> | undefined;
  const isSelf = currentUserId != null && userId === currentUserId;
  const canAccess = canModerate && !isSelf;

  const initialForm = useMemo(
    () => (user ? mapUserToAdminEditProfileForm(user) : null),
    [user],
  );

  const [baselineForm, setBaselineForm] = useState<AdminEditProfileFormState | null>(null);
  const [form, setForm] = useState<AdminEditProfileFormState | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!initialForm) {
      return;
    }
    setBaselineForm(initialForm);
    setForm(initialForm);
    setErrorMessage("");
    setSuccessMessage("");
  }, [initialForm]);

  const staffCanEditPremium =
    user != null &&
    canStaffEditTargetUserPremium({
      editorRole: role,
      targetRole: typeof user.userRole === "string" ? user.userRole : null,
    });

  const patchMutation = useMutation({
    mutationFn: ({
      targetUserId,
      body,
    }: {
      targetUserId: string;
      body: Record<string, unknown>;
    }) => patchUserProfile(targetUserId, body),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(userProfileQueryKeys.byId(userId), updatedUser);
      void queryClient.invalidateQueries({ queryKey: userProfileQueryKeys.byId(userId) });
    },
  });

  const updateField = useCallback(
    <K extends keyof AdminEditProfileFormState>(key: K, value: AdminEditProfileFormState[K]) => {
      setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
      setErrorMessage("");
      setSuccessMessage("");
    },
    [],
  );

  const submitPatch = useCallback(async () => {
    if (!user || !form || !baselineForm) {
      return;
    }

    const body = buildAdminPatchUserProfileBody(form, baselineForm, {
      includePremium: staffCanEditPremium,
      includeRole: isAdmin,
    });

    if (Object.keys(body).length === 0) {
      setErrorMessage(EDIT_PROFILE_UI.NOTHING_TO_SAVE);
      return;
    }

    setErrorMessage("");
    try {
      const updatedUser = await patchMutation.mutateAsync({
        targetUserId: userId,
        body,
      });
      const nextForm = mapUserToAdminEditProfileForm(updatedUser as Record<string, unknown>);
      setBaselineForm(nextForm);
      setForm(nextForm);
      router.back();
    } catch (error) {
      setSuccessMessage("");
      setErrorMessage(formatApiErrorMessage(error, EDIT_PROFILE_UI.SAVE_ERROR));
    }
  }, [baselineForm, form, isAdmin, patchMutation, router, staffCanEditPremium, user, userId]);

  const handleSubmit = useCallback(async () => {
    if (!user || !form) {
      return;
    }

    const validationError = validateAdminEditProfileForm(form, { includeRole: isAdmin });
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const premiumWillBeDisabled = staffCanEditPremium && willFormDisablePremium(user, form);
    if (premiumWillBeDisabled) {
      const userName = String(user.userName ?? "").trim() || "пользователя";
      Alert.alert(
        ADMIN_EDIT_USER_UI.TITLE,
        ADMIN_EDIT_USER_UI.DISABLE_PREMIUM_CONFIRM(userName),
        [
          { text: "Отмена", style: "cancel" },
          { text: "Отключить", style: "destructive", onPress: () => void submitPatch() },
        ],
      );
      return;
    }

    await submitPatch();
  }, [form, isAdmin, staffCanEditPremium, submitPatch, user]);

  useEffect(() => {
    if (!canAccess && !profileQuery.isPending) {
      router.replace(userId ? `/user/${userId}` : "/(tabs)/profile");
    }
  }, [canAccess, profileQuery.isPending, router, userId]);

  const reportError = useCallback((message: string) => {
    setErrorMessage(message);
    setSuccessMessage("");
  }, []);

  return {
    canAccess,
    profileQuery,
    user,
    form,
    updateField,
    handleSubmit,
    errorMessage,
    successMessage,
    reportError,
    isSubmitting: patchMutation.isPending,
    staffCanEditPremium,
    isAdmin,
  };
};
