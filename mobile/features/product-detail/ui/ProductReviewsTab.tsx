import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";

import {
  useProductReviewSummaryQuery,
  useProductReviewsPageQuery,
} from "@/entities/product-review/model/useProductReviewsQuery";
import { useSubmitProductReviewMutation } from "@/entities/product-review/model/useSubmitProductReviewMutation";
import { ProductReviewListItem } from "@/entities/product-review/ui/ProductReviewListItem";
import { ProductReviewSummary } from "@/entities/product-review/ui/ProductReviewSummary";
import { PRODUCT_REVIEW_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { textInputFocusScrollProps } from "@/shared/lib/scrollTextInputIntoViewOnFocus";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductDetailTabStyles } from "@/shared/theme/catalogProductStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

type ProductReviewsTabProps = {
  productId: string;
  isAuthorized: boolean;
  isUserDataConfirmed: boolean;
  isOwnProduct: boolean;
};

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

export const ProductReviewsTab = ({
  productId,
  isAuthorized,
  isUserDataConfirmed,
  isOwnProduct,
}: ProductReviewsTabProps) => {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useProductDetailTabStyles();
  const summaryQuery = useProductReviewSummaryQuery(productId);
  const reviewsQuery = useProductReviewsPageQuery(productId);
  const submitMutation = useSubmitProductReviewMutation(productId);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (summaryQuery.isPending || reviewsQuery.isPending) {
    return <ScreenLoadingState message={PRODUCT_REVIEW_UI.LOADING} />;
  }

  if (summaryQuery.isError || reviewsQuery.isError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(
          summaryQuery.error ?? reviewsQuery.error,
          PRODUCT_REVIEW_UI.FETCH_FALLBACK,
        )}
        onRetry={() => {
          void summaryQuery.refetch();
          void reviewsQuery.refetch();
        }}
      />
    );
  }

  const summary = summaryQuery.data;
  const allReviews = reviewsQuery.data?.reviews ?? [];
  const myReview = summary.myReview ?? null;
  const otherReviews = myReview
    ? allReviews.filter((r) => r._id !== myReview._id)
    : allReviews;

  const handleSubmit = async () => {
    if (rating < 1) return;
    setErrorMessage("");
    try {
      await submitMutation.mutateAsync({ rating, text: text.trim() || undefined });
      setText("");
      setRating(0);
      void summaryQuery.refetch();
      void reviewsQuery.refetch();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : PRODUCT_REVIEW_UI.SUBMIT);
    }
  };

  const renderComposer = () => {
    if (isOwnProduct || myReview) return null;
    if (!isAuthorized) {
      return (
        <AppButton
          label={PRODUCT_REVIEW_UI.LOGIN_TO_REVIEW}
          variant="primary"
          onPress={() => router.push("/(auth)/login")}
        />
      );
    }
    if (!isUserDataConfirmed) {
      return <Text style={styles.hint}>{PRODUCT_REVIEW_UI.CONFIRMED_DATA_REQUIRED}</Text>;
    }
    if (!summary.canReview) {
      return <Text style={styles.hint}>{PRODUCT_REVIEW_UI.NOT_DELIVERED}</Text>;
    }

    return (
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{PRODUCT_REVIEW_UI.LEAVE_REVIEW}</Text>
        <Text style={styles.label}>{PRODUCT_REVIEW_UI.LABEL_RATING}</Text>
        <View style={styles.stars}>
          {STAR_VALUES.map((value) => (
            <Pressable key={value} onPress={() => setRating(value)}>
              <Text style={[styles.star, value <= rating && styles.starActive]}>★</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>{PRODUCT_REVIEW_UI.LABEL_TEXT}</Text>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={PRODUCT_REVIEW_UI.TEXT_PLACEHOLDER}
          placeholderTextColor={theme.colors.textMuted}
          multiline
          {...textInputFocusScrollProps}
        />
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        <AppButton
          label={PRODUCT_REVIEW_UI.SUBMIT}
          variant="contrast"
          onPress={() => void handleSubmit()}
          disabled={rating < 1 || submitMutation.isPending}
        />
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <ProductReviewSummary
        averageRating={summary.averageRating}
        reviewCount={summary.reviewCount}
      />

      {myReview ? (
        <>
          <Text style={styles.subheading}>{PRODUCT_REVIEW_UI.YOUR_REVIEW}</Text>
          <ProductReviewListItem review={myReview} />
        </>
      ) : null}

      {renderComposer()}

      {otherReviews.length === 0 && !myReview ? (
        <Text style={styles.empty}>{PRODUCT_REVIEW_UI.EMPTY}</Text>
      ) : otherReviews.length > 0 ? (
        <FlatList
          data={otherReviews}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <ProductReviewListItem review={item} />}
        />
      ) : null}
    </View>
  );
};
