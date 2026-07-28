import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dir = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(dir, "GuestProfilePanel.css"), "utf8");
const jsx = readFileSync(join(dir, "GuestProfilePanel.jsx"), "utf8");

describe("GuestProfilePanel mobile parity", () => {
  it("uses phone column + app typography/spacing tokens", () => {
    expect(css).toMatch(/--guest-profile-column-max:\s*420px/);
    expect(css).toMatch(/--guest-profile-body-margin-y:\s*36px/);
    expect(css).toMatch(/font-size:\s*24px/);
    expect(css).toMatch(/\.guest-profile__subtitle[\s\S]*?font-size:\s*16px/);
    expect(css).toMatch(/\.guest-profile__action[\s\S]*?width:\s*100%/);
    expect(css).toMatch(/\.app-shell__header[\s\S]*?display:\s*none/);
    expect(css).not.toMatch(/mobile-bottom-nav[\s\S]*?display:\s*none/);
    expect(css).toMatch(/body:has\(\.guest-profile\)[\s\S]*?background:\s*var\(--iz-color-surface\)/);
  });

  it("keeps guest CTA + privacy wiring", () => {
    expect(jsx).toMatch(/guest-profile__column/);
    expect(jsx).toMatch(/AUTH_UI\.GUEST_PROFILE_ACTION_BUTTON/);
    expect(jsx).toMatch(/LEGAL_UI\.PRIVACY_LINK/);
    expect(jsx).toMatch(/AUTH_LOGIN_PATH/);
  });
});
