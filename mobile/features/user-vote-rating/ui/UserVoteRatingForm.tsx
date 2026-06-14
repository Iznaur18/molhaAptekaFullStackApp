import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

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
import { useUserVoteRatingStyles } from "@/shared/theme/accountFeatureStyles";

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
  const styles = useUserVoteRatingStyles();
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
          <Text style={styles.hint}>{USER_VOTE_RATING_UI.LOGIN_HINT}</Text>
          <Pressable style={styles.button} onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.buttonText}>{USER_VOTE_RATING_UI.LOGIN_BUTTON}</Text>
          </Pressable>
        </View>
      );
    }

    if (currentUserId == null) {
      return <Text style={styles.hint}>{USER_VOTE_RATING_UI.ME_LOADING}</Text>;
    }

    if (isSelf) {
      return <Text style={styles.hint}>{USER_VOTE_RATING_UI.SELF_HINT}</Text>;
    }

    if (!myVoteResolved) {
      return (
        <View style={styles.body}>
          <Text style={styles.title}>{USER_VOTE_RATING_UI.TITLE}</Text>
          <Text style={styles.aggregate}>
            {USER_VOTE_RATING_UI.CURRENT_AGGREGATE}: {aggregateText}
          </Text>
          <Text style={styles.hint}>{USER_VOTE_RATING_UI.MY_VOTE_RESOLVING}</Text>
        </View>
      );
    }

    return (
      <View style={styles.body}>
        <Text style={styles.title}>{USER_VOTE_RATING_UI.TITLE}</Text>
        <Text style={styles.aggregate}>
          {USER_VOTE_RATING_UI.CURRENT_AGGREGATE}: {aggregateText}
        </Text>
        <Text style={styles.rangeLabel}>
          {USER_VOTE_RATING_UI.RANGE_LABEL}: {score}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scoreRow}>
          {SCORE_OPTIONS.map((value) => {
            const selected = value === score;
            return (
              <Pressable
                key={value}
                style={[styles.scoreChip, selected && styles.scoreChipSelected]}
                disabled={submitVoteMutation.isPending || voteSubmitted}
                onPress={() => setScore(value)}
              >
                <Text style={[styles.scoreChipText, selected && styles.scoreChipTextSelected]}>
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
            style={styles.button}
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
    <View style={styles.root}>
      <Pressable style={styles.summary} onPress={() => setExpanded((value) => !value)}>
        <Text style={styles.summaryText}>{USER_VOTE_RATING_UI.COLLAPSE_SUMMARY}</Text>
        <Text style={{ color: theme.colors.textMuted }}>{expanded ? "▲" : "▼"}</Text>
      </Pressable>
      {expanded ? renderBody() : null}
    </View>
  );
};
