import assert from "node:assert/strict";
import test from "node:test";

import { isDadataConfigured } from "../utils/dadata/dadataClient.js";
import { verifyRuDeliveryAddress } from "../utils/dadata/verifyRuDeliveryAddress.js";

test("Grozny house: clean qc_complete=5 but house_fias → ok", async (t) => {
  if (!isDadataConfigured()) {
    t.skip("DaData keys missing");
    return;
  }

  const verified = await verifyRuDeliveryAddress({
    addressLine: "г Грозный, р-н Байсангуровский, ул Саратовская, д 26",
  });

  assert.equal(verified.fiasId, "100eacde-0c5f-428b-baf7-c0ed09c1fe6c");
  assert.ok(verified.geo?.lat);
  assert.ok(verified.geo?.lon);
  assert.match(verified.displayAddress, /Саратовская/);
});
