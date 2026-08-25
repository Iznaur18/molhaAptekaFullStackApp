import {
  USER_SAVED_ADDRESSES_MAX,
  USER_SAVED_ADDRESS_LABEL_MAX_LENGTH,
} from "@molha/api-contract";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { createUserSavedAddressId } from "@/entities/address/lib/createUserSavedAddressId";
import { ensureSingleDefaultUserSavedAddress } from "@/entities/address/lib/ensureSingleDefaultUserSavedAddress";
import { createEmptyUserSavedAddressDraft } from "@/entities/address/lib/userSavedAddressesFromUser";
import { validateUserSavedAddressDraft } from "@/entities/address/lib/validateUserSavedAddressesForm";
import type { RuDeliveryAddressValue } from "@/entities/address/model/types";
import type { UserSavedAddressFormValue } from "@/entities/address/model/userSavedAddressTypes";
import { AddressSuggestInput } from "@/entities/address/ui/AddressSuggestInput";
import {
  ADDRESS_DELIVERY_UI,
  ADDRESS_STRUCTURED_UI,
  USER_SAVED_ADDRESSES_UI,
} from "@/shared/config";
import { confirmDestructiveAction } from "@/shared/lib/confirmDestructiveAction";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useEditProfileFormStyles } from "@/shared/theme/editProfileFormStyles";
import { useSavedAddressesEditorStyles } from "@/shared/theme/savedAddressesEditorStyles";

const NEW_ADDRESS_EDITING_ID = "new";

type UserSavedAddressesEditorProps = {
  value: UserSavedAddressFormValue[];
  onChange: (next: UserSavedAddressFormValue[]) => void;
  onDefaultRegionCodeChange?: (regionCode: string | null) => void;
  disabled?: boolean;
  /** Родитель блокирует сохранение профиля, пока открыт черновик. */
  onEditingChange?: (isEditing: boolean) => void;
  /**
   * Приход по подсказке «добавьте адрес»: сразу открываем черновик, иначе
   * человек попадает на пустой список и должен искать кнопку сам.
   */
  autoStartAdd?: boolean;
};

/**
 * Книга адресов профиля: добавить, изменить, удалить, выбрать по умолчанию.
 * Порт `client/src/entities/address/ui/UserSavedAddressesEditor.jsx`.
 */
