import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

import {
  USERS_GRID_COLUMNS_PHONE,
  USERS_GRID_TILE_MIN_WIDTH,
} from "@/features/users-page/lib/usersGridConstants";
import { resolveUsersGridGap } from "@/features/users-page/lib/resolveUsersGridGap";
import { SCREEN_SMALL_TABLET_MIN_WIDTH } from "@/shared/lib/screenBreakpoints";
import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";

export type UsersGridLayout = {
  columns: number;
  listKey: string;
  gap: number;
  padding: number;
  tileWidth: number;
};

export const useUsersGridLayout = (
  pagePadding: number = SCREEN_CONTENT_PADDING_HORIZONTAL,
): UsersGridLayout => {
  const { width } = useWindowDimensions();

  return useMemo(() => {
    const contentWidth = width - pagePadding * 2;
    const gap = resolveUsersGridGap(width);
    const autoColumns = Math.max(
      1,
      Math.floor((contentWidth + gap) / (USERS_GRID_TILE_MIN_WIDTH + gap)),
    );
    const columns =
      width >= SCREEN_SMALL_TABLET_MIN_WIDTH ? autoColumns : USERS_GRID_COLUMNS_PHONE;
    const tileWidth = (contentWidth - gap * (columns - 1)) / columns;

    return {
      columns,
      listKey: `users-grid-${columns}-${gap}`,
      gap,
      padding: pagePadding,
      tileWidth,
    };
  }, [pagePadding, width]);
};
