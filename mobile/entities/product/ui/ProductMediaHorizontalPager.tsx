import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  FlatList,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type ProductMediaHorizontalPagerProps = {
  slideCount: number;
  activeIndex: number;
  onIndexChange: (index: number) => void;
  renderSlide: (index: number, width: number) => ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const ProductMediaHorizontalPager = ({
  slideCount,
  activeIndex,
  onIndexChange,
  renderSlide,
  style,
}: ProductMediaHorizontalPagerProps) => {
  const listRef = useRef<FlatList<number>>(null);
  const [width, setWidth] = useState(0);
  const skipNextScrollSyncRef = useRef(false);
  const slideIndexes = useMemo(
    () => Array.from({ length: slideCount }, (_, index) => index),
    [slideCount],
  );

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth > 0) {
      setWidth((current) => (current === nextWidth ? current : nextWidth));
    }
  }, []);

  const syncIndexFromOffset = useCallback(
    (offsetX: number) => {
      if (width <= 0 || slideCount <= 1) {
        return;
      }
      const nextIndex = Math.round(offsetX / width);
      const clamped = Math.min(Math.max(nextIndex, 0), slideCount - 1);
      if (clamped === activeIndex) {
        return;
      }
      skipNextScrollSyncRef.current = true;
      onIndexChange(clamped);
    },
    [activeIndex, onIndexChange, slideCount, width],
  );

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      syncIndexFromOffset(event.nativeEvent.contentOffset.x);
    },
    [syncIndexFromOffset],
  );

  const handleScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      syncIndexFromOffset(event.nativeEvent.contentOffset.x);
    },
    [syncIndexFromOffset],
  );

  useEffect(() => {
    if (width <= 0 || slideCount <= 1) {
      return;
    }
    if (skipNextScrollSyncRef.current) {
      skipNextScrollSyncRef.current = false;
      return;
    }
    listRef.current?.scrollToOffset({
      offset: activeIndex * width,
      animated: true,
    });
  }, [activeIndex, slideCount, width]);

  if (slideCount <= 1) {
    return (
      <View style={style} onLayout={handleLayout}>
        {slideCount === 1 && width > 0 ? renderSlide(0, width) : null}
      </View>
    );
  }

  return (
    <View style={style} onLayout={handleLayout}>
      {width > 0 ? (
        <FlatList
          ref={listRef}
          horizontal
          pagingEnabled
          bounces={false}
          data={slideIndexes}
          keyExtractor={(item) => String(item)}
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          initialScrollIndex={Math.min(activeIndex, slideCount - 1)}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScrollEndDrag={handleScrollEndDrag}
          renderItem={({ item }) => <View style={{ width }}>{renderSlide(item, width)}</View>}
        />
      ) : null}
    </View>
  );
};
