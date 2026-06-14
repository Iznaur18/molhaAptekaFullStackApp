import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useUserFollowMutations } from "@/entities/user-follow/model/useUserFollowMutations";
import { USER_FOLLOW_BUTTON_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

type UserFollowButtonProps = {
  targetUserId: string;
  isFollowing: boolean;
  isAuthorized: boolean;
  isSelf: boolean;
  onFollowChange?: (next: { isFollowing: boolean }) => void;
};

export const UserFollowButton = ({
  targetUserId,
  isFollowing,
  isAuthorized,
  isSelf,
  onFollowChange,
}: UserFollowButtonProps) => {
  const router = useRouter();
  const { followMutation, unfollowMutation } = useUserFollowMutations();
  const [errorMessage, setErrorMessage] = useState("");

  if (isSelf) {
    return null;
  }

  const isBusy = followMutation.isPending || unfollowMutation.isPending;

  const handlePress = async () => {
    if (!isAuthorized) {
      router.push("/(auth)/login");
      return;
    }
    if (isBusy) {
      return;
    }

    try {
      setErrorMessage("");
      if (isFollowing) {
        await unfollowMutation.mutateAsync(targetUserId);
        onFollowChange?.({ isFollowing: false });
      } else {
        const result = await followMutation.mutateAsync(targetUserId);
        onFollowChange?.({ isFollowing: result.isFollowing });
      }
    } catch (error) {
      setErrorMessage(formatApiErrorMessage(error, USER_FOLLOW_BUTTON_UI.ERROR));
    }
  };

  const label = isFollowing ? USER_FOLLOW_BUTTON_UI.UNFOLLOW : USER_FOLLOW_BUTTON_UI.FOLLOW;

  return (
    <View style={styles.root}>
      <Pressable
        style={[styles.button, isFollowing && styles.buttonFollowing]}
        onPress={() => void handlePress()}
        disabled={isBusy}
      >
        <Text style={[styles.buttonText, isFollowing && styles.buttonTextFollowing]}>
          {isBusy ? USER_FOLLOW_BUTTON_UI.LOADING : label}
        </Text>
      </Pressable>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    marginTop: 4,
    gap: 4,
  },
  button: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#1f6feb",
  },
  buttonFollowing: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonTextFollowing: {
    color: "#374151",
  },
  error: {
    fontSize: 12,
    color: "#c62828",
  },
});
