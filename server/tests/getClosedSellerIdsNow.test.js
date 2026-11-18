import assert from "node:assert/strict";
import { after, afterEach, before, describe, it } from "node:test";

import { isSellerScheduleClosedNow } from "@molha/api-contract";

import { UserModel } from "../models/index.js";
import { getClosedSellerIdsNow } from "../services/product/getClosedSellerIdsNow.js";
import {
  clearMongoCollections,
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

process.env.NODE_ENV = "test";

/**
 * @param {string} [regionCode]
 */
const buildClosedNowHours = (regionCode = "RU-MOW") => {
  for (let day = 0; day < 7; day += 1) {
    const schedule = {
      enabled: true,
      weekdays: [day],
      openTime: "09:00",
      closeTime: "18:00",
    };
    if (isSellerScheduleClosedNow(schedule, regionCode)) {
      return {
        userBusinessHoursEnabled: true,
        userBusinessHours: {
          weekdays: [day],
          openTime: "09:00",
          closeTime: "18:00",
        },
        userRegionCode: regionCode,
      };
    }
  }
  throw new Error("Не удалось подобрать закрытый график");
};

before(async () => {
  await connectMongoTestReplSet();
});

afterEach(async () => {
  await clearMongoCollections();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

describe("getClosedSellerIdsNow", () => {
  it("возвращает только закрытых по графику, excludeUserId выкидывает зрителя", async () => {
    const closedHours = buildClosedNowHours();
    const [closedSeller, openSeller, closedSelf] = await UserModel.create([
      {
        email: "closed-seller@example.com",
        password: "secret12",
        userName: "closedseller",
        ...closedHours,
      },
      {
        email: "open-seller@example.com",
        password: "secret12",
        userName: "openseller",
        userBusinessHoursEnabled: false,
        userRegionCode: "RU-MOW",
      },
      {
        email: "closed-self@example.com",
        password: "secret12",
        userName: "closedself",
        ...closedHours,
      },
    ]);

    const allClosed = await getClosedSellerIdsNow();
    assert.equal(
      allClosed.map(String).sort().join(","),
      [closedSeller._id, closedSelf._id].map(String).sort().join(","),
    );
    assert.equal(
      allClosed.some((id) => String(id) === String(openSeller._id)),
      false,
    );

    const withoutSelf = await getClosedSellerIdsNow({
      excludeUserId: String(closedSelf._id),
    });
    assert.deepEqual(
      withoutSelf.map(String),
      [String(closedSeller._id)],
    );
  });
});
