import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import type { UserStoryReportGroup } from "@/entities/user-story/api/userStoryReportStaffApi";
import {
  USER_STORY_MEDIA_TYPE_VIDEO,
  USER_STORY_REPORT_RESOLUTION_DISMISS,
  USER_STORY_REPORT_RESOLUTION_HIDE,
} from "@/entities/user-story/model/constants";
import { useResolveUserStoryReportsMutation } from "@/entities/user-story/model/useUserStoryReportStaffMutations";
import { USER_STORY_UI } from "@/shared/config";
import { useStaffQueueStyles } from "@/shared/theme/staffQueueStyles";
import { ProductPreviewVideo } from "@/shared/ui/ProductPreviewVideo";
import { StaffModerationActions } from "@/shared/ui/StaffModerationActions";

type UserStoryReportGroupRowProps = {
  group: UserStoryReportGroup;
  onChanged: () => void;
};

export const UserStoryReportGroupRow = ({ group, onChanged }: UserStoryReportGroupRowProps) => {
  const styles = useStaffQueueStyles();
  const router = useRouter();
  const resolveMutation = useResolveUserStoryReportsMutation();
  const [staffNote, setStaffNote] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const storyId = String(group.story._id);
  const authorId = String(group.author._id);
  const isBusy = resolveMutation.isPending;

  const resolve = async (resolution: string) => {
    const note = staffNote.trim();
    if (!note) {
      setErrorMessage("Укажите комментарий staff");
      return;
    }
    setErrorMessage("");
    try {
      await resolveMutation.mutateAsync({ storyId, body: { resolution, staffNote: note } });
      onChanged();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : USER_STORY_UI.ERROR_GENERIC,
      );
    }
  };

  const captionText = String(group.story.captionText ?? "").trim();

  return (
    <View style={styles.row}>
      <Text style={styles.title}>
        {USER_STORY_UI.STORY_REPORTS_COUNT_LABEL(group.reportCount)}
      </Text>
      <View style={styles.mediaWrap}>
        {group.story.mediaType === USER_STORY_MEDIA_TYPE_VIDEO ? (
          <ProductPreviewVideo uri={group.story.mediaUrl} />
        ) : (
          <Image source={{ uri: group.story.mediaUrl }} style={styles.media} contentFit="cover" />
        )}
      </View>
      {captionText ? <Text style={styles.caption}>{captionText}</Text> : null}
      <Pressable onPress={() => router.push(`/user/${authorId}`)}>
        <Text style={styles.link}>{USER_STORY_UI.STORY_REPORTS_OPEN_AUTHOR}</Text>
      </Pressable>
      {group.reports.map((report) => (
        <Text key={report._id} style={styles.reportText}>
          {report.reporter.userName?.trim() || report.reporter._id}: {report.reportText}
        </Text>
      ))}
      <StaffModerationActions
        approveLabel={USER_STORY_UI.STORY_REPORTS_ACTION_DISMISS}
        rejectLabel={USER_STORY_UI.STORY_REPORTS_ACTION_HIDE}
        pendingLabel={USER_STORY_UI.STORY_REPORTS_ACTION_PENDING}
        isBusy={isBusy}
        note={staffNote}
        onNoteChange={setStaffNote}
        notePlaceholder={USER_STORY_UI.STORY_REPORT_TEXT_PLACEHOLDER}
        onApprove={() => void resolve(USER_STORY_REPORT_RESOLUTION_DISMISS)}
        onReject={() => void resolve(USER_STORY_REPORT_RESOLUTION_HIDE)}
        errorMessage={errorMessage}
      />
    </View>
  );
};
