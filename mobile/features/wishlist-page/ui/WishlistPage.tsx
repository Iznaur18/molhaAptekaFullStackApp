import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useMyFavoritesQuery } from "@/entities/wishlist/model/useMyFavoritesQuery";
import { useWishlist } from "@/entities/wishlist/model/WishlistProvider";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useProfileAccountNestedListScroll } from "@/features/profile-tab/model/ProfileAccountScrollContext";
import { ProfileAccountList } from "@/features/profile-tab/ui/ProfileAccountList";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { WishlistRow } from "@/features/wishlist-page/ui/WishlistRow";
import { MY_PROFILE_PAGE_UI, WISHLIST_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { pluralizeRu } from "@/shared/lib/pluralizeRu";
import { useProfileAdaptiveLayout } from "@/shared/model/useProfileAdaptiveLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
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
  const theme = useAppTheme();
  const styles = useWishlistPageStyles();
  const { isDrawerLayout } = useProfileAdaptiveLayout();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const { outerScrollOwns, scrollEnabled } = useProfileAccountNestedListScroll();
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

      <View
        style={styles.heroCard}
        accessibilityLabel={`${WISHLIST_PAGE_UI.HERO_CAPTION}: ${products.length} ${pluralizeRu(products.length, WISHLIST_PAGE_UI.HERO_UNIT_FORMS)}`}
      >
        <View style={styles.heroTextBlock}>
          <Text style={styles.heroCaption}>{WISHLIST_PAGE_UI.HERO_CAPTION}</Text>
          <View style={styles.heroRow}>
            <Text style={styles.heroValue}>{products.length}</Text>
            <Text style={styles.heroUnit}>
              {pluralizeRu(products.length, WISHLIST_PAGE_UI.HERO_UNIT_FORMS)}
            </Text>
          </View>
          <Text style={styles.heroInfo}>{WISHLIST_PAGE_UI.HERO_INFO}</Text>
        </View>
        <View style={styles.heroIconWrap}>
          <Feather
            name="heart"
            size={24}
            color={theme.colors.onContrast}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        </View>
      </View>
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
        <View
          style={[
            styles.container,
            centeredContentStyle,
            styles.emptyRoot,
            !isDrawerLayout ? styles.emptyInAccountShell : null,
          ]}
        >
          {listHeader}
          <View style={styles.emptyBody}>
            <Text style={styles.state}>{WISHLIST_PAGE_UI.EMPTY}</Text>
          </View>
        </View>
        <ProfileMobileNavSheet
          visible={navSheetVisible}
          activeSectionId="wishlist"
          onClose={() => setNavSheetVisible(false)}
          onOverviewPress={() => router.replace("/(tabs)/me")}
        />
      </>
    );
  }

  return (
    <>
      <ProfileAccountList
        data={products}
        keyExtractor={(item) => item._id}
        style={[styles.container, scrollEnabled ? centeredContentStyle : null]}
        contentContainerStyle={[
          styles.listContent,
          !isDrawerLayout ? styles.listInAccountShell : null,
          { paddingBottom: outerScrollOwns ? 0 : contentPaddingBottom },
        ]}
        ListHeaderComponent={listHeader}
        renderItem={({ item, index }) => (
          <View style={index === 0 ? null : styles.listItem}>
            <WishlistRow product={item} onProductPress={handleOpenProduct} />
          </View>
        )}
      />

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="wishlist"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/me")}
      />
    </>
  );
};
