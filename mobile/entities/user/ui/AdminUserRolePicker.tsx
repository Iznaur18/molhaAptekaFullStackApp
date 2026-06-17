import { Pressable, Text, View } from "react-native";

import { USER_ROLE_LABEL_RU } from "@/entities/user/model/constants";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import type { UserRole } from "@izibuy/shared-lib";
import {
  USER_ROLE_ADMIN,
  USER_ROLE_MODERATOR,
  USER_ROLE_USER,
} from "@izibuy/shared-lib";

const ROLE_OPTIONS: UserRole[] = [USER_ROLE_USER, USER_ROLE_MODERATOR, USER_ROLE_ADMIN];

type AdminUserRolePickerProps = {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
};

const useStyles = createThemedStyles((theme) => ({
  root: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  option: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    backgroundColor: theme.colors.surfaceMuted,
  },
  optionSelected: {
    borderColor: theme.colors.nearBlack,
    backgroundColor: theme.colors.surface,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
  },
}));

export const AdminUserRolePicker = ({
  value,
  onChange,
  disabled = false,
}: AdminUserRolePickerProps) => {
  const styles = useStyles();

  return (
    <View style={styles.root}>
      {ROLE_OPTIONS.map((role) => {
        const isSelected = value === role;
        return (
          <Pressable
            key={role}
            style={[styles.option, isSelected && styles.optionSelected]}
            disabled={disabled}
            onPress={() => onChange(role)}
          >
            <Text style={styles.optionLabel}>{USER_ROLE_LABEL_RU[role] ?? role}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};
