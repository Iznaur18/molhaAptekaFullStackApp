import { AccountMainContent } from "../../pages/home/ui/AccountMainContent.jsx";
import { useAppShell } from "../model/AppShellContext.jsx";

/** Профиль, заказы, пользователи и пр. — не каталог `/` / `/catalog`. */
export function AccountRoutePage() {
  const { accountContentProps } = useAppShell();
  return <AccountMainContent {...accountContentProps} />;
}
