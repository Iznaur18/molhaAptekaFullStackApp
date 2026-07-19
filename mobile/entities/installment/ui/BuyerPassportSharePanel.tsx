import { Text, View } from "react-native";

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

export const BuyerPassportSharePanel = ({ share }: BuyerPassportSharePanelProps) => {
  const styles = useBuyerPassportSharePanelStyles();
  const passport = share?.passport;
  const selfiePhotoUrl = share?.passportSelfiePhotoUrl?.trim() ?? "";
  const selfieState = usePrivateUploadDisplayUrl(passport ? selfiePhotoUrl : "");

  if (!passport) {
    return null;
  }

  const renderSelfie = () => {
    if (selfieState.status === "ready" && selfieState.url) {
      return (
        <PrivateUploadImage
          uri={selfieState.url}
          style={styles.selfieImage}
          accessibilityLabel={INSTALLMENT_UI.PASSPORT_SHARE_SELFIE_SECTION}
        />
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
      <Text style={styles.selfieMissing}>{INSTALLMENT_UI.PASSPORT_SHARE_SELFIE_MISSING}</Text>
    );
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>{INSTALLMENT_UI.PASSPORT_SHARE_SECTION}</Text>
      <View style={styles.field}>
        <Text style={styles.label}>ФИО</Text>
        <Text style={styles.value}>{formatPassportFullName(passport)}</Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Дата рождения</Text>
        <Text style={styles.value}>{formatPassportDate(passport.birthDate)}</Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Серия и номер</Text>
        <Text style={styles.value}>
          {passport.series} {passport.number}
        </Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Кем выдан</Text>
        <Text style={styles.value}>{passport.issuedBy}</Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Дата выдачи</Text>
        <Text style={styles.value}>{formatPassportDate(passport.issuedAt)}</Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Код подразделения</Text>
        <Text style={styles.value}>{passport.departmentCode}</Text>
      </View>
      <Text style={styles.selfieTitle}>{INSTALLMENT_UI.PASSPORT_SHARE_SELFIE_SECTION}</Text>
      {renderSelfie()}
    </View>
  );
};
