import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "MyProfilePage.css"),
  "utf8",
);

/**
 * Phone ≤640 block must not re-declare `transform` on the closed portal sheet.
 * Same specificity as `--open` + later source order kept the sheet off-screen.
 */
describe("MyProfilePage mobile nav CSS", () => {
  it("phone sheet sets hidden-x without overriding --open transform", () => {
    const portalIdx = css.indexOf(
      "/* Phone ≤640: паритет Expo — filled toggle + sheet справа */",
    );
    expect(portalIdx).toBeGreaterThan(-1);
    const phoneSection = css.slice(portalIdx, portalIdx + 2500);

    const closedSheetMatch = phoneSection.match(
      /\.my-profile-page__mobile-nav-portal\s+\.my-profile-page__sidebar-wrap\s*\{([^}]+)\}/,
    );
    expect(closedSheetMatch).toBeTruthy();
    expect(closedSheetMatch[1]).toMatch(/--my-profile-nav-hidden-x:\s*calc\(100%/);
    expect(closedSheetMatch[1]).not.toMatch(/\btransform\s*:/);

    expect(phoneSection).toMatch(
      /\.my-profile-page__mobile-nav-portal--open\s+\.my-profile-page__sidebar-wrap\s*\{[^}]*transform:\s*translate3d\(0,\s*0,\s*0\)/,
    );
  });
});
