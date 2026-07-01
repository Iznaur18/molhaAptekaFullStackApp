import { Text, View } from "react-native";

import {
  CATALOG_SORT_LABEL_RU,
  CATALOG_SORT_OPTIONS_MY_PRODUCTS,
  MY_PRODUCTS_MODERATION_FILTER_LABEL_RU,
  MY_PRODUCTS_MODERATION_FILTER_OPTIONS,
} from "@/entities/product/model/productConstants";
import { formatSellerProductsQuota } from "@/entities/product/lib/sellerProductsLimit";
import { MY_PRODUCTS_PAGE_UI } from "@/shared/config";
import { useListPageFilterBarStyles } from "@/shared/theme/catalogProductStyles";
import { ListPageFilterField } from "@/shared/ui/ListPageFilterField";

type MyProductsCatalogToolbarProps = {
  catalogSort: string;
  onCatalogSortChange: (value: string) => void;
  moderationFilter: string;
  onModerationFilterChange: (value: string) => void;
  myProductsTotal: number | null;
  sellerProductsLimit: number | null;
  isAdmin: boolean;
};

export const MyProductsCatalogToolbar = ({
  catalogSort,
  onCatalogSortChange,
  moderationFilter,
  onModerationFilterChange,
  myProductsTotal,
  sellerProductsLimit,
  isAdmin,
}: MyProductsCatalogToolbarProps) => {
  const styles = useListPageFilterBarStyles();
  const showProductsQuota = sellerProductsLimit != null && !isAdmin;
  const productsQuotaText =
    showProductsQuota && sellerProductsLimit != null
      ? formatSellerProductsQuota(myProductsTotal, sellerProductsLimit)
      : null;

  return (
    <View style={styles.bar}>
      <ListPageFilterField
        label={MY_PRODUCTS_PAGE_UI.SORT_LABEL}
        value={catalogSort}
        options={CATALOG_SORT_OPTIONS_MY_PRODUCTS.map((optionKey) => ({
          value: optionKey,
          label: CATALOG_SORT_LABEL_RU[optionKey] ?? optionKey,
        }))}
        onChange={onCatalogSortChange}
      />
      <ListPageFilterField
        label={MY_PRODUCTS_PAGE_UI.MODERATION_STATUS_FILTER_LABEL}
        value={moderationFilter}
        options={MY_PRODUCTS_MODERATION_FILTER_OPTIONS.map((filterKey) => ({
          value: filterKey,
          label: MY_PRODUCTS_MODERATION_FILTER_LABEL_RU[filterKey] ?? filterKey,
        }))}
        onChange={onModerationFilterChange}
      />
      {productsQuotaText ? (
        <Text
          style={styles.quota}
          accessibilityLabel={`${MY_PRODUCTS_PAGE_UI.QUOTA_LABEL}: ${productsQuotaText}`}
        >
          <Text style={styles.quotaLabel}>{MY_PRODUCTS_PAGE_UI.QUOTA_LABEL}:</Text>{" "}
          {productsQuotaText}
        </Text>
      ) : null}
    </View>
  );
};
