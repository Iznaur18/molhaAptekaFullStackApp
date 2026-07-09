import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { useMyFavoritesQuery } from "@/entities/wishlist/model/useMyFavoritesQuery";
import { useWishlist } from "@/entities/wishlist/model/WishlistProvider";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { WishlistRow } from "@/features/wishlist-page/ui/WishlistRow";
import { MY_PROFILE_PAGE_UI, WISHLIST_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useWishlistPageStyles } from "@/shared/theme/wishlistPageStyles";
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
  const styles = useWishlistPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const isAuthorized = useIsAuthorized();
  const favoritesQuery = useMyFavoritesQuery({ enabled: isAuthorized });
  const { items } = useWishlist();
  const [navSheetVisible, setNavSheetVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void favoritesQuery.refetch();
      }
    }, [isAuthorized, favoritesQuery.refetch]),
  );

  const products = useMemo(() => {
    const fromApi = (favoritesQuery.data?.products ?? []) as WishlistProduct[];
    const byId = new Map(fromApi.map((product) => [String(product._id), product]));
    return Object.entries(items)
      .sort(([, a], [, b]) => b - a)
      .map(([productId]) => byId.get(productId))
      .filter((product): product is WishlistProduct => Boolean(product));
  }, [favoritesQuery.data?.products, items]);

  const handleOpenProduct = useCallback(
    (product: WishlistProduct) => {
      router.push({ pathname: "/product/[id]", params: { id: product._id } });
    },
    [router],
  );

  const listHeader = (
    <View style={styles.header}>
      <ProfileMobileSectionToggle
        activeLabel={MY_PROFILE_PAGE_UI.TAB_WISHLIST}
        onPress={() => setNavSheetVisible(true)}
      />
    </View>
  );

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>{WISHLIST_PAGE_UI.LOGIN_HINT}</Text>
        <Pressable style={styles.loginButton} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.loginButtonText}>{WISHLIST_PAGE_UI.LOGIN_BUTTON}</Text>
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
      <>
        <View style={[styles.container, centeredContentStyle, styles.emptyRoot]}>
          {listHeader}
          <View style={styles.emptyBody}>
            <Text style={styles.state}>{WISHLIST_PAGE_UI.EMPTY}</Text>
          </View>
        </View>
        <ProfileMobileNavSheet
          visible={navSheetVisible}
          activeSectionId="wishlist"
          onClose={() => setNavSheetVisible(false)}
          onOverviewPress={() => router.replace("/(tabs)/profile")}
        />
      </>
    );
  }

  return (
    <>
      <FlatList
        style={[styles.container, centeredContentStyle]}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: contentPaddingBottom },
        ]}
        data={products}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={listHeader}
        renderItem={({ item }) => (
          <WishlistRow product={item} onProductPress={handleOpenProduct} />
        )}
      />

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="wishlist"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/profile")}
      />
    </>
  );
};
