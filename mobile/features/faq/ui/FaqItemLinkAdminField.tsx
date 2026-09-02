import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { useFaqItemLinkMutations } from "@/entities/faq-item-link/model/useFaqItemLinkMutations";
import { FAQ_UI } from "@/shared/config";
import { useFaqPageStyles } from "@/shared/theme/faqPageStyles";

type FaqItemLinkAdminFieldProps = {
  itemId: string;
  href?: string | null;
};

export const FaqItemLinkAdminField = ({ itemId, href }: FaqItemLinkAdminFieldProps) => {
  const styles = useFaqPageStyles();
  const { patchLinkMutation } = useFaqItemLinkMutations();
  const [draft, setDraft] = useState(href ?? "");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(href ?? "");
  }, [href, itemId]);

  const isSaving = patchLinkMutation.isPending;

  const handleSave = async () => {
    setNotice("");
    setError("");

    try {
      await patchLinkMutation.mutateAsync({
        itemId,
        body: { href: draft.trim() === "" ? null : draft.trim() },
      });
      setNotice(draft.trim() === "" ? FAQ_UI.ADMIN_LINK_CLEARED : FAQ_UI.ADMIN_LINK_SAVED);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : FAQ_UI.ADMIN_LINK_SAVE);
    }
  };

  const handleClear = async () => {
    setNotice("");
    setError("");

    try {
      await patchLinkMutation.mutateAsync({
        itemId,
        body: { resetHref: true },
      });
      setDraft("");
      setNotice(FAQ_UI.ADMIN_LINK_CLEARED);
    } catch (clearError) {
      setError(clearError instanceof Error ? clearError.message : FAQ_UI.ADMIN_LINK_CLEAR);
    }
  };

  return (
    <View style={styles.linkAdmin}>
      <Text style={styles.linkAdminLabel}>{FAQ_UI.ADMIN_LINK_LABEL}</Text>
      <Text style={styles.linkAdminHint}>{FAQ_UI.ADMIN_LINK_HINT}</Text>
      <TextInput
        style={styles.linkAdminInput}
        value={draft}
        placeholder={FAQ_UI.ADMIN_LINK_PLACEHOLDER}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isSaving}
        onChangeText={setDraft}
      />
      {error ? (
        <Text style={styles.linkAdminError} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      {notice ? (
        <Text style={styles.linkAdminNotice} accessibilityRole="text">
          {notice}
        </Text>
      ) : null}
      <View style={styles.linkAdminActions}>
        <Pressable
          accessibilityRole="button"
          disabled={isSaving}
          style={[styles.linkAdminSave, isSaving ? styles.linkAdminButtonDisabled : null]}
          onPress={() => void handleSave()}
        >
          <Text style={styles.linkAdminSaveText}>
            {isSaving ? FAQ_UI.ADMIN_LINK_SAVING : FAQ_UI.ADMIN_LINK_SAVE}
          </Text>
        </Pressable>
        {href ? (
          <Pressable
            accessibilityRole="button"
            disabled={isSaving}
            style={[styles.linkAdminClear, isSaving ? styles.linkAdminButtonDisabled : null]}
            onPress={() => void handleClear()}
          >
            <Text style={styles.linkAdminClearText}>{FAQ_UI.ADMIN_LINK_CLEAR}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};
