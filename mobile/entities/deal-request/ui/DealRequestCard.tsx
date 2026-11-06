import {
  CATEGORY_DEAL_TYPE_SERVICE,
  CATEGORY_DEAL_TYPE_VIEWING,
  DEAL_REQUEST_ACTION_ACCEPT,
  DEAL_REQUEST_ACTION_CANCEL,
  DEAL_REQUEST_ACTION_CONFIRM,
  DEAL_REQUEST_ACTION_DECLINE,
  DEAL_REQUEST_DECLINE_REASON_MAX_LENGTH,
  DEAL_REQUEST_OPEN_STATUSES,
  DEAL_REQUEST_OUTCOME_COMPLETED,
  DEAL_REQUEST_OUTCOMES,
  DEAL_REQUEST_ROLE_SELLER,
  DEAL_REQUEST_STATUS_COMPLETED,
  DEAL_REQUEST_STATUS_LABELS_RU,
  isDealRequestContactOpen,
} from "@molha/api-contract";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Linking, Text, TextInput, View } from "react-native";

import { DEAL_REQUESTS_PAGE_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { reportClientIssue } from "@/shared/lib/reportClientIssue";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useDealRequestsPageStyles } from "@/shared/theme/dealRequestStyles";
import { AppButton, type AppButtonVariant } from "@/shared/ui/AppButton";

import type { DealRequest } from "../api/dealRequestApi";
import {
  dealRequestTimePartsToIso,
  formatDealRequestTime,
  isDealRequestTimeInPast,
  toDealRequestTimeParts,
} from "../lib/dealRequestTime";
import { DealRequestTimePicker } from "./DealRequestTimePicker";

const STATUS_LABELS = DEAL_REQUEST_STATUS_LABELS_RU as Record<string, string>;
const OUTCOMES = DEAL_REQUEST_OUTCOMES as readonly string[];
const OPEN_STATUSES = DEAL_REQUEST_OPEN_STATUSES as readonly string[];

const actionLabel = (action: string, kind: string): string => {
  const label = DEAL_REQUESTS_PAGE_UI.ACTION[action];
  if (label == null) {
    return action;
  }
  return typeof label === "string" ? label : (label[kind] ?? action);
};

/** Цвет кнопки — как `actionButtonClass` в web `DealRequestCard`. */
const actionButtonVariant = (action: string): AppButtonVariant => {
  if (action === DEAL_REQUEST_ACTION_ACCEPT || action === DEAL_REQUEST_ACTION_CONFIRM) {
    return "primary";
  }
  if (action === DEAL_REQUEST_OUTCOME_COMPLETED) {
    return "success";
  }
  if (action === DEAL_REQUEST_ACTION_DECLINE || action === DEAL_REQUEST_ACTION_CANCEL) {
    return "danger";
  }
  return "secondary";
};

const parsePriceRub = (raw: string): number =>
  Math.floor(Number(raw.replace(/\s/g, "")));

type FactProps = { label: string; children: React.ReactNode };

const Fact = ({ label, children }: FactProps) => {
  const styles = useDealRequestsPageStyles();
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
};

type DealRequestCardProps = {
  request: DealRequest;
  isPending: boolean;
  error?: string;
  onAction: (action: string, body?: Record<string, unknown>) => void;
};

