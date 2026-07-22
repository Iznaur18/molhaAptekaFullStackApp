import mongoose from "mongoose";

import { RaffleModel } from "../models/index.js";
import { chargeRaffleCreatePriceOnApproval } from "../services/raffle/raffleCreateAccess.js";
import { runInTransaction } from "../utils/mongoTransaction.js";

const ACTIVE_RAFFLE_STATUSES = ["active", "paused", "pending_staff"];

async function main() {
  const mongoUri = process.env.MONGODB_URI ?? process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required");
  }

  await mongoose.connect(mongoUri);

  const raffles = await RaffleModel.find({
    status: { $in: ACTIVE_RAFFLE_STATUSES },
    createPricePoints: { $gt: 0 },
    createPriceChargedAt: null,
    createPriceRefundedAt: null,
  }).lean();

  let charged = 0;
  let failed = 0;

  for (const raffle of raffles) {
    try {
      await runInTransaction(async (session) => {
        await chargeRaffleCreatePriceOnApproval({
          sellerId: String(raffle.sellerId),
          raffle,
          session,
        });
      });
      charged += 1;
      console.log(`charged raffle ${String(raffle._id)} seller ${String(raffle.sellerId)}`);
    } catch (error) {
      failed += 1;
      console.error(
        `failed raffle ${String(raffle._id)}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  console.log(`done: charged=${charged}, failed=${failed}, scanned=${raffles.length}`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
