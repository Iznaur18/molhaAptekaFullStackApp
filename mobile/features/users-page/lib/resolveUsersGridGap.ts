import {
  USERS_GRID_BREAKPOINT_COMPACT,
  USERS_GRID_BREAKPOINT_NARROW,
  USERS_GRID_GAP_COMPACT,
  USERS_GRID_GAP_DEFAULT,
  USERS_GRID_GAP_NARROW,
} from "@/features/users-page/lib/usersGridConstants";

export const resolveUsersGridGap = (width: number): number => {
  if (width <= USERS_GRID_BREAKPOINT_NARROW) {
    return USERS_GRID_GAP_NARROW;
  }

  if (width <= USERS_GRID_BREAKPOINT_COMPACT) {
    return USERS_GRID_GAP_COMPACT;
  }

  return USERS_GRID_GAP_DEFAULT;
};
