import { RAFFLE_STATUS_ACTIVE } from "../../constants/raffleConstants.js";
import { RaffleModel } from "../../models/index.js";
import { recalculateRaffleSalesProgress } from "../../utils/raffleHelpers.js";

/** Пересчёт `salesProgress` активных розыгрышей (только confirmed-продажи). */
export const up = async ({ isApply }) => {
  const activeRaffles = await RaffleModel.find({ status: RAFFLE_STATUS_ACTIVE })
    .select("_id")
    .lean();

  let recalculated = 0;
  for (const raffle of activeRaffles) {
    if (isApply) {
      await recalculateRaffleSalesProgress(raffle._id);
    }
    recalculated += 1;
  }

  return {
    activeRaffles: activeRaffles.length,
    recalculated,
  };
};
