import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Text, View } from "react-native";

import { PRODUCT_QUESTION_TEXT_MAX_LENGTH } from "@molha/api-contract";

import { useProductQuestionMutations } from "@/entities/product-qa/model/useProductQuestionMutations";
import { useProductQuestionsQuery } from "@/entities/product-qa/model/useProductQuestionsQuery";
import { ProductQuestionComposer } from "@/entities/product-qa/ui/ProductQuestionComposer";
import { ProductQuestionListItem } from "@/entities/product-qa/ui/ProductQuestionListItem";
import { PRODUCT_QA_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useProductDetailTabStyles } from "@/shared/theme/catalogProductStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

type ProductQaTabProps = {
  productId: string;
  isAuthorized: boolean;
  isOwnProduct: boolean;
};

export const ProductQaTab = ({
  productId,
  isAuthorized,
  isOwnProduct,
}: ProductQaTabProps) => {
  const router = useRouter();
  const styles = useProductDetailTabStyles();
  const {
    summaryQuery,
    questions,
    totalPages,
    currentPage,
    isLoading,
    isLoadingMore,
    isError,
    error,
    questionsQuery,
  } = useProductQuestionsQuery({ productId });
  const { askMutation, answerMutation, deleteMutation, hideMutation } =
    useProductQuestionMutations(productId);
  const [askError, setAskError] = useState("");
  const [answerError, setAnswerError] = useState("");

  if (isLoading) {
    return <ScreenLoadingState message={PRODUCT_QA_UI.LOADING} />;
  }

  if (isError && !summaryQuery.data) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(error, PRODUCT_QA_UI.FETCH_SUMMARY_FALLBACK)}
        onRetry={() => {
          void summaryQuery.refetch();
          void questionsQuery.refetch();
        }}
      />
    );
  }

  const summary = summaryQuery.data ?? null;
  const isActionPending = hideMutation.isPending || deleteMutation.isPending;

  const handleAsk = async (text: string) => {
    setAskError("");
    try {
      await askMutation.mutateAsync({ text });
    } catch (e) {
      setAskError(e instanceof Error ? e.message : PRODUCT_QA_UI.ASK_SUBMIT);
    }
  };

  const handleAnswer = async (questionId: string, text: string) => {
    setAnswerError("");
    try {
      await answerMutation.mutateAsync({ questionId, text });
    } catch (e) {
      setAnswerError(e instanceof Error ? e.message : PRODUCT_QA_UI.ANSWER_SUBMIT);
      throw e;
    }
  };

  const renderComposer = () => {
    if (isOwnProduct) return null;
    if (!isAuthorized) {
      return (
        <AppButton
          label={PRODUCT_QA_UI.LOGIN_TO_ASK}
          variant="primary"
          onPress={() => router.push("/(auth)/login")}
        />
      );
    }
    if (summary && !summary.canAsk) {
      if (summary.remaining <= 0) {
        return <Text style={styles.hint}>{PRODUCT_QA_UI.LIMIT_REACHED}</Text>;
      }
      return null;
    }
    return (
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{PRODUCT_QA_UI.ASK_TITLE}</Text>
        <ProductQuestionComposer
          placeholder={PRODUCT_QA_UI.ASK_PLACEHOLDER}
          submitLabel={PRODUCT_QA_UI.ASK_SUBMIT}
          maxLength={PRODUCT_QUESTION_TEXT_MAX_LENGTH}
          onSubmit={handleAsk}
          isBusy={askMutation.isPending}
          errorMessage={askError}
        />
      </View>
    );
  };

  const emptyLabel = isOwnProduct
    ? PRODUCT_QA_UI.EMPTY_STATE_SELLER
    : PRODUCT_QA_UI.EMPTY_STATE;

  return (
    <View style={styles.root}>
      {summary?.isSeller ? (
        <View style={styles.qaSummary}>
          <Text style={styles.itemMeta}>
            {PRODUCT_QA_UI.SLOTS_LEFT(summary.activeCount, summary.limit)}
          </Text>
          {summary.pendingCount > 0 ? (
            <View style={styles.qaBadge}>
              <Text style={styles.qaBadgeText}>
                {PRODUCT_QA_UI.PENDING_BADGE}: {summary.pendingCount}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {renderComposer()}

      {questions.length === 0 ? (
        <Text style={styles.empty}>{emptyLabel}</Text>
      ) : (
        <FlatList
          data={questions}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ProductQuestionListItem
              question={item}
              isSeller={isOwnProduct}
              onAnswer={handleAnswer}
              onHide={(questionId) => hideMutation.mutate(questionId)}
              onDelete={(questionId) => deleteMutation.mutate(questionId)}
              isAnswerPending={answerMutation.isPending}
              isActionPending={isActionPending}
              answerError={answerError}
            />
          )}
        />
      )}

      {currentPage < totalPages ? (
        <AppButton
          label={isLoadingMore ? PRODUCT_QA_UI.LOADING : PRODUCT_QA_UI.LOAD_MORE}
          variant="outline"
          onPress={() => void questionsQuery.fetchNextPage()}
          disabled={isLoadingMore}
        />
      ) : null}
    </View>
  );
};