export const UserSavedAddressesEditor = ({
  value,
  onChange,
  onDefaultRegionCodeChange,
  disabled = false,
  onEditingChange,
  autoStartAdd = false,
}: UserSavedAddressesEditorProps) => {
  const theme = useAppTheme();
  const formStyles = useEditProfileFormStyles();
  const styles = useSavedAddressesEditorStyles();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<UserSavedAddressFormValue>(
    createEmptyUserSavedAddressDraft,
  );
  const [draftError, setDraftError] = useState("");

  useEffect(() => {
    onEditingChange?.(Boolean(editingId));
  }, [editingId, onEditingChange]);

  const addresses = Array.isArray(value) ? value : [];
  const canAddMore = addresses.length < USER_SAVED_ADDRESSES_MAX;

  const closeEditor = () => {
    setEditingId(null);
    setDraft(createEmptyUserSavedAddressDraft());
    setDraftError("");
  };

  const syncDefaultRegion = (nextList: UserSavedAddressFormValue[]) => {
    const defaultAddress = nextList.find((item) => item.isDefault) ?? null;
    onDefaultRegionCodeChange?.(defaultAddress?.regionCode ?? null);
  };

  const startAdd = () => {
    if (disabled || !canAddMore) {
      return;
    }
    setEditingId(NEW_ADDRESS_EDITING_ID);
    setDraft(createEmptyUserSavedAddressDraft());
    setDraftError("");
  };

  const startEdit = (id: string) => {
    if (disabled) {
      return;
    }
    const current = addresses.find((item) => item.id === id);
    if (!current) {
      return;
    }
    setEditingId(id);
    setDraft({ ...current });
    setDraftError("");
  };

  const didAutoStartRef = useRef(false);
  useEffect(() => {
    if (!autoStartAdd || didAutoStartRef.current || disabled) {
      return;
    }
    if (addresses.length > 0 || editingId) {
      return;
    }
    didAutoStartRef.current = true;
    startAdd();
    // startAdd читает актуальные addresses/disabled на момент вызова.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStartAdd, disabled, addresses.length, editingId]);

  const commitDraft = () => {
    const error = validateUserSavedAddressDraft(draft);
    if (error) {
      setDraftError(error);
      return;
    }

    const isNew = editingId === NEW_ADDRESS_EDITING_ID;
    const nextItem: UserSavedAddressFormValue = {
      ...draft,
      id: isNew ? createUserSavedAddressId() : draft.id,
      label: String(draft.label ?? "").trim(),
      flat: String(draft.flat ?? "").trim(),
      // Первый адрес в книге сразу становится основным.
      isDefault: isNew ? addresses.length === 0 : draft.isDefault,
    };

    const nextList = isNew
      ? [...addresses, nextItem]
      : addresses.map((item) => (item.id === editingId ? nextItem : item));

    const normalized = ensureSingleDefaultUserSavedAddress(nextList);
    onChange(normalized);
    syncDefaultRegion(normalized);
    closeEditor();
  };

  const setDefault = (id: string) => {
    if (disabled) {
      return;
    }
    const nextList = addresses.map((item) => ({
      ...item,
      isDefault: item.id === id,
    }));
    onChange(nextList);
    syncDefaultRegion(nextList);
  };

  const removeAddress = (id: string) => {
    if (disabled) {
      return;
    }
    confirmDestructiveAction({
      title: USER_SAVED_ADDRESSES_UI.REMOVE_CONFIRM,
      message: "",
      confirmLabel: USER_SAVED_ADDRESSES_UI.REMOVE,
      cancelLabel: USER_SAVED_ADDRESSES_UI.CANCEL,
      onConfirm: () => {
        const nextList = addresses.filter((item) => item.id !== id);
        const normalized = ensureSingleDefaultUserSavedAddress(nextList);
        onChange(normalized);
        syncDefaultRegion(normalized);

        if (editingId === id) {
          closeEditor();
        }
      },
    });
  };

  const handleDraftAddressChange = (nextAddress: RuDeliveryAddressValue) => {
    setDraft((prev) => ({ ...prev, ...nextAddress }));
    setDraftError("");
  };

  return (
    <View style={styles.root}>
      <Text style={formStyles.label}>{USER_SAVED_ADDRESSES_UI.SECTION_LABEL}</Text>

      {addresses.length === 0 ? (
        <Text style={formStyles.hint}>{USER_SAVED_ADDRESSES_UI.EMPTY}</Text>
      ) : (
        <View style={styles.list}>
          {addresses.map((item) => (
            <View key={item.id} style={formStyles.savedAddressCard}>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: item.isDefault, disabled }}
                accessibilityLabel={USER_SAVED_ADDRESSES_UI.LABEL_DEFAULT}
                disabled={disabled}
                onPress={() => setDefault(item.id)}
                style={styles.defaultRow}
              >
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: item.isDefault
                        ? theme.colors.action
                        : theme.colors.border,
                    },
                  ]}
                >
                  {item.isDefault ? (
                    <View
                      style={[styles.radioDot, { backgroundColor: theme.colors.action }]}
                    />
                  ) : null}
                </View>
                <Text style={formStyles.savedAddressBadge}>
                  {USER_SAVED_ADDRESSES_UI.LABEL_DEFAULT}
                </Text>
              </Pressable>

              {item.label ? (
                <Text style={formStyles.savedAddressLabel}>{item.label}</Text>
              ) : null}

              <Text style={formStyles.savedAddressLine}>
                {USER_SAVED_ADDRESSES_UI.FORMAT_LINE(item.line, item.flat)}
              </Text>

              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  disabled={disabled}
                  onPress={() => removeAddress(item.id)}
                  style={[styles.action, disabled && styles.actionDisabled]}
                >
                  <Text style={[styles.actionText, { color: theme.colors.danger }]}>
                    {USER_SAVED_ADDRESSES_UI.REMOVE}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={disabled}
                  onPress={() => startEdit(item.id)}
                  style={[styles.action, disabled && styles.actionDisabled]}
                >
                  <Text style={[styles.actionText, { color: theme.colors.action }]}>
                    {USER_SAVED_ADDRESSES_UI.EDIT}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      {editingId ? (
        <View style={styles.editor}>
          <View style={formStyles.field}>
            <Text style={formStyles.label}>{USER_SAVED_ADDRESSES_UI.LABEL_NAME}</Text>
            <TextInput
              style={formStyles.input}
              value={draft.label}
              maxLength={USER_SAVED_ADDRESS_LABEL_MAX_LENGTH}
              placeholder={USER_SAVED_ADDRESSES_UI.PLACEHOLDER_NAME}
              placeholderTextColor={theme.colors.textMuted}
              editable={!disabled}
              onChangeText={(label) => {
                setDraft((prev) => ({ ...prev, label }));
                setDraftError("");
              }}
            />
          </View>

          <AddressSuggestInput
            value={draft}
            onChange={handleDraftAddressChange}
            disabled={disabled}
            label={ADDRESS_STRUCTURED_UI.SECTION_LABEL}
            placeholder={ADDRESS_DELIVERY_UI.PLACEHOLDER_LINE}
          />

          <View style={formStyles.field}>
            <Text style={formStyles.label}>{ADDRESS_DELIVERY_UI.LABEL_FLAT}</Text>
            <TextInput
              style={formStyles.input}
              value={draft.flat}
              placeholder={ADDRESS_STRUCTURED_UI.PLACEHOLDER_FLAT}
              placeholderTextColor={theme.colors.textMuted}
              editable={!disabled}
              onChangeText={(flat) => {
                setDraft((prev) => ({ ...prev, flat }));
                setDraftError("");
              }}
            />
          </View>

          {draftError ? (
            <Text
              style={[styles.error, { color: theme.colors.danger }]}
              accessibilityRole="alert"
            >
              {draftError}
            </Text>
          ) : null}

          <View style={styles.editorActions}>
            <Pressable
              accessibilityRole="button"
              disabled={disabled}
              onPress={commitDraft}
              style={[
                styles.primaryButton,
                { backgroundColor: theme.colors.action },
                disabled && styles.actionDisabled,
              ]}
            >
              <Text style={[styles.primaryButtonText, { color: theme.colors.onContrast }]}>
                {USER_SAVED_ADDRESSES_UI.SAVE}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={disabled}
              onPress={closeEditor}
              style={[
                styles.secondaryButton,
                { borderColor: theme.colors.border },
                disabled && styles.actionDisabled,
              ]}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
                {USER_SAVED_ADDRESSES_UI.CANCEL}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {!editingId && canAddMore ? (
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={startAdd}
          style={[
            styles.secondaryButton,
            { borderColor: theme.colors.action },
            disabled && styles.actionDisabled,
          ]}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.colors.action }]}>
            {USER_SAVED_ADDRESSES_UI.ADD}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};
