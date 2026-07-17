import { View } from "react-native";

import { UsersSearchInput } from "@/shared/ui/UsersSearchInput";
import { useUsersPageStyles } from "@/shared/theme/usersPageStyles";

type UsersPageSearchBarProps = {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  isPending?: boolean;
};

export const UsersPageSearchBar = ({
  value,
  onChange,
  onSubmit,
  isPending = false,
}: UsersPageSearchBarProps) => {
  const styles = useUsersPageStyles();

  return (
    <View style={styles.searchBar}>
      <UsersSearchInput
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        isPending={isPending}
      />
    </View>
  );
};
