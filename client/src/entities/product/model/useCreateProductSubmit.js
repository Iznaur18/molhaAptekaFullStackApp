import { useCallback } from "react";

import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { prepareCreateProductSubmit } from "../lib/prepareCreateProductSubmit.js";
import { useMyProductMutations } from "./useMyProductMutations.js";

/**
 * @param {{
 *   form: Record<string, unknown>;
 *   isEdit: boolean;
 *   productToEdit?: import("./types.js").ProductFromApi | null;
 *   showCatalogAvailabilityToggle: boolean;
 *   sellerPointsMaxPerUnit: number;
 *   sellerCatalogCommitted: number;
 *   onSuccess?: (product: import("./types.js").ProductFromApi) => void;
 *   onClose: () => void;
 *   setStatus: (status: { kind: "idle" | "loading" | "error"; message: string }) => void;
 * }} params
 */
export function useCreateProductSubmit({
  form,
  isEdit,
  productToEdit,
  showCatalogAvailabilityToggle,
  sellerPointsMaxPerUnit,
  sellerCatalogCommitted,
  onSuccess,
  onClose,
  setStatus,
}) {
  const { patchMutation, createMutation } = useMyProductMutations();

  const submit = useCallback(
    async (event) => {
      event.preventDefault();
      setStatus({ kind: "loading", message: "" });

      try {
        const prepared = prepareCreateProductSubmit({
          form,
          isEdit,
          showCatalogAvailabilityToggle,
          sellerPointsMaxPerUnit,
          sellerCatalogCommitted,
        });

        if (!prepared.ok) {
          setStatus({ kind: "error", message: prepared.message });
          return;
        }

        let product;
        if (isEdit) {
          if (productToEdit?._id == null) {
            setStatus({
              kind: "error",
              message: CREATE_PRODUCT_MODAL_UI.ERROR_EDIT_GENERIC,
            });
            return;
          }

          product = await patchMutation.mutateAsync({
            productId: String(productToEdit._id),
            body: prepared.patchBody,
          });
        } else {
          product = await createMutation.mutateAsync(prepared.createBody);
        }

        onSuccess?.(product);
        setStatus({ kind: "idle", message: "" });
        onClose();
      } catch (error) {
        const fallback = isEdit
          ? CREATE_PRODUCT_MODAL_UI.ERROR_EDIT_GENERIC
          : CREATE_PRODUCT_MODAL_UI.ERROR_GENERIC;
        const message = error instanceof Error ? error.message : fallback;
        setStatus({ kind: "error", message });
      }
    },
    [
      form,
      isEdit,
      productToEdit,
      showCatalogAvailabilityToggle,
      sellerPointsMaxPerUnit,
      sellerCatalogCommitted,
      onSuccess,
      onClose,
      setStatus,
      patchMutation,
      createMutation,
    ],
  );

  return {
    submit,
    isSubmitting: patchMutation.isPending || createMutation.isPending,
  };
}
