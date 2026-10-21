import { View } from "react-native";

import { resolveProductCardCatalogGridTotalHeight } from "@/entities/product/lib/productCardMobileCatalogLayout";
import { SkeletonShimmer } from "@/shared/ui/SkeletonShimmer";
import { useHomeFeedSkeletonStyles } from "@/shared/theme/homeFeedSkeletonStyles";

import { catalogGridRowStyles } from "../lib/catalogGridLayout";

type CatalogGridSkeletonProps = {
  columns: number;
  tileWidth: number;
  gap: number;
  rows?: number;
  /** Главный экран: под карточками кнопка — скелетон рисует место под неё. */
  withActionButton?: boolean;
};

/**
 * Плейсхолдер сетки каталога на время первой загрузки товаров.
 * Плитки повторяют габариты ProductCard layout="catalog-grid"
 * (квадратное фото + фиксированный текстовый стек), чтобы приход
 * данных не сдвигал вёрстку.
 */
export const CatalogGridSkeleton = ({
  columns,
  tileWidth,
  gap,
  rows = 3,
  withActionButton = false,
}: CatalogGridSkeletonProps) => {
  const styles = useHomeFeedSkeletonStyles();

  return (
    <SkeletonShimmer>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <View key={rowIndex} style={[catalogGridRowStyles.row, { gap }]}>
          {Array.from({ length: columns }, (_, columnIndex) => (
            <View key={columnIndex} style={{ width: tileWidth }}>
              <View
                style={[
                  styles.catalogTile,
                  {
                    minHeight: resolveProductCardCatalogGridTotalHeight(
                      tileWidth,
                      undefined,
                      {
                        withAction: withActionButton,
                      },
                    ),
                  },
                ]}
              >
                <View style={styles.catalogTileImage} />
                <View style={styles.catalogTileContent}>
                  <View style={styles.catalogTileLine} />
                  <View style={[styles.catalogTileLine, styles.catalogTileLineShort]} />
                </View>
                {withActionButton ? <View style={styles.catalogTileAction} /> : null}
              </View>
            </View>
          ))}
        </View>
      ))}
    </SkeletonShimmer>
  );
};
