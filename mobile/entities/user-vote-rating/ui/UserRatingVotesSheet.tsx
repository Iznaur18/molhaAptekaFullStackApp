import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useMyReceivedVotesInfiniteQuery } from "@/entities/user-vote-rating/model/useMyReceivedVotesInfiniteQuery";
import type { ReceivedVoteItem } from "@/entities/user-vote-rating/api/fetchMyReceivedVotes";
import { resolveVoteScoreTone } from "@/entities/user-vote-rating/lib/resolveVoteScoreTone";
import { USER_RATING_VOTES_SHEET_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useRegisterBlockingOverlay } from "@/shared/lib/useBlockingOverlayOccupancy";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { ModalSheetGradientBackdrop } from "@/shared/ui/ModalSheetGradientBackdrop";
import { AppButton } from "@/shared/ui/AppButton";

type UserRatingVotesSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const useStyles = createThemedStyles((theme) => ({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "78%",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[2],
  },
  title: {
    flex: 1,
    fontSize: theme.typography.fontLg,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  summary: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[3],
    fontSize: theme.typography.fontSm,
    color: theme.colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[4],
    gap: theme.spacing[2],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  name: {
    flex: 1,
    minWidth: 0,
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.action,
  },
  score: {
    minWidth: 40,
    textAlign: "center",
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightBold,
  },
  state: {
    padding: theme.spacing[6],
    alignItems: "center",
    gap: theme.spacing[3],
  },
  stateText: {
    fontSize: theme.typography.fontMd,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  footer: {
    paddingTop: theme.spacing[3],
  },
}));

export const UserRatingVotesSheet = ({
  visible,
  onClose,
}: UserRatingVotesSheetProps) => {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  useRegisterBlockingOverlay(visible);

  const votesQuery = useMyReceivedVotesInfiniteQuery({ enabled: visible });
  const votes = useMemo(
    () => votesQuery.data?.pages.flatMap((page) => page.votes) ?? [],
    [votesQuery.data],
  );
  const summary = votesQuery.data?.pages[0]?.summary ?? {
    countVotes: 0,
    averageRating: 0,
  };

  const openVoter = (vote: ReceivedVoteItem) => {
    const userId = String(vote.voter?._id ?? "").trim();
    if (!userId) {
      return;
    }
    onClose();
    router.push(`/user/${userId}`);
  };

  const scoreColor = (score: number) => {
    const tone = resolveVoteScoreTone(score);
    if (tone === "danger") return theme.colors.dangerText;
    if (tone === "warning") return theme.colors.warningText;
    return theme.colors.successText;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ModalSheetGradientBackdrop />
        <Pressable
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={USER_RATING_VOTES_SHEET_UI.CLOSE}
        />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.header}>
            <Text style={styles.title}>{USER_RATING_VOTES_SHEET_UI.TITLE}</Text>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={USER_RATING_VOTES_SHEET_UI.CLOSE}
            >
              <Feather name="x" size={22} color={theme.colors.text} />
            </Pressable>
          </View>
          <Text style={styles.summary}>
            {USER_RATING_VOTES_SHEET_UI.SUMMARY(
              Number(summary.averageRating) || 0,
              Number(summary.countVotes) || 0,
            )}
          </Text>

          {votesQuery.isPending ? (
            <View style={styles.state}>
              <ActivityIndicator />
              <Text style={styles.stateText}>{USER_RATING_VOTES_SHEET_UI.LOADING}</Text>
            </View>
          ) : votesQuery.isError ? (
            <View style={styles.state}>
              <Text style={styles.stateText}>
                {formatApiErrorMessage(
                  votesQuery.error,
                  USER_RATING_VOTES_SHEET_UI.EMPTY,
                )}
              </Text>
              <AppButton
                label={USER_RATING_VOTES_SHEET_UI.RETRY}
                variant="ghost"
                onPress={() => votesQuery.refetch()}
              />
            </View>
          ) : votes.length === 0 ? (
            <View style={styles.state}>
              <Text style={styles.stateText}>{USER_RATING_VOTES_SHEET_UI.EMPTY}</Text>
            </View>
          ) : (
            <FlatList
              data={votes}
              keyExtractor={(item) => item.voteId}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const name =
                  String(item.voter?.userName ?? "").trim() ||
                  USER_RATING_VOTES_SHEET_UI.DELETED_USER;
                const canOpen = Boolean(String(item.voter?._id ?? "").trim());
                return (
                  <Pressable
                    style={styles.row}
                    onPress={canOpen ? () => openVoter(item) : undefined}
                    disabled={!canOpen}
                    accessibilityRole={canOpen ? "button" : undefined}
                    accessibilityLabel={
                      canOpen
                        ? USER_RATING_VOTES_SHEET_UI.OPEN_PROFILE_ARIA(name)
                        : undefined
                    }
                  >
                    <Text style={styles.name} numberOfLines={1}>
                      {name}
                    </Text>
                    <Text
                      style={[styles.score, { color: scoreColor(item.score) }]}
                      accessibilityLabel={USER_RATING_VOTES_SHEET_UI.SCORE_ARIA(
                        item.score,
                      )}
                    >
                      {item.score}
                    </Text>
                  </Pressable>
                );
              }}
              ListFooterComponent={
                votesQuery.hasNextPage ? (
                  <View style={styles.footer}>
                    <AppButton
                      label={USER_RATING_VOTES_SHEET_UI.LOAD_MORE}
                      variant="ghost"
                      onPress={() => votesQuery.fetchNextPage()}
                      disabled={votesQuery.isFetchingNextPage}
                    />
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};
