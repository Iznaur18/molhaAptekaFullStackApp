import { useRouter } from "expo-router";
import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { resolveProductImageUrl } from "@/entities/product/lib/resolveProductImageUrl";
import { useMyFavoritesQuery } from "@/entities/wishlist/model/useMyFavoritesQuery";
import { useWishlist } from "@/entities/wishlist/model/WishlistProvider";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { AUTH_UI, WISHLIST_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage, formatPriceRub } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

type WishlistProduct = {
  _id: string;
  productName?: string;
  productPrice?: number;
  productImageUrls?: unknown;
  productImageUrl?: unknown;
};

export const WishlistPage = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const isAuthorized = useIsAuthorized();
  const favoritesQuery = useMyFavoritesQuery({ enabled: isAuthorized });
  const { items, removeItem } = useWishlist();

  const products = useMemo(() => {
    const fromApi = (favoritesQuery.data?.products ?? []) as WishlistProduct[];
    const byId = new Map(fromApi.map((product) => [String(product._id), product]));
    return Object.entries(items)
      .sort(([, a], [, b]) => b - a)
      .map(([productId]) => byId.get(productId))
      .filter((product): product is WishlistProduct => Boolean(product));
  }, [favoritesQuery.data?.products, items]);

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
          {WISHLIST_PAGE_UI.LOGIN_HINT}
        </Text>
        <Pressable
          style={[styles.button, { backgroundColor: theme.colors.nearBlack }]}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.buttonText}>{WISHLIST_PAGE_UI.LOGIN_BUTTON}</Text>
        </Pressable>
      </View>
    );
  }

  if (favoritesQuery.isPending) {
    return <ScreenLoadingState message={WISHLIST_PAGE_UI.LOADING} />;
  }

  if (favoritesQuery.isError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(
          favoritesQuery.error,
          WISHLIST_PAGE_UI.FETCH_FALLBACK,
        )}
        onRetry={() => favoritesQuery.refetch()}
      />
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
          {WISHLIST_PAGE_UI.EMPTY}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const title = item.productName?.trim() || "Без названия";
        const imageUrl = resolveProductImageUrl(item);

        return (
          <View style={[styles.row, { borderColor: theme.colors.border }]}>
            <Pressable
              style={styles.rowMain}
              onPress={() => router.push({ pathname: "/product/[id]", params: { id: item._id } })}
            >
              <CachedProductImage uri={imageUrl} style={styles.image} />
              <View style={styles.info}>
                <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>
                  {title}
                </Text>
                <Text style={[styles.price, { color: theme.colors.text }]}>
                  {formatPriceRub(item.productPrice)}
                </Text>
              </View>
            </Pressable>
            <Pressable
              style={styles.remove}
              onPress={() => removeItem(item._id)}
              accessibilityLabel={WISHLIST_PAGE_UI.REMOVE_ARIA(title)}
            >
              <Text style={styles.removeText}>×</Text>
            </Pressable>
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
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
  list: {
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: "#f4f4f4",
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
  },
  remove: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  removeText: {
    fontSize: 24,
    color: "#999",
    lineHeight: 24,
  },
});
