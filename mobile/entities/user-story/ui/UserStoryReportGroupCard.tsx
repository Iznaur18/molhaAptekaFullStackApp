import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { resolveUserStoryMediaUrl } from "@/entities/user-story/lib/resolveUserStoryMediaUrl";
import type { UserStoryReportGroup } from "@/entities/user-story/api/userStoryReportStaffApi";
import {
  USER_STORY_MEDIA_TYPE_VIDEO,
  USER_STORY_REPORT_RESOLUTION_DISMISS,
  USER_STORY_REPORT_RESOLUTION_HIDE,
} from "@/entities/user-story/model/constants";
import { useResolveUserStoryReportsMutation } from "@/entities/user-story/model/useUserStoryReportStaffMutations";
import { PRODUCT_REPORTS_PAGE_UI, USER_STORY_UI } from "@/shared/config";
import { formatIsoDateTime } from "@/shared/lib";
import { ProductPreviewVideo } from "@/shared/ui/ProductPreviewVideo";
import { useStaffReportGroupCardStyles } from "@/shared/theme/staffReportGroupCardStyles";

const STAFF_NOTE_REQUIRED_ERROR = "Укажите комментарий staff";

type UserStoryReportGroupCardProps = {
  group: UserStoryReportGroup;
  onResolved: () => void;
};

export const UserStoryReportGroupCard = ({ group, onResolved }: UserStoryReportGroupCardProps) => {
  const router = useRouter();
  const styles = useStaffReportGroupCardStyles();
  const resolveReportsMutation = useResolveUserStoryReportsMutation();
  const [staffNote, setStaffNote] = useState("");
  const [error, setError] = useState("");

  const storyId = String(group.story._id);
  const authorId = String(group.author._id);
  const mediaUrl = resolveUserStoryMediaUrl(group.story.mediaUrl);
  const captionText = String(group.story.captionText ?? "").trim();

  const handleResolve = async (resolution: string) => {
    const note = staffNote.trim();
    if (note.length === 0) {
      setError(STAFF_NOTE_REQUIRED_ERROR);
      return;
    }

    setError("");
    try {
      await resolveReportsMutation.mutateAsync({
        storyId,
        body: { resolution, staffNote: note },
      });
      onResolved();
    } catch (resolveError) {
      setError(
        resolveError instanceof Error ? resolveError.message : USER_STORY_UI.ERROR_GENERIC,
      );
    }
  };

  const isBusy = resolveReportsMutation.isPending;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Сторис</Text>
        <Text style={styles.count}>
          {USER_STORY_UI.STORY_REPORTS_COUNT_LABEL(group.reportCount)}
        </Text>
      </View>

      <View>
        {group.story.mediaType === USER_STORY_MEDIA_TYPE_VIDEO ? (
          <ProductPreviewVideo uri={mediaUrl} />
        ) : (
          <Image source={{ uri: mediaUrl }} style={styles.media} contentFit="cover" />
        )}
        {captionText ? <Text style={styles.caption}>{captionText}</Text> : null}
      </View>

      <View style={styles.links}>
        <Pressable onPress={() => router.push({ pathname: "/user/[id]", params: { id: authorId } })}>
          <Text style={styles.link}>{USER_STORY_UI.STORY_REPORTS_OPEN_AUTHOR}</Text>
        </Pressable>
      </View>

      <View style={styles.reports}>
        {group.reports.map((report) => {
          const reporterId = String(report.reporter._id);
          const reporterName = report.reporter.userName?.trim() || reporterId;

          return (
            <View key={report._id} style={styles.report}>
              <View style={styles.reportMeta}>
                <Text>
                  {PRODUCT_REPORTS_PAGE_UI.REPORT_ITEM_META(
                    reporterName,
                    report.createdAt ? formatIsoDateTime(report.createdAt) : "—",
                  )}
                </Text>
                <Pressable
                  onPress={() => router.push({ pathname: "/user/[id]", params: { id: reporterId } })}
                >
                  <Text style={styles.link}>{PRODUCT_REPORTS_PAGE_UI.OPEN_REPORTER}</Text>
                </Pressable>
              </View>
              <Text style={styles.reportText}>{report.reportText}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.staffLabel}>
        <Text>{USER_STORY_UI.STORY_REPORTS_STAFF_NOTE_LABEL}</Text>
        <TextInput
          style={styles.staffInput}
          value={staffNote}
          multiline
          numberOfLines={2}
          editable={!isBusy}
          placeholder={USER_STORY_UI.STORY_REPORTS_STAFF_NOTE_PLACEHOLDER}
          onChangeText={setStaffNote}
        />
      </View>

      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, isBusy && styles.actionButtonDisabled]}
          disabled={isBusy}
          onPress={() => {
            void handleResolve(USER_STORY_REPORT_RESOLUTION_DISMISS);
          }}
        >
          <Text style={styles.actionButtonText}>
            {isBusy
              ? USER_STORY_UI.STORY_REPORTS_ACTION_PENDING
              : USER_STORY_UI.STORY_REPORTS_ACTION_DISMISS}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, isBusy && styles.actionButtonDisabled]}
          disabled={isBusy}
          onPress={() => {
            void handleResolve(USER_STORY_REPORT_RESOLUTION_HIDE);
          }}
        >
          <Text style={styles.actionButtonText}>{USER_STORY_UI.STORY_REPORTS_ACTION_HIDE}</Text>
        </Pressable>
      </View>
    </View>
  );
};
