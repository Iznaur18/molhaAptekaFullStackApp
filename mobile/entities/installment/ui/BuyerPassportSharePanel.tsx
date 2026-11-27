import { Linking, Pressable, Text, View } from "react-native";

import {
  formatPassportDate,
  formatPassportFullName,
} from "@/entities/user-data-confirmation/lib/formatPassportDisplay";
import type { PassportSnapshot } from "@/entities/user-data-confirmation/lib/emptyPassportForm";
import { INSTALLMENT_UI } from "@/shared/config";
import { usePrivateUploadDisplayUrl } from "@/shared/lib/usePrivateUploadDisplayUrl";
import { useBuyerPassportSharePanelStyles } from "@/shared/theme/commerceScreenStyles";
import { PrivateUploadImage } from "@/shared/ui/PrivateUploadImage";

export type BuyerPassportShare = {
  passport?: Partial<PassportSnapshot> | null;
  passportSelfiePhotoUrl?: string | null;
  consentAt?: string | null;
};

type BuyerPassportSharePanelProps = {
  share?: BuyerPassportShare | null;
};

type PassportField = {
  label: string;
  value: string;
};

export const BuyerPassportSharePanel = ({ share }: BuyerPassportSharePanelProps) => {
  const styles = useBuyerPassportSharePanelStyles();
  const passport = share?.passport;
  const selfiePhotoUrl = share?.passportSelfiePhotoUrl?.trim() ?? "";
  const selfieState = usePrivateUploadDisplayUrl(passport ? selfiePhotoUrl : "");

  if (!passport) {
    return null;
  }

  const fields: PassportField[] = [
    { label: "ФИО", value: formatPassportFullName(passport) },
    { label: "Дата рождения", value: formatPassportDate(passport.birthDate) },
    {
      label: "Серия и номер",
      value: `${passport.series ?? ""} ${passport.number ?? ""}`.trim(),
    },
    { label: "Кем выдан", value: String(passport.issuedBy ?? "") },
    { label: "Дата выдачи", value: formatPassportDate(passport.issuedAt) },
    { label: "Код подразделения", value: String(passport.departmentCode ?? "") },
  ];

  const openSelfie = () => {
    if (selfieState.status === "ready" && selfieState.url) {
      void Linking.openURL(selfieState.url).catch(() => undefined);
    }
  };

  const renderSelfie = () => {
    if (selfieState.status === "ready" && selfieState.url) {
      return (
        <Pressable
          style={styles.selfieLink}
          onPress={openSelfie}
          accessibilityRole="link"
          accessibilityLabel={INSTALLMENT_UI.PASSPORT_SHARE_SELFIE_OPEN}
        >
          <PrivateUploadImage
            uri={selfieState.url}
            style={styles.selfieImage}
            accessibilityLabel={INSTALLMENT_UI.PASSPORT_SHARE_SELFIE_SECTION}
          />
          <Text style={styles.selfieLinkText}>
            {INSTALLMENT_UI.PASSPORT_SHARE_SELFIE_OPEN}
          </Text>
        </Pressable>
      );
    }
    if (selfieState.status === "error") {
      return (
        <Text style={styles.selfieMissing}>
          {INSTALLMENT_UI.PASSPORT_SHARE_SELFIE_LOAD_ERROR}
          {selfieState.error ? ` (${selfieState.error})` : ""}
        </Text>
      );
    }
    if (selfiePhotoUrl || selfieState.status === "loading") {
      return <Text style={styles.selfieMissing}>Загрузка фото…</Text>;
    }
    return (
      <Text style={styles.selfieMissing}>
        {INSTALLMENT_UI.PASSPORT_SHARE_SELFIE_MISSING}
      </Text>
    );
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>{INSTALLMENT_UI.PASSPORT_SHARE_SECTION}</Text>
      <View style={styles.grid}>
        {fields.map((field) => (
          <View key={field.label} style={styles.field}>
            <Text style={styles.label}>{field.label}</Text>
            <Text style={styles.value}>{field.value}</Text>
          </View>
        ))}
      </View>
      <View style={styles.selfieSection}>
        <Text style={styles.selfieTitle}>
          {INSTALLMENT_UI.PASSPORT_SHARE_SELFIE_SECTION}
        </Text>
        {renderSelfie()}
      </View>
    </View>
  );
};
