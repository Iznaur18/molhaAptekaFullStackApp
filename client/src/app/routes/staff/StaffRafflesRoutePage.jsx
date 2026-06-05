import { LazyRafflesStaffPage } from "../../../pages/home/lib/lazyHomePages.js";
import { useAppShell } from "../../model/AppShellContext.jsx";

export function StaffRafflesRoutePage() {
  const {
    raffleRefreshTick,
    refreshPendingRafflesCount,
    refreshFeaturedRaffle,
    setRaffleRefreshTick,
    setCatalogRefreshTick,
    setRaffleModal,
  } = useAppShell().mainContentProps;

  return (
    <LazyRafflesStaffPage
      refreshTick={raffleRefreshTick}
      onQueueChanged={() => {
        void refreshPendingRafflesCount();
        setRaffleRefreshTick((n) => n + 1);
        setCatalogRefreshTick((n) => n + 1);
        void refreshFeaturedRaffle();
      }}
      onEditRaffle={(raffle) =>
        setRaffleModal({ mode: "edit", raffle, useStaffApi: true })
      }
    />
  );
}
