import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { userProfileQueryKeys } from "@/entities/user/model/userProfileQueryKeys";
import {
  USER_VOTE_RATING_VALUE_MAX,
  USER_VOTE_RATING_VALUE_MIN,
} from "@/entities/user-vote-rating/model/constants";
import { userVoteQueryKeys } from "@/entities/user-vote-rating/model/userVoteQueryKeys";
import { useMyVoteForTargetQuery } from "@/entities/user-vote-rating/model/useMyVoteForTargetQuery";
import { useSubmitUserVoteRatingMutation } from "@/entities/user-vote-rating/model/useSubmitUserVoteRatingMutation";
import {
  API_CLIENT_UI,
  USER_PROFILE_COPY,
  USER_VOTE_RATING_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

const DEFAULT_SCORE = 5;

const SCORE_OPTIONS = Array.from(
  { length: USER_VOTE_RATING_VALUE_MAX - USER_VOTE_RATING_VALUE_MIN + 1 },
  (_, index) => USER_VOTE_RATING_VALUE_MIN + index,
);

type UserVoteRatingFormProps = {
  targetUser: Record<string, unknown> & { _id: string };
  currentUserId: string | null;
  isAuthorized: boolean;
  onRated: (snapshot: Record<string, unknown>) => void;
};

const formatAggregateLine = (userRatingByVotes: unknown): string => {
  if (!userRatingByVotes || typeof userRatingByVotes !== "object") {
    return USER_PROFILE_COPY.RATING_NONE;
  }

  const raw = userRatingByVotes as { countVotes?: number; totalRating?: number };
  const countVotes = Number(raw.countVotes) || 0;
  const totalRating = Number(raw.totalRating) || 0;

  if (countVotes === 0) {
    return USER_PROFILE_COPY.RATING_NONE;
  }

  const avg = totalRating / countVotes;
  const rounded = Math.round(avg * 10) / 10;
  return `${rounded} · ${countVotes}`;
};

export const UserVoteRatingForm = ({
  targetUser,
  currentUserId,
  isAuthorized,
  onRated,
}: UserVoteRatingFormProps) => {
  const theme = useAppTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const submitVoteMutation = useSubmitUserVoteRatingMutation();
  const [expanded, setExpanded] = useState(false);
  const [score, setScore] = useState(DEFAULT_SCORE);
  const [errorMessage, setErrorMessage] = useState("");
  const [flashMessage, setFlashMessage] = useState("");
  const [voteSubmitted, setVoteSubmitted] = useState(false);

  const targetUserId = String(targetUser._id);
  const isSelf = currentUserId != null && String(currentUserId) === targetUserId;

  const myVoteQuery = useMyVoteForTargetQuery({
    targetUserId,
    enabled: isAuthorized && currentUserId != null && !isSelf,
  });

  const aggregateText = useMemo(
    () => formatAggregateLine(targetUser.userRatingByVotes),
    [targetUser.userRatingByVotes],
  );

  const myVoteResolved =
    !isAuthorized || currentUserId == null || isSelf || !myVoteQuery.isLoading;

  useEffect(() => {
    setErrorMessage("");
    setFlashMessage("");

    if (!isAuthorized || currentUserId == null || isSelf) {
      setScore(DEFAULT_SCORE);
      setVoteSubmitted(false);
      return;
    }

    if (myVoteQuery.isLoading) {
      return;
    }

    const voteValue = myVoteQuery.data;
    if (
      voteValue != null &&
      voteValue >= USER_VOTE_RATING_VALUE_MIN &&
      voteValue <= USER_VOTE_RATING_VALUE_MAX
    ) {
      setScore(voteValue);
      setVoteSubmitted(true);
      return;
    }

    setScore(DEFAULT_SCORE);
    setVoteSubmitted(false);
  }, [
    currentUserId,
    isAuthorized,
    isSelf,
    myVoteQuery.data,
    myVoteQuery.isLoading,
    targetUserId,
  ]);

  useEffect(() => {
    if (!flashMessage) {
      return undefined;
    }

    const timer = setTimeout(() => setFlashMessage(""), USER_VOTE_RATING_UI.SUCCESS_FLASH_MS);
    return () => clearTimeout(timer);
  }, [flashMessage]);

  const handleSubmit = async () => {
    try {
      setErrorMessage("");
      const { user: snapshot } = await submitVoteMutation.mutateAsync({
        targetUserId,
        score,
      });
      onRated(snapshot);
      queryClient.setQueryData(userVoteQueryKeys.myForTarget(targetUserId), score);
      setVoteSubmitted(true);
      setFlashMessage(USER_VOTE_RATING_UI.SUCCESS);
    } catch (error) {
      setErrorMessage(formatApiErrorMessage(error, API_CLIENT_UI.VOTE_SUBMIT_FALLBACK));
    }
  };

  const renderBody = () => {
    if (!isAuthorized) {
      return (
        <View style={styles.body}>
          <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
            {USER_VOTE_RATING_UI.LOGIN_HINT}
          </Text>
          <Pressable
            style={[styles.button, { backgroundColor: theme.colors.nearBlack }]}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.buttonText}>{USER_VOTE_RATING_UI.LOGIN_BUTTON}</Text>
          </Pressable>
        </View>
      );
    }

    if (currentUserId == null) {
      return (
        <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
          {USER_VOTE_RATING_UI.ME_LOADING}
        </Text>
      );
    }

    if (isSelf) {
      return (
        <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
          {USER_VOTE_RATING_UI.SELF_HINT}
        </Text>
      );
    }

    if (!myVoteResolved) {
      return (
        <View style={styles.body}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{USER_VOTE_RATING_UI.TITLE}</Text>
          <Text style={[styles.aggregate, { color: theme.colors.textMuted }]}>
            {USER_VOTE_RATING_UI.CURRENT_AGGREGATE}: {aggregateText}
          </Text>
          <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
            {USER_VOTE_RATING_UI.MY_VOTE_RESOLVING}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.body}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{USER_VOTE_RATING_UI.TITLE}</Text>
        <Text style={[styles.aggregate, { color: theme.colors.textMuted }]}>
          {USER_VOTE_RATING_UI.CURRENT_AGGREGATE}: {aggregateText}
        </Text>
        <Text style={[styles.rangeLabel, { color: theme.colors.text }]}>
          {USER_VOTE_RATING_UI.RANGE_LABEL}: {score}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scoreRow}>
          {SCORE_OPTIONS.map((value) => {
            const selected = value === score;
            return (
              <Pressable
                key={value}
                style={[
                  styles.scoreChip,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: selected ? theme.colors.nearBlack : theme.colors.surface,
                  },
                ]}
                disabled={submitVoteMutation.isPending || voteSubmitted}
                onPress={() => setScore(value)}
              >
                <Text style={[styles.scoreChipText, { color: selected ? "#fff" : theme.colors.text }]}>
                  {value}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        {flashMessage ? <Text style={styles.flash}>{flashMessage}</Text> : null}
        {voteSubmitted ? (
          <Pressable style={[styles.button, styles.buttonDisabled]} disabled>
            <Text style={styles.buttonText}>{USER_VOTE_RATING_UI.ALREADY_RATED}</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.button, { backgroundColor: theme.colors.nearBlack }]}
            disabled={submitVoteMutation.isPending}
            onPress={() => void handleSubmit()}
          >
            <Text style={styles.buttonText}>
              {submitVoteMutation.isPending
                ? USER_VOTE_RATING_UI.SUBMIT_LOADING
                : USER_VOTE_RATING_UI.SUBMIT}
            </Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.root, { borderColor: theme.colors.border }]}>
      <Pressable style={styles.summary} onPress={() => setExpanded((value) => !value)}>
        <Text style={[styles.summaryText, { color: theme.colors.text }]}>
          {USER_VOTE_RATING_UI.COLLAPSE_SUMMARY}
        </Text>
        <Text style={{ color: theme.colors.textMuted }}>{expanded ? "▲" : "▼"}</Text>
      </Pressable>
      {expanded ? renderBody() : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  summaryText: {
    fontSize: 15,
    fontWeight: "600",
  },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  aggregate: {
    fontSize: 14,
  },
  rangeLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  scoreRow: {
    gap: 8,
    paddingVertical: 4,
  },
  scoreChip: {
    minWidth: 36,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  scoreChipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  hint: {
    fontSize: 14,
  },
  button: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  buttonDisabled: {
    backgroundColor: "#9e9e9e",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  error: {
    color: "#c62828",
    fontSize: 13,
  },
  flash: {
    color: "#2e7d32",
    fontSize: 13,
  },
});