/** Карточка заявки — паритет web `DealRequestCard`. */
export const DealRequestCard = ({
  request,
  isPending,
  error = "",
  onAction,
}: DealRequestCardProps) => {
  const styles = useDealRequestsPageStyles();
  const theme = useAppTheme();
  const router = useRouter();
  const [openForm, setOpenForm] = useState<"accept" | "decline" | null>(null);
  const [agreed, setAgreed] = useState(() =>
    toDealRequestTimeParts(new Date(request.agreedAt ?? request.preferredAt)),
  );
  const [priceValue, setPriceValue] = useState(() =>
    request.product.priceRub ? String(request.product.priceRub) : "",
  );
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState("");

  const isSeller = request.role === DEAL_REQUEST_ROLE_SELLER;
  const isService = request.kind === CATEGORY_DEAL_TYPE_SERVICE;
  const isOpen = OPEN_STATUSES.includes(request.status);
  const { phone } = request.counterparty;
  const phoneText =
    phone ??
    (isDealRequestContactOpen(request.status) || (!isSeller && !isService)
      ? DEAL_REQUESTS_PAGE_UI.PHONE_MISSING
      : DEAL_REQUESTS_PAGE_UI.PHONE_LOCKED);

  const openProduct = () => {
    router.push({ pathname: "/product/[id]", params: { id: request.product.id } });
  };

  const openCounterparty = () => {
    router.push({ pathname: "/user/[id]", params: { id: request.counterparty.id } });
  };

  const callPhone = (value: string) => {
    void Linking.openURL(`tel:${value}`).catch((callError: unknown) => {
      reportClientIssue("DealRequestCard", callError);
    });
  };

  const handleAction = (action: string) => {
    setFormError("");
    if (
      action === DEAL_REQUEST_ACTION_ACCEPT ||
      action === DEAL_REQUEST_ACTION_DECLINE
    ) {
      setOpenForm(action);
      return;
    }
    if (OUTCOMES.includes(action)) {
      onAction("outcome", { outcome: action });
      return;
    }
    onAction(action);
  };

  const submitAccept = () => {
    const quotedPriceRub = parsePriceRub(priceValue);
    if (isService && !(quotedPriceRub > 0)) {
      setFormError(DEAL_REQUESTS_PAGE_UI.ACCEPT_PRICE_REQUIRED);
      return;
    }
    const agreedAt = dealRequestTimePartsToIso(agreed);
    if (agreedAt && isDealRequestTimeInPast(agreedAt)) {
      setFormError(DEAL_REQUESTS_PAGE_UI.ACCEPT_TIME_IN_PAST);
      return;
    }
    onAction(DEAL_REQUEST_ACTION_ACCEPT, {
      ...(agreedAt ? { agreedAt } : {}),
      ...(isService ? { quotedPriceRub } : {}),
    });
    setOpenForm(null);
  };

  const submitDecline = () => {
    onAction(DEAL_REQUEST_ACTION_DECLINE, { reason: reason.trim() });
    setOpenForm(null);
  };

  return (
    <View style={[styles.card, !isOpen && styles.cardClosed]}>
      <View style={styles.head}>
        <Text style={styles.kind}>{DEAL_REQUESTS_PAGE_UI.KIND[request.kind]}</Text>
        <View style={styles.status}>
          <Text style={styles.statusText}>
            {STATUS_LABELS[request.status] ?? request.status}
          </Text>
        </View>
      </View>

      <Text style={styles.product} onPress={openProduct} accessibilityRole="link">
        {request.product.name || DEAL_REQUESTS_PAGE_UI.OPEN_PRODUCT}
      </Text>
      {request.product.priceRub != null ? (
        <Text style={styles.price}>{formatPriceRub(request.product.priceRub)}</Text>
      ) : null}

      <View style={styles.facts}>
        <Fact label={DEAL_REQUESTS_PAGE_UI.ROLE_COUNTERPARTY[request.role]}>
          <Text
            style={[styles.factValue, styles.factLink]}
            onPress={openCounterparty}
            accessibilityRole="link"
          >
            {request.counterparty.name}
          </Text>
        </Fact>
        <Fact label={DEAL_REQUESTS_PAGE_UI.LABEL_PHONE}>
          {phone ? (
            <Text
              style={[styles.factValue, styles.factLink]}
              onPress={() => callPhone(phone)}
              accessibilityRole="link"
            >
              {phone}
            </Text>
          ) : (
            <Text style={styles.factValue}>{phoneText}</Text>
          )}
        </Fact>
        <Fact
          label={
            request.agreedAt
              ? DEAL_REQUESTS_PAGE_UI.LABEL_AGREED
              : DEAL_REQUESTS_PAGE_UI.LABEL_PREFERRED
          }
        >
          <Text style={styles.factValue}>
            {formatDealRequestTime(request.agreedAt ?? request.preferredAt)}
          </Text>
        </Fact>
        {request.quotedPriceRub != null ? (
          <Fact label={DEAL_REQUESTS_PAGE_UI.LABEL_PRICE}>
            <Text style={styles.factValue}>
              {formatPriceRub(request.quotedPriceRub)}
            </Text>
          </Fact>
        ) : null}
        {request.address ? (
          <Fact label={DEAL_REQUESTS_PAGE_UI.LABEL_ADDRESS}>
            <Text style={styles.factValue}>{request.address}</Text>
          </Fact>
        ) : null}
        {request.comment ? (
          <Fact label={DEAL_REQUESTS_PAGE_UI.LABEL_COMMENT}>
            <Text style={styles.factValue}>{request.comment}</Text>
          </Fact>
        ) : null}
        {request.declineReason ? (
          <Fact label={DEAL_REQUESTS_PAGE_UI.LABEL_DECLINE_REASON}>
            <Text style={styles.factValue}>{request.declineReason}</Text>
          </Fact>
        ) : null}
      </View>

      {request.expiresAt ? (
        <Text style={styles.hint}>
          {(isSeller
            ? DEAL_REQUESTS_PAGE_UI.EXPIRES
            : DEAL_REQUESTS_PAGE_UI.EXPIRES_BUYER)(
            formatDealRequestTime(request.expiresAt),
          )}
        </Text>
      ) : null}

      {openForm === DEAL_REQUEST_ACTION_ACCEPT ? (
        <View style={styles.form}>
          <Text style={styles.formTitle}>{DEAL_REQUESTS_PAGE_UI.ACCEPT_TITLE}</Text>
          <Text style={styles.hint}>{DEAL_REQUESTS_PAGE_UI.ACCEPT_TIME}</Text>
          <DealRequestTimePicker value={agreed} onChange={setAgreed} />
          {isService ? (
            <View style={{ gap: 6 }}>
              <Text style={styles.fieldLabel}>
                {DEAL_REQUESTS_PAGE_UI.ACCEPT_PRICE}
              </Text>
              <TextInput
                style={styles.input}
                value={priceValue}
                onChangeText={setPriceValue}
                keyboardType="number-pad"
                inputMode="numeric"
              />
            </View>
          ) : null}
          {formError ? (
            <Text style={styles.error} accessibilityRole="alert">
              {formError}
            </Text>
          ) : null}
          <View style={styles.actions}>
            <AppButton
              label={DEAL_REQUESTS_PAGE_UI.ACCEPT_SUBMIT}
              variant="primary"
              onPress={submitAccept}
            />
            <AppButton
              label={DEAL_REQUESTS_PAGE_UI.FORM_CANCEL}
              variant="cancel"
              onPress={() => setOpenForm(null)}
            />
          </View>
        </View>
      ) : null}

      {openForm === DEAL_REQUEST_ACTION_DECLINE ? (
        <View style={styles.form}>
          <Text style={styles.fieldLabel}>{DEAL_REQUESTS_PAGE_UI.DECLINE_TITLE}</Text>
          <TextInput
            style={styles.input}
            value={reason}
            onChangeText={setReason}
            maxLength={DEAL_REQUEST_DECLINE_REASON_MAX_LENGTH}
            placeholder={DEAL_REQUESTS_PAGE_UI.DECLINE_REASON_PLACEHOLDER}
            placeholderTextColor={theme.colors.textMuted}
          />
          <View style={styles.actions}>
            <AppButton
              label={DEAL_REQUESTS_PAGE_UI.DECLINE_SUBMIT}
              variant="danger"
              onPress={submitDecline}
            />
            <AppButton
              label={DEAL_REQUESTS_PAGE_UI.FORM_CANCEL}
              variant="cancel"
              onPress={() => setOpenForm(null)}
            />
          </View>
        </View>
      ) : null}

      {openForm === null && request.actions.length > 0 ? (
        <>
          <View style={styles.actions}>
            {request.actions.map((action) => (
              <AppButton
                key={action}
                label={actionLabel(action, request.kind)}
                variant={actionButtonVariant(action)}
                disabled={isPending}
                onPress={() => handleAction(action)}
              />
            ))}
          </View>
          {request.kind === CATEGORY_DEAL_TYPE_VIEWING &&
          request.actions.includes(DEAL_REQUEST_OUTCOME_COMPLETED) ? (
            <Text style={styles.hint}>
              {DEAL_REQUESTS_PAGE_UI.COMPLETED_VIEWING_HINT}
            </Text>
          ) : null}
        </>
      ) : null}

      {!isSeller && request.status === DEAL_REQUEST_STATUS_COMPLETED ? (
        <View style={styles.actions}>
          <AppButton
            label={DEAL_REQUESTS_PAGE_UI.LEAVE_REVIEW}
            variant="secondary"
            onPress={openProduct}
          />
        </View>
      ) : null}

      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
};
