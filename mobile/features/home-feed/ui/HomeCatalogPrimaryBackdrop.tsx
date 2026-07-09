import { StyleSheet, View, useWindowDimensions } from "react-native";

import {
  HOME_CATALOG_PRIMARY_BACKDROP_COLOR,
  resolveHomeCatalogPrimaryBackdropHeight,
} from "@/shared/lib/homeCatalogBackdropLayout";

/**
 * Запас фиолетового над экраном: при оверскролле сверху (pull-to-refresh)
 * контент уезжает вниз, и без запаса над шапкой открывалась бы щель
 * фонового цвета.
 */
const BACKDROP_TOP_BLEED = 600;

/**
 * Фиолетовая шапка ленты — обычный блок в потоке контента (первый ряд
 * FlatList), а не абсолютная подложка позади списка. Скроллится вместе
 * с контентом попиксельно, поэтому не бывает щелей и полос от
 * рассинхрона: ниже шапки фиолетового просто не существует.
 */
export const HomeCatalogPrimaryBackdrop = () => {
  const { height: windowHeight } = useWindowDimensions();
  const height = resolveHomeCatalogPrimaryBackdropHeight(windowHeight);

  return (
    <View
      pointerEvents="none"
      style={[
        styles.hero,
        { height, backgroundColor: HOME_CATALOG_PRIMARY_BACKDROP_COLOR },
      ]}
    >
      <View
        style={[styles.topBleed, { backgroundColor: HOME_CATALOG_PRIMARY_BACKDROP_COLOR }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  hero: {
    width: "100%",
    alignSelf: "stretch",
  },
  topBleed: {
    position: "absolute",
    top: -BACKDROP_TOP_BLEED,
    left: 0,
    right: 0,
    height: BACKDROP_TOP_BLEED,
  },
});
