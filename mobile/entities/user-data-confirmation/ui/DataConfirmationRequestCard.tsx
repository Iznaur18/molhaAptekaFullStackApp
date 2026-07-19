import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

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
import { formatIsoDateTime } from "@/shared/lib";
import { usePrivateUploadDisplayUrl } from "@/shared/lib/usePrivateUploadDisplayUrl";
import { useDataConfirmationRequestsPageStyles } from "@/shared/theme/dataConfirmationRequestsPageStyles";
import { PrivateUploadImage } from "@/shared/ui/PrivateUploadImage";

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
  const selfieState = usePrivateUploadDisplayUrl(selfiePhotoUrl);
  const isBusy = resolveRequestMutation.isPending;

  const renderSelfieBlock = () => {
    if (selfieState.status === "ready" && selfieState.url) {
      return (
        <View style={styles.selfieLink}>
          <PrivateUploadImage
            uri={selfieState.url}
            style={styles.selfieImage}
            accessibilityLabel={DATA_CONFIRMATION_PAGE_UI.PASSPORT_SELFIE_SECTION}
          />
        </View>
      );
    }
    if (selfieState.status === "error") {
      return (
        <Text style={styles.selfieMissing}>
          {DATA_CONFIRMATION_PAGE_UI.PASSPORT_SELFIE_LOAD_ERROR}
          {selfieState.error ? ` (${selfieState.error})` : ""}
        </Text>
      );
    }
    if (selfiePhotoUrl || selfieState.status === "loading") {
      return <Text style={styles.selfieMissing}>Загрузка фото…</Text>;
    }
    return (
      <Text style={styles.selfieMissing}>{DATA_CONFIRMATION_PAGE_UI.PASSPORT_SELFIE_MISSING}</Text>
    );
  };

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
          onPress={() =>
            router.push({ pathname: "/user/[id]", params: { id: String(applicant._id) } })
          }
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
          <PassportField
            label="Код подразделения"
            value={passport.departmentCode?.trim() || "—"}
          />
        </View>
      </View>

      <View style={styles.selfieSection}>
        <Text style={styles.sectionTitle}>{DATA_CONFIRMATION_PAGE_UI.PASSPORT_SELFIE_SECTION}</Text>
        {renderSelfieBlock()}
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
            {isBusy
              ? DATA_CONFIRMATION_PAGE_UI.ACTION_PENDING
              : DATA_CONFIRMATION_PAGE_UI.ACTION_APPROVE}
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
