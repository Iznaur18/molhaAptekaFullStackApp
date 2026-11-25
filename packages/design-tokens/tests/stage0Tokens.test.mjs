import assert from "node:assert/strict";
import { test } from "node:test";

import {
  izGradients,
  izInteraction,
  izLayout,
  izModalBackdropScrim,
  izModalBackdropScrimCss,
  izPageBgCustom,
  izProductBadgeColors,
  izRadius,
  izShadows,
  izSocialBrandColors,
  izTypography,
  resolveIzTheme,
  resolvePageBackground,
} from "../src/index.ts";

test("radius includes card scale + integer lg", () => {
  assert.equal(izRadius.lg, 17);
  assert.equal(izRadius.card, 14);
  assert.equal(izRadius.cardLg, 16);
  assert.equal(izRadius.segmentTab, 11);
});

test("typography font scale matches mobile parity CSS names", () => {
  assert.equal(izTypography.fontFamily, "System");
  assert.equal(izTypography.fontFamilyDisplay, "Intro");
  assert.match(izTypography.fontFamilyWeb, /Inter/);
  assert.equal(izTypography.font2xs, 11);
  assert.equal(izTypography.fontMd, 15);
  assert.equal(izTypography.font6xl, 26);
  assert.equal(izTypography.font7xl, 28);
});

test("interaction + scrim + page bg", () => {
  assert.equal(izInteraction.disabledOpacity, 0.55);
  assert.equal(izInteraction.pressedScale, 0.96);
  assert.equal(izModalBackdropScrim, "rgba(0,0,0,0.45)");
  assert.equal(izModalBackdropScrimCss, "rgb(0 0 0 / 45%)");
  assert.equal(izPageBgCustom, "#fafafc");
});

test("layout ladder matches web app-shell max-width", () => {
  assert.equal(izLayout.contentPaddingHorizontalPhone, 8);
  assert.equal(izLayout.contentSectionGap, 8);
  assert.equal(izLayout.contentMaxWidthSmallTablet, 520);
  assert.equal(izLayout.contentMaxWidthMediumTablet, 720);
  assert.equal(izLayout.contentMaxWidthLargeTablet, 960);
  assert.equal(izLayout.contentMaxWidthWide, 1200);
});

test("shadow recipes + gradients exist", () => {
  assert.ok(izShadows.card);
  assert.ok(izShadows.modal);
  assert.ok(izShadows.elevated);
  assert.ok(izShadows.inputFocus);
  assert.ok(izGradients.premiumPanel);
  assert.ok(izGradients.rafflePink);
  assert.ok(izGradients.feedIndigo);
  assert.ok(izGradients.feedGold);
});

test("resolvePageBackground uses custom chrome without mutating token bg", () => {
  const custom = resolveIzTheme("custom");
  assert.equal(custom.colors.bg, "#DEDEDE");
  assert.equal(resolvePageBackground("custom", custom), "#fafafc");
  assert.equal(resolvePageBackground("light"), resolveIzTheme("light").colors.bg);
  assert.equal(resolvePageBackground("dark"), resolveIzTheme("dark").colors.bg);
});

test("IzTheme exposes interaction + layout", () => {
  const theme = resolveIzTheme("light");
  assert.equal(theme.interaction.disabledOpacity, 0.55);
  assert.equal(theme.layout.contentPaddingHorizontalPhone, 8);
  assert.equal(theme.radius.cardLg, 16);
  assert.equal(theme.typography.fontMd, 15);
});

test("social brand + product badge accent tokens", () => {
  assert.equal(izSocialBrandColors.whatsapp, "#25d366");
  assert.equal(izSocialBrandColors.instagramBadgeGradient.mid, "#e1306c");
  assert.equal(izSocialBrandColors.instagramMediaGradient.mid, "#dd2a7b");
  assert.equal(izProductBadgeColors.raffle.text, "#be185d");
  assert.equal(izProductBadgeColors.flashSaleLight.bg, "#fff3e8");
  assert.equal(izProductBadgeColors.buyNFreeReady, "#1f7a4d");
  assert.equal(izProductBadgeColors.gameAccent, "#ff7a1a");
  assert.equal(izProductBadgeColors.detailsSoft.affiliate.color, "#047857");
});
