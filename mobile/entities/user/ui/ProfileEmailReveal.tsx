import { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";

import { fetchUserEmail } from "@/entities/user/api/fetchUserEmail";
import { USER_PROFILE_COPY } from "@/shared/config";
import { useUserProfileInfoPanelStyles } from "@/entities/user/ui/userProfileInfoPanelStyles";

type ProfileEmailRevealProps = {
  userId: string | null;
};

export const ProfileEmailReveal = ({ userId }: ProfileEmailRevealProps) => {
  const styles = useUserProfileInfoPanelStyles();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  if (email) {
    const href = `mailto:${email}`;
    return (
      <Pressable onPress={() => void Linking.openURL(href).catch(() => undefined)}>
        <Text style={[styles.detailValue, styles.detailValueLink]}>{email}</Text>
      </Pressable>
    );
  }

  return (
    <View>
      <Pressable
        disabled={pending}
        accessibilityRole="button"
        accessibilityLabel={USER_PROFILE_COPY.SHOW_EMAIL}
        onPress={() => {
          void (async () => {
            if (!userId) {
              setError(USER_PROFILE_COPY.SHOW_EMAIL_ERROR);
              return;
            }
            setPending(true);
            setError("");
            try {
              setEmail(await fetchUserEmail(userId));
            } catch (caught) {
              setError(
                caught instanceof Error
                  ? caught.message
                  : USER_PROFILE_COPY.SHOW_EMAIL_ERROR,
              );
            } finally {
              setPending(false);
            }
          })();
        }}
      >
        <Text style={[styles.detailValue, styles.revealPhone]}>
          {pending
            ? USER_PROFILE_COPY.SHOW_PHONE_NUMBER_PENDING
            : USER_PROFILE_COPY.SHOW_EMAIL}
        </Text>
      </Pressable>
      {error ? <Text style={styles.revealError}>{error}</Text> : null}
    </View>
  );
};
