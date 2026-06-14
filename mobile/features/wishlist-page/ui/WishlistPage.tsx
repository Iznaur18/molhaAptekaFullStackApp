import { useRouter } from "expo-router";
import { useMemo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { resolveProductImageUrl } from "@/entities/product/lib/resolveProductImageUrl";
import { useMyFavoritesQuery } from "@/entities/wishlist/model/useMyFavoritesQuery";
import { useWishlist } from "@/entities/wishlist/model/WishlistProvider";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { WISHLIST_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage, formatPriceRub } from "@/shared/lib";
import { useSimpleProductListStyles } from "@/shared/theme/commerceScreenStyles";
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
  const styles = useSimpleProductListStyles();
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
        <Text style={styles.hint}>{WISHLIST_PAGE_UI.LOGIN_HINT}</Text>
        <Pressable style={styles.button} onPress={() => router.push("/(auth)/login")}>
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
        <Text style={styles.hint}>{WISHLIST_PAGE_UI.EMPTY}</Text>
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
          <View style={styles.row}>
            <Pressable
              style={styles.rowMain}
              onPress={() => router.push({ pathname: "/product/[id]", params: { id: item._id } })}
            >
              <CachedProductImage uri={imageUrl} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>
                  {title}
                </Text>
                <Text style={styles.price}>{formatPriceRub(item.productPrice)}</Text>
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
