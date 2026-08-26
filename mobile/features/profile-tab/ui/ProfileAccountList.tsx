import { type ReactElement, type ReactNode } from "react";
import {
  FlatList,
  View,
  type FlatListProps,
  type ListRenderItem,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useProfileAccountNestedListScroll } from "@/features/profile-tab/model/ProfileAccountScrollContext";

type ProfileAccountListProps<T> = {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: ListRenderItem<T>;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  ListHeaderComponent?: ReactElement | null;
  ListFooterComponent?: ReactElement | null;
  ListEmptyComponent?: ReactElement | null;
  refreshControl?: FlatListProps<T>["refreshControl"];
  onEndReached?: FlatListProps<T>["onEndReached"];
  onEndReachedThreshold?: number;
  accessibilityLabel?: string;
  /** Extra FlatList-only props (ignored in static outer-scroll mode). */
  flatListProps?: Omit<
    FlatListProps<T>,
    | "data"
    | "keyExtractor"
    | "renderItem"
    | "style"
    | "contentContainerStyle"
    | "ListHeaderComponent"
    | "ListFooterComponent"
    | "ListEmptyComponent"
    | "refreshControl"
    | "onEndReached"
    | "onEndReachedThreshold"
    | "scrollEnabled"
  >;
};

/**
 * Desktop ProfileAccountShell: VirtualizedList внутри ScrollView = пустой список на web.
 * outerScrollOwns → обычный View+map; drawer → FlatList.
 */
export const ProfileAccountList = <T,>({
  data,
  keyExtractor,
  renderItem,
  style,
  contentContainerStyle,
  ListHeaderComponent = null,
  ListFooterComponent = null,
  ListEmptyComponent = null,
  refreshControl,
  onEndReached,
  onEndReachedThreshold,
  accessibilityLabel,
  flatListProps,
}: ProfileAccountListProps<T>): ReactNode => {
  const { outerScrollOwns, scrollEnabled, resolveListStyle } =
    useProfileAccountNestedListScroll();

  const listStyle = resolveListStyle(style);

  if (outerScrollOwns) {
    const isEmpty = data.length === 0;

    return (
      <View style={listStyle} accessibilityLabel={accessibilityLabel}>
        <View style={[{ flexDirection: "column", width: "100%" }, contentContainerStyle]}>
          {ListHeaderComponent}
          {isEmpty
            ? ListEmptyComponent
            : data.map((item, index) => (
                <View key={keyExtractor(item, index)} style={{ width: "100%" }}>
                  {renderItem({ item, index, separators: unusedSeparators })}
                </View>
              ))}
          {ListFooterComponent}
        </View>
      </View>
    );
  }

  return (
    <FlatList
      {...flatListProps}
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      style={listStyle}
      contentContainerStyle={contentContainerStyle}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      refreshControl={refreshControl}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      scrollEnabled={scrollEnabled}
      accessibilityLabel={accessibilityLabel}
    />
  );
};

const unusedSeparators = {
  highlight: () => {},
  unhighlight: () => {},
  updateProps: () => {},
};
