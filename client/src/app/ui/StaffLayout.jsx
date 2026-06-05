import { Outlet } from "react-router-dom";

/** Обёртка staff-маршрутов; guard на каждом дочернем Route. */
export function StaffLayout() {
  return <Outlet />;
}
