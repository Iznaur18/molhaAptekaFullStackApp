import { WishlistPage } from "@/features/wishlist-page/ui/WishlistPage";
import { SubscriptionsPage } from "@/features/subscriptions-page/ui/SubscriptionsPage";
import { MyOrdersPage } from "@/features/my-orders-page/ui/MyOrdersPage";
import { MyProductsPage } from "@/features/my-products-page/ui/MyProductsPage";
import { MySalesPage } from "@/features/my-sales-page/ui/MySalesPage";
import { AdvertisingPage } from "@/features/advertising-page/ui/AdvertisingPage";
import { PremiumPage } from "@/features/premium-page/ui/PremiumPage";
import { PartnerProgramPage } from "@/features/partner-program-page/ui/PartnerProgramPage";
import { LoyaltyPointsPage } from "@/features/loyalty-points-page/ui/LoyaltyPointsPage";
import { DataConfirmationPage } from "@/features/data-confirmation-page/ui/DataConfirmationPage";
import { CreateRafflePage } from "@/features/create-raffle-page/ui/CreateRafflePage";
import { AuctionPage } from "@/features/auction-page/ui/AuctionPage";
import { InstallmentPaymentsPage } from "@/features/installment-payments-page/ui/InstallmentPaymentsPage";
import { InstallmentSalesPage } from "@/features/installment-sales-page/ui/InstallmentSalesPage";
import { ProductModerationPage } from "@/features/product-moderation-page/ui/ProductModerationPage";
import { IntroAdModerationPage } from "@/features/intro-ad-moderation-page/ui/IntroAdModerationPage";
import { ProductReportsPage } from "@/features/product-reports-page/ui/ProductReportsPage";
import { DataConfirmationRequestsPage } from "@/features/data-confirmation-requests-page/ui/DataConfirmationRequestsPage";
import { InstallmentDisputesPage } from "@/features/installment-disputes-page/ui/InstallmentDisputesPage";
import { AdminOrdersPage } from "@/features/admin-orders-page/ui/AdminOrdersPage";
import { ProfileOverviewPage } from "@/features/profile-overview/ui/ProfileOverviewPage";
import { SearchSynonymsAdminPage } from "@/features/search-synonyms-admin-page/ui/SearchSynonymsAdminPage";
import { CategoryTreeAdminPage } from "@/features/category-tree-admin-page/ui/CategoryTreeAdminPage";
import { AppIntroAdminPage } from "@/features/app-intro-admin-page/ui/AppIntroAdminPage";
import { SiteHeaderBannerAdminPage } from "@/features/site-header-banner-admin-page/ui/SiteHeaderBannerAdminPage";
import { PopularProductsAdminPage } from "@/features/popular-products-admin-page/ui/PopularProductsAdminPage";
import { HubSectionPlaceholder } from "@/features/profile-hub/ui/HubSectionPlaceholder";
import { HUB_SECTION_UI } from "@/shared/config";

type HubSectionContentProps = {
  sectionId: string;
  sectionTitle: string;
  onBack: () => void;
};

export const HubSectionContent = ({
  sectionId,
  sectionTitle,
  onBack,
}: HubSectionContentProps) => {
  switch (sectionId) {
    case "overview":
      return <ProfileOverviewPage />;
    case "wishlist":
      return <WishlistPage />;
    case "subscriptions":
      return <SubscriptionsPage />;
    case "my-products":
      return <MyProductsPage />;
    case "my-sales":
      return <MySalesPage />;
    case "my-orders":
      return <MyOrdersPage />;
    case "advertising":
      return <AdvertisingPage />;
    case "premium":
      return <PremiumPage />;
    case "loyalty-points":
      return <LoyaltyPointsPage />;
    case "partner-program":
      return <PartnerProgramPage />;
    case "data-confirmation":
      return <DataConfirmationPage />;
    case "auction":
      return <AuctionPage />;
    case "installment-payments":
      return <InstallmentPaymentsPage />;
    case "installment-sales":
      return <InstallmentSalesPage />;
    case "create-raffle":
      return <CreateRafflePage />;
    case "product-moderation":
      return <ProductModerationPage />;
    case "intro-ad-moderation":
      return <IntroAdModerationPage />;
    case "seller-personal-category-moderation":
      return <IntroAdModerationPage />;
    case "raffles":
      return <IntroAdModerationPage />;
    case "product-reports":
      return <ProductReportsPage />;
    case "product-promotions":
      return (
        <HubSectionPlaceholder
          title={sectionTitle}
          hint={HUB_SECTION_UI.PLACEHOLDER_HINT}
          onBack={onBack}
        />
      );
    case "data-confirmation-requests":
      return <DataConfirmationRequestsPage />;
    case "installment-disputes":
      return <InstallmentDisputesPage />;
    case "admin-orders":
      return <AdminOrdersPage />;
    case "search-synonyms-admin":
      return <SearchSynonymsAdminPage />;
    case "category-tree-admin":
      return <CategoryTreeAdminPage />;
    case "app-intro-admin":
      return <AppIntroAdminPage />;
    case "site-header-banner-admin":
      return <SiteHeaderBannerAdminPage />;
    case "popular-products-admin":
      return <PopularProductsAdminPage />;
    default:
      return (
        <HubSectionPlaceholder
          title={sectionTitle}
          hint={HUB_SECTION_UI.PLACEHOLDER_HINT}
          onBack={onBack}
        />
      );
  }
};
