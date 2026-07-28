import { createContext, useContext, type ReactNode } from "react";

import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";

import { useViewerRegionController } from "./useViewerRegionController";

type ViewerRegionContextValue = ReturnType<typeof useViewerRegionController>;

const ViewerRegionContext = createContext<ViewerRegionContextValue | null>(null);

export function ViewerRegionProvider({ children }: { children: ReactNode }) {
  const sessionQuery = useAuthSessionQuery();
  const profileRegionCode =
    sessionQuery.data?.user &&
    typeof (sessionQuery.data.user as { userRegionCode?: unknown }).userRegionCode ===
      "string"
      ? String((sessionQuery.data.user as { userRegionCode?: string }).userRegionCode)
      : null;

  const value = useViewerRegionController(profileRegionCode);

  return (
    <ViewerRegionContext.Provider value={value}>{children}</ViewerRegionContext.Provider>
  );
}

export function useViewerRegion(): ViewerRegionContextValue {
  const value = useContext(ViewerRegionContext);
  if (!value) {
    throw new Error("useViewerRegion must be used within ViewerRegionProvider");
  }
  return value;
}
