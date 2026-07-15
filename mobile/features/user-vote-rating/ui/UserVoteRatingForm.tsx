import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { parseUserRatingAggregate } from "@/entities/user-vote-rating/lib/parseUserRatingAggregate";
import {
  USER_VOTE_RATING_VALUE_MAX,
  USER_VOTE_RATING_VALUE_MIN,
} from "@/entities/user-vote-rating/model/constants";
import { userVoteQueryKeys } from "@/entities/user-vote-rating/model/userVoteQueryKeys";
import { useMyVoteForTargetQuery } from "@/entities/user-vote-rating/model/useMyVoteForTargetQuery";
import { useSubmitUserVoteRatingMutation } from "@/entities/user-vote-rating/model/useSubmitUserVoteRatingMutation";
import { API_CLIENT_UI, USER_VOTE_RATING_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { pluralizeRu } from "@/shared/lib/pluralizeRu";
import { useUserVoteRatingStyles } from "@/shared/theme/accountFeatureStyles";

import { VoteScoreChip } from "./VoteScoreChip";

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

const formatVotesCaption = (countVotes: number): string => {
  if (countVotes <= 0) {
    return `0 ${USER_VOTE_RATING_UI.VOTES_FORMS[2]}`;
  }
  return `${countVotes} ${pluralizeRu(countVotes, USER_VOTE_RATING_UI.VOTES_FORMS)}`;
};

export const UserVoteRatingForm = ({
  targetUser,
  currentUserId,
  isAuthorized,
  onRated,
}: UserVoteRatingFormProps) => {
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

  const aggregate = useMemo(
    () => parseUserRatingAggregate(targetUser.userRatingByVotes),
    [targetUser.userRatingByVotes],
  );

  const votesCaption = formatVotesCaption(aggregate.countVotes);
  const hasAverage = aggregate.average != null;

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

  const renderAggregateHero = () => (
    <View style={styles.aggregateHero}>
      <Text style={styles.aggregateValue}>{aggregate.averageLabel}</Text>
      <View style={styles.aggregateMeta}>
        <Text style={styles.aggregateOutOf}>{USER_VOTE_RATING_UI.OUT_OF_MAX}</Text>
        <Text style={styles.aggregateVotes}>{votesCaption}</Text>
      </View>
    </View>
  );

  const renderRatedCard = () => (
    <View style={styles.ratedCard}>
      <Text style={styles.ratedCheck}>{USER_VOTE_RATING_UI.SUCCESS_CHECKMARK}</Text>
      <Text style={styles.ratedTitle}>{USER_VOTE_RATING_UI.ALREADY_RATED_TITLE}</Text>
      <Text style={styles.ratedScore}>{USER_VOTE_RATING_UI.YOUR_SCORE(score)}</Text>
      {flashMessage ? <Text style={styles.flash}>{flashMessage}</Text> : null}
    </View>
  );

  const renderVoteControls = () => (
    <>
      <Text style={styles.rangeLabel}>
        {USER_VOTE_RATING_UI.RANGE_LABEL}: {score}
      </Text>
      <View style={styles.scaleEdgeRow}>
        <Text style={styles.scaleEdgeLabel}>{USER_VOTE_RATING_UI.SCALE_LOW}</Text>
        <Text style={styles.scaleEdgeLabel}>{USER_VOTE_RATING_UI.SCALE_HIGH}</Text>
      </View>
      <View style={styles.scoreGrid}>
        {SCORE_OPTIONS.map((value) => (
          <VoteScoreChip
            key={value}
            value={value}
            selected={value === score}
            disabled={submitVoteMutation.isPending}
            onPress={setScore}
          />
        ))}
      </View>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
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
    </>
  );

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
      return (
        <View style={styles.body}>
          <Text style={styles.hint}>{USER_VOTE_RATING_UI.ME_LOADING}</Text>
        </View>
      );
    }

    if (isSelf) {
      return (
        <View style={styles.body}>
          {renderAggregateHero()}
          <Text style={styles.hint}>{USER_VOTE_RATING_UI.SELF_HINT}</Text>
        </View>
      );
    }

    if (!myVoteResolved) {
      return (
        <View style={styles.body}>
          <Text style={styles.title}>{USER_VOTE_RATING_UI.TITLE}</Text>
          {renderAggregateHero()}
          <Text style={styles.hint}>{USER_VOTE_RATING_UI.MY_VOTE_RESOLVING}</Text>
        </View>
      );
    }

    return (
      <View style={styles.body}>
        <Text style={styles.title}>{USER_VOTE_RATING_UI.TITLE}</Text>
        {renderAggregateHero()}
        {voteSubmitted ? renderRatedCard() : renderVoteControls()}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <Pressable
        style={styles.summary}
        onPress={() => setExpanded((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <View style={styles.summaryMain}>
          <Text style={styles.summaryText}>{USER_VOTE_RATING_UI.COLLAPSE_SUMMARY}</Text>
          <View style={styles.summaryMeta}>
            <Text style={[styles.summaryAvg, !hasAverage && styles.summaryAvgMuted]}>
              {aggregate.averageLabel}
            </Text>
            <Text style={styles.summaryOutOf}>{USER_VOTE_RATING_UI.OUT_OF_MAX}</Text>
            <Text style={styles.summaryVotes}>· {votesCaption}</Text>
          </View>
        </View>
        <Text style={styles.chevron}>{expanded ? "▲" : "▼"}</Text>
      </Pressable>
      {expanded ? renderBody() : null}
    </View>
  );
};
