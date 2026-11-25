import { Pressable, ScrollView, Text, View } from "react-native";

import { HOME_PAGE_UI } from "@/shared/config/homePageUi";
import { useCatalogBreadcrumbStyles } from "@/shared/theme/catalogProductStyles";

export type CatalogBreadcrumbItem = {
  labelRu: string;
  categoryId?: string;
  slug?: string;
};

/** Web `.catalog-categories-browser__toolbar` → `margin-bottom: 1rem`. */
export const CATALOG_BROWSER_TOOLBAR_MARGIN_BOTTOM = 16;

type CatalogBreadcrumbProps = {
  label: string | null;
  /**
   * `trail` — web `CatalogBrowserBreadcrumb` (Каталог › …).
   * `display` — крупный display-title («Главная»).
   */
  variant?: "trail" | "display";
  compactTop?: boolean;
  items?: CatalogBreadcrumbItem[] | null;
  onCatalogRootPress?: () => void;
  onItemPress?: (item: CatalogBreadcrumbItem, index: number) => void;
  /**
   * Переопределение `toolbar.marginBottom`. На category FlatList передаём
   * `16 - gridGap`, чтобы вместе с `contentContainerStyle.gap` вышло как web 1rem.
   */
  toolbarMarginBottom?: number;
};

const buildSegments = (
  items: CatalogBreadcrumbItem[] | null | undefined,
  label: string | null,
): CatalogBreadcrumbItem[] => {
  if (Array.isArray(items) && items.length > 0) {
    return items;
  }
  return String(label ?? "")
    .split(" › ")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((labelRu) => ({ labelRu }));
};

export const CatalogBreadcrumb = ({
  label,
  variant = "trail",
  compactTop = false,
  items = null,
  onCatalogRootPress,
  onItemPress,
  toolbarMarginBottom,
}: CatalogBreadcrumbProps) => {
  const styles = useCatalogBreadcrumbStyles();

  if (variant === "display") {
    if (!label) {
      return null;
    }
    return (
      <View
        style={[styles.displayToolbar, compactTop && styles.displayToolbarCompactTop]}
      >
        <Text
          style={[styles.displayTitle, compactTop && styles.displayTitleCompactTop]}
          accessibilityRole="header"
          accessibilityLabel={`${HOME_PAGE_UI.BREADCRUMB_CATALOG}: ${label}`}
        >
          {label}
        </Text>
      </View>
    );
  }

  const segments = buildSegments(items, label);
  if (segments.length === 0) {
    return null;
  }

  const currentLabel = segments[segments.length - 1]?.labelRu ?? label ?? "";
  const toolbarStyle =
    typeof toolbarMarginBottom === "number"
      ? [styles.toolbar, { marginBottom: toolbarMarginBottom }]
      : styles.toolbar;

  return (
    <View style={toolbarStyle}>
      <View
        style={styles.nav}
        accessibilityLabel={`${HOME_PAGE_UI.BREADCRUMB_CATALOG}: ${currentLabel}`}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          <View style={styles.node}>
            {onCatalogRootPress ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={HOME_PAGE_UI.BREADCRUMB_CATALOG}
                onPress={onCatalogRootPress}
                style={({ pressed }) => [
                  styles.root,
                  pressed ? styles.rootPressed : null,
                ]}
              >
                <Text style={styles.rootText}>{HOME_PAGE_UI.BREADCRUMB_CATALOG}</Text>
              </Pressable>
            ) : (
              <Text style={[styles.rootText, styles.rootStatic]}>
                {HOME_PAGE_UI.BREADCRUMB_CATALOG}
              </Text>
            )}
          </View>

          {segments.map((segment, index) => {
            const isCurrent = index === segments.length - 1;
            const segmentLabel = String(segment.labelRu ?? "").trim();
            const canNavigate = !isCurrent && typeof onItemPress === "function";
            const key = `${segment.categoryId ?? segment.slug ?? index}:${segmentLabel}`;

            return (
              <View key={key} style={styles.node}>
                <Text style={styles.sep} accessibilityElementsHidden>
                  ›
                </Text>
                {isCurrent ? (
                  <Text style={styles.current} accessibilityState={{ selected: true }}>
                    {segmentLabel}
                  </Text>
                ) : canNavigate ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => onItemPress(segment, index)}
                    style={({ pressed }) => [
                      styles.itemButton,
                      pressed ? styles.itemButtonPressed : null,
                    ]}
                  >
                    <Text style={styles.itemText} numberOfLines={1}>
                      {segmentLabel}
                    </Text>
                  </Pressable>
                ) : (
                  <Text style={styles.itemText} numberOfLines={1}>
                    {segmentLabel}
                  </Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};
