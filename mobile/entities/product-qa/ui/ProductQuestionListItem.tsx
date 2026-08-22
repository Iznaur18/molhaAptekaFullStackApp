import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { PRODUCT_ANSWER_TEXT_MAX_LENGTH } from "@molha/api-contract";

import { PRODUCT_QA_UI } from "@/shared/config";
import { confirmDestructiveAction } from "@/shared/lib/confirmDestructiveAction";
import { useProductDetailTabStyles } from "@/shared/theme/catalogProductStyles";
import type { ProductQuestion } from "../api/productQuestionApi";
import { ProductQuestionComposer } from "./ProductQuestionComposer";

type ProductQuestionListItemProps = {
  question: ProductQuestion;
  isSeller?: boolean;
  onAnswer?: (questionId: string, text: string) => Promise<void>;
  onHide?: (questionId: string) => void;
  onDelete?: (questionId: string) => void;
  isAnswerPending?: boolean;
  isActionPending?: boolean;
  answerError?: string;
};

const formatQaDate = (value: string | null | undefined): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const ProductQuestionListItem = ({
  question,
  isSeller = false,
  onAnswer,
  onHide,
  onDelete,
  isAnswerPending = false,
  isActionPending = false,
  answerError = "",
}: ProductQuestionListItemProps) => {
  const styles = useProductDetailTabStyles();
  const [isAnswerOpen, setIsAnswerOpen] = useState(false);

  const isPending = question.status === "pending";
  const answer = question.answer;
  const canAnswer = isSeller && typeof onAnswer === "function";
  const canHide = isSeller && typeof onHide === "function";
  const canDelete = question.canDelete && typeof onDelete === "function";

  const authorName = question.author?.userName?.trim()
    ? question.author.userName.trim()
    : "Пользователь";

  const handleAnswerSubmit = async (text: string) => {
    if (typeof onAnswer !== "function") return;
    await onAnswer(question._id, text);
    setIsAnswerOpen(false);
  };

  const handleDeletePress = () => {
    if (typeof onDelete !== "function") return;
    confirmDestructiveAction({
      title: PRODUCT_QA_UI.DELETE_CONFIRM,
      message: "",
      confirmLabel: PRODUCT_QA_UI.DELETE_ACTION,
      cancelLabel: PRODUCT_QA_UI.ANSWER_CANCEL,
      onConfirm: () => onDelete(question._id),
    });
  };

  return (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemAuthorName} numberOfLines={1}>
          {authorName}
        </Text>
        <View style={styles.qaHeadMeta}>
          {question.createdAt ? (
            <Text style={styles.itemDate}>{formatQaDate(question.createdAt)}</Text>
          ) : null}
          {isPending ? (
            <View style={styles.qaBadge}>
              <Text style={styles.qaBadgeText}>{PRODUCT_QA_UI.PENDING_BADGE}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <Text style={styles.qaQuestion}>{question.text}</Text>

      {answer ? (
        <View style={styles.qaAnswer}>
          <View style={styles.qaAnswerHead}>
            <Text style={styles.qaAnswerLabel}>{PRODUCT_QA_UI.SELLER_ANSWER_LABEL}</Text>
            {answer.answeredAt ? (
              <Text style={styles.itemDate}>{formatQaDate(answer.answeredAt)}</Text>
            ) : null}
          </View>
          <Text style={styles.itemBody}>{answer.text}</Text>
        </View>
      ) : null}

      {isPending && question.isMine && !isSeller ? (
        <Text style={styles.hint}>{PRODUCT_QA_UI.PENDING_HINT}</Text>
      ) : null}

      {(canAnswer || canHide || canDelete) && !isAnswerOpen ? (
        <View style={styles.actions}>
          {canHide ? (
            <Pressable
              style={styles.qaAction}
              disabled={isActionPending}
              onPress={() => onHide?.(question._id)}
            >
              <Text style={styles.qaActionText}>{PRODUCT_QA_UI.HIDE_ACTION}</Text>
            </Pressable>
          ) : null}
          {canDelete ? (
            <Pressable
              style={styles.qaAction}
              disabled={isActionPending}
              onPress={handleDeletePress}
            >
              <Text style={styles.qaActionDangerText}>{PRODUCT_QA_UI.DELETE_ACTION}</Text>
            </Pressable>
          ) : null}
          {canAnswer ? (
            <Pressable
              style={styles.qaAction}
              disabled={isActionPending}
              onPress={() => setIsAnswerOpen(true)}
            >
              <Text style={styles.qaActionPrimaryText}>
                {answer ? PRODUCT_QA_UI.ANSWER_EDIT : PRODUCT_QA_UI.ANSWER_ACTION}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {isAnswerOpen ? (
        <ProductQuestionComposer
          placeholder={PRODUCT_QA_UI.ANSWER_PLACEHOLDER}
          submitLabel={answer ? PRODUCT_QA_UI.ANSWER_SAVE : PRODUCT_QA_UI.ANSWER_SUBMIT}
          maxLength={PRODUCT_ANSWER_TEXT_MAX_LENGTH}
          initialText={answer?.text ?? ""}
          onSubmit={handleAnswerSubmit}
          isBusy={isAnswerPending}
          errorMessage={answerError}
          onCancel={() => setIsAnswerOpen(false)}
        />
      ) : null}
    </View>
  );
};
