import { View } from "react-native";

import { UsersSearchInput } from "@/shared/ui/UsersSearchInput";
import { useUsersPageStyles } from "@/shared/theme/usersPageStyles";

type UsersPageSearchBarProps = {
  value: string;
  onChange: (next: string) => void;
  isPending?: boolean;
};

export const UsersPageSearchBar = ({
  value,
  onChange,
  isPending = false,
}: UsersPageSearchBarProps) => {
  const styles = useUsersPageStyles();

  return (
    <View style={styles.searchBar}>
      <UsersSearchInput value={value} onChange={onChange} isPending={isPending} />
    </View>
  );
};
