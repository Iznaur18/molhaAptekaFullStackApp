import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import type { ProductReportGroup } from "@/entities/product-report/api/productReportStaffApi";
import {
  PRODUCT_REPORT_RESOLUTION_DISMISS,
  PRODUCT_REPORT_RESOLUTION_HIDE,
  PRODUCT_REPORT_RESOLUTION_REJECT,
} from "@/entities/product-report/model/constants";
import { useResolveProductReportsMutation } from "@/entities/product-report/model/useProductReportStaffMutations";
import { PRODUCT_REPORTS_PAGE_UI } from "@/shared/config";
import { formatIsoDateTime } from "@/shared/lib";
import { useStaffReportGroupCardStyles } from "@/shared/theme/staffReportGroupCardStyles";

const STAFF_NOTE_REQUIRED_ERROR = "Укажите комментарий staff";

type ProductReportGroupCardProps = {
  group: ProductReportGroup;
  onResolved: () => void;
};

export const ProductReportGroupCard = ({ group, onResolved }: ProductReportGroupCardProps) => {
  const router = useRouter();
  const styles = useStaffReportGroupCardStyles();
  const resolveReportsMutation = useResolveProductReportsMutation();
  const [staffNote, setStaffNote] = useState("");
  const [error, setError] = useState("");

  const productId = String(group.product._id);
  const sellerId =
    group.product.productSeller != null && typeof group.product.productSeller === "object"
      ? String((group.product.productSeller as { _id?: string })._id ?? "")
      : null;

  const handleResolve = async (resolution: string) => {
    const note = staffNote.trim();
    if (note.length === 0) {
      setError(STAFF_NOTE_REQUIRED_ERROR);
      return;
    }

    setError("");
    try {
      await resolveReportsMutation.mutateAsync({
        productId,
        body: { resolution, staffNote: note },
      });
      onResolved();
    } catch (resolveError) {
      setError(resolveError instanceof Error ? resolveError.message : "Ошибка");
    }
  };

  const isBusy = resolveReportsMutation.isPending;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {group.product.productName ?? "Товар"}
        </Text>
        <Text style={styles.count}>
          {PRODUCT_REPORTS_PAGE_UI.REPORTS_COUNT_LABEL(group.reportCount)}
        </Text>
      </View>

      <View style={styles.links}>
        <Pressable onPress={() => router.push({ pathname: "/product/[id]", params: { id: productId } })}>
          <Text style={styles.link}>{PRODUCT_REPORTS_PAGE_UI.OPEN_PRODUCT}</Text>
        </Pressable>
        {sellerId ? (
          <Pressable onPress={() => router.push({ pathname: "/user/[id]", params: { id: sellerId } })}>
            <Text style={styles.link}>{PRODUCT_REPORTS_PAGE_UI.OPEN_SELLER}</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.reports}>
        {group.reports.map((report) => {
          const reporterId = String(report.reporter?._id ?? "");
          const reporterName = report.reporter?.userName?.trim() || reporterId;

          return (
            <View key={report._id} style={styles.report}>
              <View style={styles.reportMeta}>
                <Text>
                  {PRODUCT_REPORTS_PAGE_UI.REPORT_ITEM_META(
                    reporterName,
                    report.createdAt ? formatIsoDateTime(report.createdAt) : "—",
                  )}
                </Text>
                {reporterId ? (
                  <Pressable
                    onPress={() => router.push({ pathname: "/user/[id]", params: { id: reporterId } })}
                  >
                    <Text style={styles.link}>{PRODUCT_REPORTS_PAGE_UI.OPEN_REPORTER}</Text>
                  </Pressable>
                ) : null}
              </View>
              <Text style={styles.reportText}>{report.reportText}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.staffLabel}>
        <Text>{PRODUCT_REPORTS_PAGE_UI.STAFF_NOTE_LABEL}</Text>
        <TextInput
          style={styles.staffInput}
          value={staffNote}
          multiline
          numberOfLines={2}
          editable={!isBusy}
          placeholder={PRODUCT_REPORTS_PAGE_UI.STAFF_NOTE_PLACEHOLDER}
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
            void handleResolve(PRODUCT_REPORT_RESOLUTION_DISMISS);
          }}
        >
          <Text style={styles.actionButtonText}>
            {isBusy ? PRODUCT_REPORTS_PAGE_UI.ACTION_PENDING : PRODUCT_REPORTS_PAGE_UI.ACTION_DISMISS}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, isBusy && styles.actionButtonDisabled]}
          disabled={isBusy}
          onPress={() => {
            void handleResolve(PRODUCT_REPORT_RESOLUTION_HIDE);
          }}
        >
          <Text style={styles.actionButtonText}>{PRODUCT_REPORTS_PAGE_UI.ACTION_HIDE}</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.actionButtonDanger, isBusy && styles.actionButtonDisabled]}
          disabled={isBusy}
          onPress={() => {
            void handleResolve(PRODUCT_REPORT_RESOLUTION_REJECT);
          }}
        >
          <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>
            {PRODUCT_REPORTS_PAGE_UI.ACTION_REJECT}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
