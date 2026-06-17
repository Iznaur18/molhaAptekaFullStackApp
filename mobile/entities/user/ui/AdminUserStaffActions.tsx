import { View } from "react-native";

import { ADMIN_EDIT_USER_UI } from "@/shared/config";
import { AppButton } from "@/shared/ui/AppButton";

type AdminUserStaffActionsProps = {
  onEditPress: () => void;
};

export const AdminUserStaffActions = ({ onEditPress }: AdminUserStaffActionsProps) => (
  <View>
    <AppButton label={ADMIN_EDIT_USER_UI.EDIT_BUTTON} variant="outline" onPress={onEditPress} />
  </View>
);
