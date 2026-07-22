import {
  formatLoyaltyPointsCount,
  resolveLoyaltyPointsProgressPercent,
} from "@izibuy/shared-lib";
import { Text, View } from "react-native";

import { USERS_MONTHLY_LOYALTY_LOADBAR_UI } from "@/shared/config";
import { useUsersMonthlyLoyaltyLoadBarStyles } from "@/shared/theme/usersMonthlyLoyaltyLoadBarStyles";

type UsersMonthlyLoyaltyLoadBarProps = {
  pointsAwarded: number;
  goal: number;
  description?: string;
  isLoading?: boolean;
};

export const UsersMonthlyLoyaltyLoadBar = ({
  pointsAwarded,
  goal,
  description = "",
  isLoading = false,
}: UsersMonthlyLoyaltyLoadBarProps) => {
  const styles = useUsersMonthlyLoyaltyLoadBarStyles();
  const pointsLabel = formatLoyaltyPointsCount(pointsAwarded);
  const goalLabel = formatLoyaltyPointsCount(goal);
  const percent = resolveLoyaltyPointsProgressPercent(pointsAwarded, goal);
  const counter = USERS_MONTHLY_LOYALTY_LOADBAR_UI.COUNTER(pointsLabel, goalLabel);
  const trimmedDescription = description.trim();

  return (
    <View
      style={styles.root}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      accessibilityLabel={USERS_MONTHLY_LOYALTY_LOADBAR_UI.PROGRESS_ARIA(
        pointsLabel,
        goalLabel,
      )}
    >
      <View style={styles.titleRow}>
        <Text style={styles.title}>{USERS_MONTHLY_LOYALTY_LOADBAR_UI.TITLE}</Text>
        <Text style={styles.counter}>{isLoading ? "…" : counter}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
      {trimmedDescription ? (
        <Text style={styles.description}>{trimmedDescription}</Text>
      ) : null}
    </View>
  );
};
