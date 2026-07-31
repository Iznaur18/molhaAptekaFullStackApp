import { useCallback, useEffect, useState } from "react";

/** @typedef {import('../../entities/product/model/types.js').ProductFromApi} ProductFromApi */

export function useShellUiState() {
  const [productSearchTerm, setProductSearchTermState] = useState("");
  const [submittedProductSearchTerm, setSubmittedProductSearchTerm] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isProductCategoryListOpen, setIsProductCategoryListOpen] = useState(false);
  const [editingFeedTileKey, setEditingFeedTileKey] = useState(
    /** @type {string | null} */ (null),
  );
  const [editingCategorySlug, setEditingCategorySlug] = useState(
    /** @type {import('../../entities/product/model/types.js').ProductCategory | null} */ (
      null
    ),
  );
  const [editingCategoryNode, setEditingCategoryNode] = useState(
    /** @type {{ categoryId: string; fallbackLabel: string } | null} */ (null),
  );
  const [myProductsCatalogError, setMyProductsCatalogError] = useState("");
  const [myProductsCatalogNotice, setMyProductsCatalogNotice] = useState("");
  const [staffActionNotice, setStaffActionNotice] = useState("");

  useEffect(() => {
    if (!staffActionNotice) {
      return undefined;
    }
    const timerId = window.setTimeout(() => setStaffActionNotice(""), 4000);
    return () => window.clearTimeout(timerId);
  }, [staffActionNotice]);

  const [deletingProductId, setDeletingProductId] = useState(null);
  const [togglingAvailabilityProductId, setTogglingAvailabilityProductId] =
    useState(null);
  const [togglingAuctionProductId, setTogglingAuctionProductId] = useState(null);
  const [togglingWholesaleProductId, setTogglingWholesaleProductId] = useState(null);
  const [togglingAffiliateProductId, setTogglingAffiliateProductId] = useState(null);
  const [togglingInstallmentProductId, setTogglingInstallmentProductId] = useState(null);
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
  const [isSellerProductsLimitModalOpen, setIsSellerProductsLimitModalOpen] =
    useState(false);
  /** @type {[ProductFromApi | null, import('react').Dispatch<import('react').SetStateAction<ProductFromApi | null>>]} */
  const [productToEdit, setProductToEdit] = useState(null);
  const [productDetailsAdminError, setProductDetailsAdminError] = useState("");
  const [raffleParticipationPendingProductId, setRaffleParticipationPendingProductId] =
    useState(null);
  const [raffleModal, setRaffleModal] = useState(
    /** @type {{ mode: 'create' } | { mode: 'edit', raffle: import('../../entities/raffle/model/types.js').RaffleFromApi, useStaffApi: boolean } | null} */ (
      null
    ),
  );
  const [isDataConfirmationModalOpen, setIsDataConfirmationModalOpen] = useState(false);
  const [promotionProduct, setPromotionProduct] = useState(
    /** @type {ProductFromApi | null} */ (null),
  );
  const [promotionConfig, setPromotionConfig] = useState(
    /** @type {{ tiers: Array<{ tier: number; title: string; description: string }>; durations: Array<{ code: string; title: string; durationHours: number; durationMult: number }> }} */ ({
      tiers: [],
      durations: [],
    }),
  );
  const [promotionModalError, setPromotionModalError] = useState("");
  const [isPromotionSubmitPending, setIsPromotionSubmitPending] = useState(false);

  const onCatalogError = useCallback((message) => {
    setStaffActionNotice(message);
  }, []);

  /**
   * Ввод в поле поиска. Запрос по нему не уходит — каталог ждёт «Найти»
   * (`submitProductSearch`). Пустое поле — не поиск, а отмена: сбрасываем
   * отправленный запрос сразу, чтобы каталог не остался отфильтрованным.
   *
   * @param {string} next
   */
  const setProductSearchTerm = useCallback((next) => {
    setProductSearchTermState(next);
    if (next.trim() === "") {
      setSubmittedProductSearchTerm("");
    }
  }, []);

  const submitProductSearch = useCallback(() => {
    setSubmittedProductSearchTerm(productSearchTerm);
  }, [productSearchTerm]);

  return {
    productSearchTerm,
    setProductSearchTerm,
    submittedProductSearchTerm,
    submitProductSearch,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isRegisterModalOpen,
    setIsRegisterModalOpen,
    isProductCategoryListOpen,
    setIsProductCategoryListOpen,
    editingFeedTileKey,
    setEditingFeedTileKey,
    editingCategorySlug,
    setEditingCategorySlug,
    editingCategoryNode,
    setEditingCategoryNode,
    myProductsCatalogError,
    setMyProductsCatalogError,
    myProductsCatalogNotice,
    setMyProductsCatalogNotice,
    staffActionNotice,
    setStaffActionNotice,
    deletingProductId,
    setDeletingProductId,
    togglingAvailabilityProductId,
    setTogglingAvailabilityProductId,
    togglingAuctionProductId,
    setTogglingAuctionProductId,
    togglingWholesaleProductId,
    setTogglingWholesaleProductId,
    togglingAffiliateProductId,
    setTogglingAffiliateProductId,
    togglingInstallmentProductId,
    setTogglingInstallmentProductId,
    isCreateProductModalOpen,
    setIsCreateProductModalOpen,
    isSellerProductsLimitModalOpen,
    setIsSellerProductsLimitModalOpen,
    productToEdit,
    setProductToEdit,
    productDetailsAdminError,
    setProductDetailsAdminError,
    raffleParticipationPendingProductId,
    setRaffleParticipationPendingProductId,
    raffleModal,
    setRaffleModal,
    isDataConfirmationModalOpen,
    setIsDataConfirmationModalOpen,
    promotionProduct,
    setPromotionProduct,
    promotionConfig,
    setPromotionConfig,
    promotionModalError,
    setPromotionModalError,
    isPromotionSubmitPending,
    setIsPromotionSubmitPending,
    onCatalogError,
  };
}
