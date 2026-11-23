import { memo, type ReactNode } from "react";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";

import {
  createProductDetailsPageEntering,
  createProductDetailsPageExiting,
} from "@/features/product-detail/lib/productDetailsPageEnterAnimation";

type ProductDetailsPageEnterShellProps = {
  children: ReactNode;
};

const entering = createProductDetailsPageEntering();
const exiting = createProductDetailsPageExiting();

/** Web page enter/exit scale+fade — mount/unmount оболочки экрана товара. */
export const ProductDetailsPageEnterShell = memo(
  ({ children }: ProductDetailsPageEnterShellProps) => (
    <Animated.View
      entering={entering}
      exiting={exiting}
      style={styles.shell}
    >
      {children}
    </Animated.View>
  ),
);

ProductDetailsPageEnterShell.displayName = "ProductDetailsPageEnterShell";

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
});
