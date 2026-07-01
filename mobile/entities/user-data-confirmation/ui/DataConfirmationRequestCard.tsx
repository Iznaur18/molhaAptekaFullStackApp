import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Linking, Pressable, Text, TextInput, View } from "react-native";

import type { DataConfirmationRequest } from "@/entities/user-data-confirmation/api/dataConfirmationStaffApi";
import { countWords } from "@/entities/user-data-confirmation/lib/countWords";
import {
  formatPassportDate,
  formatPassportFullName,
} from "@/entities/user-data-confirmation/lib/formatPassportDisplay";
import {
  USER_DATA_CONFIRMATION_RESOLUTION_APPROVE,
  USER_DATA_CONFIRMATION_RESOLUTION_REJECT,
} from "@/entities/user-data-confirmation/model/constants";
import { useResolveDataConfirmationRequestMutation } from "@/entities/user-data-confirmation/model/useDataConfirmationStaffMutations";
import { UserPremiumDisplayName } from "@/entities/user/ui/UserPremiumDisplayName";
import { DATA_CONFIRMATION_PAGE_UI, USER_LIST_ROW_UI } from "@/shared/config";
import { formatIsoDateTime, resolveUploadedMediaUrl } from "@/shared/lib";
import { useDataConfirmationRequestsPageStyles } from "@/shared/theme/dataConfirmationRequestsPageStyles";

type PassportFieldProps = {
  label: string;
  value: string;
};

const PassportField = ({ label, value }: PassportFieldProps) => {
  const styles = useDataConfirmationRequestsPageStyles();

  return (
    <View style={styles.passportField}>
      <Text style={styles.passportLabel}>{label}</Text>
      <Text style={styles.passportValue}>{value}</Text>
    </View>
  );
};

type DataConfirmationRequestCardProps = {
  request: DataConfirmationRequest;
  onResolved: () => void;
};

export const DataConfirmationRequestCard = ({
  request,
  onResolved,
}: DataConfirmationRequestCardProps) => {
  const router = useRouter();
  const styles = useDataConfirmationRequestsPageStyles();
  const resolveRequestMutation = useResolveDataConfirmationRequestMutation();
  const [staffNote, setStaffNote] = useState("");
  const [error, setError] = useState("");

  const applicant = request.user;
  const displayName = applicant?.userName?.trim() || USER_LIST_ROW_UI.MISSING_NAME;
  const passport = request.passport ?? {};
  const selfiePhotoUrl = request.passportSelfiePhotoUrl?.trim() ?? "";
  const selfieDisplayUrl = selfiePhotoUrl ? resolveUploadedMediaUrl(selfiePhotoUrl) : "";
  const isBusy = resolveRequestMutation.isPending;

  const handleResolve = async (resolution: string) => {
    if (resolution === USER_DATA_CONFIRMATION_RESOLUTION_REJECT) {
      const note = staffNote.trim();
      if (countWords(note) < DATA_CONFIRMATION_PAGE_UI.STAFF_NOTE_MIN_WORDS) {
        setError(
          `Комментарий: не меньше ${DATA_CONFIRMATION_PAGE_UI.STAFF_NOTE_MIN_WORDS} слов`,
        );
        return;
      }
    }

    setError("");
    try {
      await resolveRequestMutation.mutateAsync({
        requestId: String(request._id),
        body: {
          resolution,
          staffNote:
            resolution === USER_DATA_CONFIRMATION_RESOLUTION_REJECT ? staffNote.trim() : "",
        },
      });
      onResolved();
    } catch (resolveError) {
      setError(resolveError instanceof Error ? resolveError.message : "Ошибка");
    }
  };

  const openSelfie = async () => {
    if (!selfieDisplayUrl) {
      return;
    }
    try {
      await Linking.openURL(selfieDisplayUrl);
    } catch {
      // noop — URL may be invalid in dev
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <UserPremiumDisplayName
          name={displayName}
          isPremium={Boolean(applicant?.isPremiumUser)}
          isUserDataConfirmed={false}
        />
        <Text style={styles.cardMeta}>
          {DATA_CONFIRMATION_PAGE_UI.SUBMITTED_LABEL}: {formatIsoDateTime(request.createdAt)}
        </Text>
      </View>

      {applicant?._id ? (
        <Pressable
          style={styles.applicantLink}
          onPress={() => router.push({ pathname: "/user/[id]", params: { id: String(applicant._id) } })}
        >
          <Text style={styles.applicantLinkText}>{DATA_CONFIRMATION_PAGE_UI.OPEN_APPLICANT}</Text>
        </Pressable>
      ) : null}

      <View>
        <Text style={styles.sectionTitle}>{DATA_CONFIRMATION_PAGE_UI.PASSPORT_SECTION}</Text>
        <View style={styles.passportGrid}>
          <PassportField label="ФИО" value={formatPassportFullName(passport)} />
          <PassportField label="Дата рождения" value={formatPassportDate(passport.birthDate)} />
          <PassportField
            label="Серия и номер"
            value={`${passport.series ?? ""} ${passport.number ?? ""}`.trim() || "—"}
          />
          <PassportField label="Кем выдан" value={passport.issuedBy?.trim() || "—"} />
          <PassportField label="Дата выдачи" value={formatPassportDate(passport.issuedAt)} />
          <PassportField label="Код подразделения" value={passport.departmentCode?.trim() || "—"} />
        </View>
      </View>

      <View style={styles.selfieSection}>
        <Text style={styles.sectionTitle}>{DATA_CONFIRMATION_PAGE_UI.PASSPORT_SELFIE_SECTION}</Text>
        {selfieDisplayUrl ? (
          <Pressable style={styles.selfieLink} onPress={() => void openSelfie()}>
            <Image source={{ uri: selfieDisplayUrl }} style={styles.selfieImage} contentFit="contain" />
            <Text style={styles.selfieOpenText}>{DATA_CONFIRMATION_PAGE_UI.PASSPORT_SELFIE_OPEN}</Text>
          </Pressable>
        ) : (
          <Text style={styles.selfieMissing}>{DATA_CONFIRMATION_PAGE_UI.PASSPORT_SELFIE_MISSING}</Text>
        )}
      </View>

      <View style={styles.staffLabel}>
        <Text>{DATA_CONFIRMATION_PAGE_UI.STAFF_NOTE_LABEL}</Text>
        <TextInput
          style={styles.staffInput}
          multiline
          value={staffNote}
          onChangeText={setStaffNote}
          placeholder={DATA_CONFIRMATION_PAGE_UI.STAFF_NOTE_PLACEHOLDER}
          editable={!isBusy}
        />
      </View>

      {error ? (
        <Text style={styles.rowError} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionPrimary, isBusy && styles.actionDisabled]}
          disabled={isBusy}
          onPress={() => void handleResolve(USER_DATA_CONFIRMATION_RESOLUTION_APPROVE)}
        >
          <Text style={styles.actionPrimaryText}>
            {isBusy ? DATA_CONFIRMATION_PAGE_UI.ACTION_PENDING : DATA_CONFIRMATION_PAGE_UI.ACTION_APPROVE}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.actionReject, isBusy && styles.actionDisabled]}
          disabled={isBusy}
          onPress={() => void handleResolve(USER_DATA_CONFIRMATION_RESOLUTION_REJECT)}
        >
          <Text style={styles.actionRejectText}>{DATA_CONFIRMATION_PAGE_UI.ACTION_REJECT}</Text>
        </Pressable>
      </View>
    </View>
  );
};
