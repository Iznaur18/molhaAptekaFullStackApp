import { Link } from "expo-router";
import { Text, View } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { ScreenWithBack } from "@/shared/ui/ScreenWithBack";

const useStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: theme.colors.bg,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: theme.colors.link,
  },
}));

export default function NotFoundScreen() {
  const styles = useStyles();

  return (
    <ScreenWithBack>
      <View style={styles.container}>
        <Text style={styles.title}>Экран не существует</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>На главную</Text>
        </Link>
      </View>
    </ScreenWithBack>
  );
}
