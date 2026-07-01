import { Text, View } from "react-native";

import type { RaffleFromApi } from "@/entities/raffle/model/types";
import { RaffleManageActions } from "@/entities/raffle/ui/RaffleManageActions";
import { RafflesStaffRowMedia } from "@/entities/raffle/ui/RafflesStaffRowMedia";
import { RAFFLES_STAFF_PAGE_UI } from "@/shared/config";
import { useRafflesStaffPageStyles } from "@/shared/theme/rafflesStaffPageStyles";

type RafflesStaffLiveRowProps = {
  raffle: RaffleFromApi;
  busy: boolean;
  errorMessage?: string;
  onDelete: () => void;
  onEdit?: () => void;
};

export const RafflesStaffLiveRow = ({
  raffle,
  busy,
  errorMessage = "",
  onDelete,
  onEdit,
}: RafflesStaffLiveRowProps) => {
  const styles = useRafflesStaffPageStyles();
  const showProgress =
    raffle.status === "active" || raffle.status === "completed";

  return (
    <View style={[styles.row, styles.rowLive]}>
      <View style={styles.rowMain}>
        <RafflesStaffRowMedia raffle={raffle} />
        <View style={styles.rowBody}>
          <Text style={styles.title}>{raffle.title}</Text>
          <Text style={styles.meta}>
            {RAFFLES_STAFF_PAGE_UI.ROW_SELLER}: {raffle.seller?.userName ?? "—"}
          </Text>
          <Text style={styles.meta}>
            {RAFFLES_STAFF_PAGE_UI.ROW_TARGET}: {raffle.targetSales}
            {showProgress ? ` · ${raffle.salesProgress} / ${raffle.targetSales}` : ""}
          </Text>
        </View>
      </View>

      {errorMessage ? (
        <Text style={styles.rowError} accessibilityRole="alert">
          {errorMessage}
        </Text>
      ) : null}

      <RaffleManageActions
        showEdit={Boolean(onEdit)}
        showDelete
        onEdit={onEdit}
        onDelete={onDelete}
        busy={busy}
      />
    </View>
  );
};
