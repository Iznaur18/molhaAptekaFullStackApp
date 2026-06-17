import { useEffect, useState } from "react";
import { Pressable, Switch, Text, TextInput, View } from "react-native";

import {
  computeStaffPremiumExpiresAtInput,
  formatPremiumExpiresAtDisplay,
  isPremiumExpiresAtInputActive,
  STAFF_PREMIUM_PRESET_MONTHS,
} from "@/entities/user/lib/computeStaffPremiumExpiry";
import { isPremiumActive } from "@/entities/user/lib/isPremiumActive";
import { ADMIN_EDIT_USER_UI } from "@/shared/config";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

type AdminPremiumStaffControlProps = {
  user: Record<string, unknown> & { _id: string };
  premiumExpiresAt: string;
  onPremiumExpiresAtChange: (value: string) => void;
  disabled?: boolean;
};

const useStyles = createThemedStyles((theme) => ({
  root: {
    marginTop: theme.spacing[4],
    gap: theme.spacing[3],
    padding: theme.spacing[3],
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  status: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: theme.spacing[1],
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.textMuted,
  },
  presets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  preset: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    backgroundColor: theme.colors.surfaceMuted,
  },
  presetSelected: {
    borderColor: theme.colors.nearBlack,
    backgroundColor: theme.colors.surface,
  },
  presetLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
  },
  customLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing[1],
  },
  customInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    fontSize: 14,
    color: theme.colors.text,
    backgroundColor: theme.colors.bg,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing[2],
  },
  toggleLabel: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
  },
}));

export const AdminPremiumStaffControl = ({
  user,
  premiumExpiresAt,
  onPremiumExpiresAtChange,
  disabled = false,
}: AdminPremiumStaffControlProps) => {
  const styles = useStyles();
  const [premiumEnabled, setPremiumEnabled] = useState(false);
  const [termMode, setTermMode] = useState<"preset" | "custom">("preset");
  const [presetMonths, setPresetMonths] = useState(1);

  useEffect(() => {
    const active = isPremiumActive({
      isPremiumUser: user.isPremiumUser === true,
      premiumExpiresAt: user.premiumExpiresAt as string | Date | null | undefined,
    });
    setPremiumEnabled(active);
    setTermMode(active ? "custom" : "preset");
    setPresetMonths(1);
  }, [user._id, user]);

  const statusText = isPremiumExpiresAtInputActive(premiumExpiresAt)
    ? ADMIN_EDIT_USER_UI.PREMIUM_STATUS_ACTIVE(formatPremiumExpiresAtDisplay(premiumExpiresAt))
    : ADMIN_EDIT_USER_UI.PREMIUM_STATUS_OFF;

  const handleToggle = (nextEnabled: boolean) => {
    if (!nextEnabled) {
      setPremiumEnabled(false);
      onPremiumExpiresAtChange("");
      return;
    }

    setPremiumEnabled(true);
    setTermMode("preset");
    setPresetMonths(1);
    onPremiumExpiresAtChange(computeStaffPremiumExpiresAtInput(user, 1));
  };

  const handlePresetPress = (months: number) => {
    if (disabled) {
      return;
    }
    setPremiumEnabled(true);
    setTermMode("preset");
    setPresetMonths(months);
    onPremiumExpiresAtChange(computeStaffPremiumExpiresAtInput(user, months));
  };

  return (
    <View style={styles.root}>
      <View>
        <Text style={styles.title}>{ADMIN_EDIT_USER_UI.PREMIUM_CARD_TITLE}</Text>
        <Text style={styles.status}>{statusText}</Text>
      </View>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>{ADMIN_EDIT_USER_UI.PREMIUM_TOGGLE_LABEL}</Text>
        <Switch
          value={premiumEnabled}
          onValueChange={handleToggle}
          disabled={disabled}
        />
      </View>

      {premiumEnabled ? (
        <View style={{ gap: 12 }}>
          <Text style={styles.hint}>{ADMIN_EDIT_USER_UI.PREMIUM_EXTEND_HINT}</Text>
          <View style={styles.presets}>
            {STAFF_PREMIUM_PRESET_MONTHS.map((months) => {
              const isSelected = termMode === "preset" && presetMonths === months;
              return (
                <Pressable
                  key={months}
                  style={[styles.preset, isSelected && styles.presetSelected]}
                  disabled={disabled}
                  onPress={() => handlePresetPress(months)}
                >
                  <Text style={styles.presetLabel}>
                    {ADMIN_EDIT_USER_UI.PREMIUM_PRESET_MONTHS(months)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View>
            <Text style={styles.customLabel}>{ADMIN_EDIT_USER_UI.PREMIUM_CUSTOM_DATE_LABEL}</Text>
            <TextInput
              style={styles.customInput}
              value={premiumExpiresAt}
              onChangeText={(value) => {
                setTermMode("custom");
                setPremiumEnabled(value.trim() !== "");
                onPremiumExpiresAtChange(value);
              }}
              editable={!disabled}
              placeholder="YYYY-MM-DDTHH:mm"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
};
