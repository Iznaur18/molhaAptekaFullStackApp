import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { ViewerRegionProvider } from "@/entities/region/model/ViewerRegionProvider";
import { WishlistProvider } from "@/entities/wishlist/model/WishlistProvider";
import { WishlistServerSync } from "@/entities/wishlist/ui/WishlistServerSync";
import { AppIntroProvider } from "@/features/app-intro/model/AppIntroProvider";
import { AppIntroSplash } from "@/features/app-intro/ui/AppIntroSplash";
import { AppRuntimeSync } from "@/features/app-runtime/ui/AppRuntimeSync";
import { AppThemeProvider } from "@/shared/theme/AppThemeProvider";

type AppProvidersProps = {
  children: ReactNode;
  queryClient: QueryClient;
};

export const AppProviders = ({ children, queryClient }: AppProvidersProps) => (
  <QueryClientProvider client={queryClient}>
    <AppThemeProvider>
      <ViewerRegionProvider>
        <WishlistProvider>
          <AppIntroProvider>
            {children}
            <AppRuntimeSync />
            <WishlistServerSync />
            <AppIntroSplash />
          </AppIntroProvider>
        </WishlistProvider>
      </ViewerRegionProvider>
    </AppThemeProvider>
  </QueryClientProvider>
);
