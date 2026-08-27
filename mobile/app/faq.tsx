import { FaqScreen } from "@/features/faq/ui/FaqScreen";
import { ScreenWithBack } from "@/shared/ui/ScreenWithBack";

export default function FaqRoute() {
  return (
    <ScreenWithBack>
      <FaqScreen />
    </ScreenWithBack>
  );
}
