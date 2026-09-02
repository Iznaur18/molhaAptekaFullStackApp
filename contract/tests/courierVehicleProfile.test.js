import assert from "node:assert/strict";
import test from "node:test";

import {
  getCourierVehiclePublicFields,
  sanitizeCourierProfileForViewer,
} from "../src/courier.js";

test("getCourierVehiclePublicFields returns trimmed vehicle fields", () => {
  const vehicle = getCourierVehiclePublicFields({
    vehicleMake: " Lada Granta ",
    vehicleColor: "белый",
    vehiclePlate: "х123ум797",
    vehiclePhotoFrontUrl: "/upload/private/front.webp",
  });

  assert.deepEqual(vehicle, {
    vehicleMake: "Lada Granta",
    vehicleColor: "белый",
    vehiclePlate: "х123ум797",
  });
});

test("sanitizeCourierProfileForViewer strips private courier docs for guests", () => {
  const out = sanitizeCourierProfileForViewer(
    {
      moderationStatus: "approved",
      vehicleMake: "Lada Granta",
      vehicleColor: "белый",
      vehiclePlate: "х123ум797",
      vehiclePhotoFrontUrl: "/upload/private/front.webp",
      moderationComment: "ok",
    },
    { isFullAccess: false },
  );

  assert.deepEqual(out, {
    moderationStatus: "approved",
    vehicleMake: "Lada Granta",
    vehicleColor: "белый",
    vehiclePlate: "х123ум797",
  });
});

test("sanitizeCourierProfileForViewer keeps full profile for self", () => {
  const profile = {
    vehicleMake: "Lada Granta",
    vehiclePhotoFrontUrl: "/upload/private/front.webp",
  };
  const out = sanitizeCourierProfileForViewer(profile, { isFullAccess: true });
  assert.equal(out, profile);
});
