import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  useProductReviewSummaryQuery,
  useProductReviewsPageQuery,
} from "@/entities/product-review/model/useProductReviewsQuery";
import { useSubmitProductReviewMutation } from "@/entities/product-review/model/useSubmitProductReviewMutation";
import { PRODUCT_REVIEW_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
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
  const reviews = reviewsQuery.data?.reviews ?? [];

  const handleSubmit = async () => {
    if (rating < 1) {
      return;
    }
    setErrorMessage("");
    try {
      await submitMutation.mutateAsync({ rating, text: text.trim() || undefined });
      setText("");
      setRating(0);
      void summaryQuery.refetch();
      void reviewsQuery.refetch();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : PRODUCT_REVIEW_UI.SUBMIT,
      );
    }
  };

  const renderComposer = () => {
    if (isOwnProduct) {
      return null;
    }
    if (!isAuthorized) {
      return (
        <Pressable style={styles.loginButton} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.loginButtonText}>{PRODUCT_REVIEW_UI.LOGIN_TO_REVIEW}</Text>
        </Pressable>
      );
    }
    if (!isUserDataConfirmed) {
      return <Text style={styles.hint}>{PRODUCT_REVIEW_UI.CONFIRMED_DATA_REQUIRED}</Text>;
    }
    if (summary.myReview) {
      return null;
    }
    if (!summary.canReview) {
      return <Text style={styles.hint}>{PRODUCT_REVIEW_UI.NOT_DELIVERED}</Text>;
    }

    return (
      <View style={styles.composer}>
        <Text style={styles.composerTitle}>{PRODUCT_REVIEW_UI.LEAVE_REVIEW}</Text>
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
          style={styles.textArea}
          value={text}
          onChangeText={setText}
          placeholder={PRODUCT_REVIEW_UI.TEXT_PLACEHOLDER}
          multiline
        />
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        <Pressable
          style={[styles.submitButton, (rating < 1 || submitMutation.isPending) && styles.disabled]}
          onPress={() => {
            void handleSubmit();
          }}
          disabled={rating < 1 || submitMutation.isPending}
        >
          {submitMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>{PRODUCT_REVIEW_UI.SUBMIT}</Text>
          )}
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <Text style={styles.summary}>
        {PRODUCT_REVIEW_UI.SUMMARY_LINE(summary.averageRating, summary.reviewCount)}
      </Text>
      {renderComposer()}
      {reviews.length === 0 ? (
        <Text style={styles.empty}>{PRODUCT_REVIEW_UI.EMPTY}</Text>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.rating}>★ {item.rating}</Text>
              {item.authorUserName ? (
                <Text style={styles.author}>{item.authorUserName}</Text>
              ) : null}
              {item.text ? <Text style={styles.text}>{item.text}</Text> : null}
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    gap: 12,
    paddingTop: 8,
  },
  summary: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  composer: {
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
  },
  composerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  stars: {
    flexDirection: "row",
    gap: 8,
  },
  star: {
    fontSize: 28,
    color: "#ccc",
  },
  starActive: {
    color: "#f5a623",
  },
  textArea: {
    minHeight: 80,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    textAlignVertical: "top",
    backgroundColor: "#fff",
  },
  submitButton: {
    alignSelf: "flex-start",
    backgroundColor: "#111",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 40,
    justifyContent: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.6,
  },
  hint: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  loginButton: {
    alignSelf: "flex-start",
    backgroundColor: "#111",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  error: {
    color: "#c62828",
    fontSize: 13,
  },
  empty: {
    fontSize: 15,
    color: "#666",
  },
  list: {
    gap: 10,
  },
  item: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },
  author: {
    fontSize: 13,
    color: "#666",
  },
  text: {
    fontSize: 14,
    color: "#222",
    lineHeight: 20,
  },
});
