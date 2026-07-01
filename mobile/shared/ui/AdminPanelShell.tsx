import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import { ADMIN_PANEL_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useAdminPanelStyles } from "@/shared/theme/adminPanelStyles";

type AdminPanelShellProps = {
  title: string;
  hint: string;
  count: number;
  filteredCount?: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  onRefresh: () => void;
  isLoading: boolean;
  isRefreshing?: boolean;
  error?: string;
  isCreateOpen: boolean;
  onToggleCreate: () => void;
  createHeading: string;
  createPanel: ReactNode;
  topSlot?: ReactNode;
  children: ReactNode;
};

export const AdminPanelShell = ({
  title,
  hint,
  count,
  filteredCount,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  onRefresh,
  isLoading,
  isRefreshing = false,
  error = "",
  isCreateOpen,
  onToggleCreate,
  createHeading,
  createPanel,
  topSlot = null,
  children,
}: AdminPanelShellProps) => {
  const styles = useAdminPanelStyles();
  const theme = useAppTheme();
  const countLabel =
    filteredCount != null && filteredCount !== count
      ? ADMIN_PANEL_UI.COUNT_FILTERED(filteredCount, count)
      : ADMIN_PANEL_UI.COUNT(count);

  return (
    <View style={styles.root}>
      {topSlot ? <View style={styles.topSlot}>{topSlot}</View> : null}

      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.toolbarPrimaryRow}>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{countLabel}</Text>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            value={searchValue}
            onChangeText={onSearchChange}
            placeholder={searchPlaceholder}
            placeholderTextColor={theme.colors.textMuted}
            accessibilityLabel={searchPlaceholder}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchValue.length > 0 ? (
            <Pressable
              style={styles.searchClear}
              accessibilityRole="button"
              accessibilityLabel={ADMIN_PANEL_UI.SEARCH_CLEAR}
              onPress={() => onSearchChange("")}
            >
              <Text style={styles.searchClearText}>×</Text>
            </Pressable>
          ) : null}
          {isRefreshing ? (
            <ActivityIndicator
              size="small"
              color={theme.colors.action}
              accessibilityLabel={ADMIN_PANEL_UI.SEARCH_PENDING}
            />
          ) : null}
        </View>

        <View style={styles.toolbarActions}>
          <Pressable
            style={[styles.toolbarButton, (isLoading || isRefreshing) && styles.toolbarButtonDisabled]}
            disabled={isLoading || isRefreshing}
            onPress={onRefresh}
          >
            <Text style={styles.toolbarButtonText}>{ADMIN_PANEL_UI.REFRESH}</Text>
          </Pressable>

          <Pressable style={[styles.toolbarButton, styles.toolbarButtonPrimary]} onPress={onToggleCreate}>
            <Text style={[styles.toolbarButtonText, styles.toolbarButtonPrimaryText]}>
              {isCreateOpen ? ADMIN_PANEL_UI.HIDE_CREATE : ADMIN_PANEL_UI.SHOW_CREATE}
            </Text>
          </Pressable>
        </View>
      </View>

      {error ? (
        <Text style={[styles.alert, styles.alertError]} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}

      {isLoading ? (
        <Text style={[styles.alert, styles.alertInfo]}>{ADMIN_PANEL_UI.LOADING}</Text>
      ) : null}

      {isCreateOpen ? (
        <View style={styles.createSection}>
          <Text style={styles.createHeading}>{createHeading}</Text>
          <View style={styles.createBody}>{createPanel}</View>
        </View>
      ) : null}

      {children}
    </View>
  );
};
