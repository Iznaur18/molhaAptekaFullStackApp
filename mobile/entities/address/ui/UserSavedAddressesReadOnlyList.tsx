import { Text, View } from "react-native";

import { userSavedAddressesFromUser } from "@/entities/address/lib/userSavedAddressesFromUser";
import { USER_SAVED_ADDRESSES_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useEditProfileFormStyles } from "@/shared/theme/editProfileFormStyles";

type UserSavedAddressesReadOnlyListProps = {
  user: Record<string, unknown>;
};

export const UserSavedAddressesReadOnlyList = ({
  user,
}: UserSavedAddressesReadOnlyListProps) => {
  const theme = useAppTheme();
  const styles = useEditProfileFormStyles();
  const addresses = userSavedAddressesFromUser(user);

  if (addresses.length === 0) {
    return null;
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{USER_SAVED_ADDRESSES_UI.SECTION_LABEL}</Text>
      {addresses.length > 1 ? (
        <Text style={styles.hint}>{USER_SAVED_ADDRESSES_UI.MOBILE_READ_ONLY_HINT}</Text>
      ) : null}
      {addresses.map((item) => (
        <View key={item.id} style={styles.savedAddressCard}>
          {item.isDefault ? (
            <Text style={styles.savedAddressBadge}>{USER_SAVED_ADDRESSES_UI.LABEL_DEFAULT}</Text>
          ) : null}
          {item.label ? <Text style={styles.savedAddressLabel}>{item.label}</Text> : null}
          <Text style={styles.savedAddressLine}>
            {USER_SAVED_ADDRESSES_UI.FORMAT_LINE(item.line, item.flat)}
          </Text>
        </View>
      ))}
      {addresses.length > 1 ? (
        <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
          {USER_SAVED_ADDRESSES_UI.MOBILE_MANAGE_ON_WEB}
        </Text>
      ) : null}
    </View>
  );
};
