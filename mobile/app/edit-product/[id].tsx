import { useLocalSearchParams } from "expo-router";

import { EditProductScreen } from "@/features/edit-product/ui/EditProductScreen";

export default function EditProductRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Array.isArray(id) ? id[0] : id ?? "";
  return <EditProductScreen productId={productId} />;
}
