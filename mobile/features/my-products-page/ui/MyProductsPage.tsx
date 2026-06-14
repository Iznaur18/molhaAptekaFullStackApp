import { useRouter } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ProductCard } from "@/entities/product/ui/ProductCard";
import { useMyProductsInfiniteQuery } from "@/entities/product/model/useMyProductsInfiniteQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { AUTH_UI, MY_PRODUCTS_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

const NUM_COLUMNS = 2;

export const MyProductsPage = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const isAuthorized = useIsAuthorized();
  const productsQuery = useMyProductsInfiniteQuery({ enabled: isAuthorized });

  const handleLoadMore = useCallback(() => {
    if (productsQuery.hasNextPage && !productsQuery.isFetchingNextPage) {
      void productsQuery.fetchNextPage();
    }
  }, [productsQuery]);

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
          {MY_PRODUCTS_PAGE_UI.LOGIN_HINT}
        </Text>
        <Pressable
          style={[styles.button, { backgroundColor: theme.colors.nearBlack }]}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.buttonText}>{MY_PRODUCTS_PAGE_UI.LOGIN_BUTTON}</Text>
        </Pressable>
      </View>
    );
  }

  if (productsQuery.isPending) {
    return <ScreenLoadingState message={MY_PRODUCTS_PAGE_UI.LOADING} />;
  }

  if (productsQuery.isError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(
          productsQuery.error,
          MY_PRODUCTS_PAGE_UI.FETCH_FALLBACK,
        )}
        onRetry={() => productsQuery.refetch()}
      />
    );
  }

  const products = productsQuery.products;

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item._id)}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={productsQuery.isRefetching}
            onRefresh={productsQuery.refetch}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.count, { color: theme.colors.textMuted }]}>
              {MY_PRODUCTS_PAGE_UI.COUNT(productsQuery.total)}
            </Text>
            <Pressable
              style={[styles.createButton, { backgroundColor: theme.colors.nearBlack }]}
              onPress={() => router.push("/create-product")}
            >
              <Text style={styles.createButtonText}>{MY_PRODUCTS_PAGE_UI.CREATE_BUTTON}</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
              {MY_PRODUCTS_PAGE_UI.EMPTY}
            </Text>
            <Pressable
              style={[styles.button, { backgroundColor: theme.colors.nearBlack }]}
              onPress={() => router.push("/create-product")}
            >
              <Text style={styles.buttonText}>{MY_PRODUCTS_PAGE_UI.CREATE_BUTTON}</Text>
            </Pressable>
          </View>
        }
        ListFooterComponent={
          productsQuery.isFetchingNextPage ? (
            <ActivityIndicator style={styles.footerLoader} />
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <ProductCard product={item as Record<string, unknown> & { _id: string }} />
            <View style={styles.cardActions}>
              <Pressable
                style={[styles.cardAction, { borderColor: theme.colors.border }]}
                onPress={() =>
                  router.push({
                    pathname: "/edit-product/[id]",
                    params: { id: String(item._id) },
                  })
                }
              >
                <Text style={[styles.cardActionText, { color: theme.colors.text }]}>
                  {MY_PRODUCTS_PAGE_UI.EDIT_BUTTON}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 10,
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 6,
    paddingBottom: 12,
    gap: 12,
  },
  count: {
    fontSize: 14,
  },
  createButton: {
    alignSelf: "flex-start",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  hint: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footerLoader: {
    marginVertical: 16,
  },
  cardWrap: {
    flex: 1,
    margin: 6,
  },
  cardActions: {
    marginTop: 4,
    paddingHorizontal: 4,
  },
  cardAction: {
    alignSelf: "flex-start",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  cardActionText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
