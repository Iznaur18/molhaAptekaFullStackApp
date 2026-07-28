import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dir = dirname(fileURLToPath(import.meta.url));

describe("AppShellHeader unified chrome", () => {
  it("always uses mobile-top actions, never desktop variant", () => {
    const source = readFileSync(join(dir, "AppShellHeader.jsx"), "utf8");
    expect(source).toMatch(/app-shell__auth-actions--mobile-top/);
    expect(source).toMatch(/HeaderUsersStretchMenu/);
    expect(source).not.toMatch(/HeaderUsersButton/);
    expect(source).not.toMatch(/auth-actions--desktop/);
    expect(source).not.toMatch(/variant=\{isMobileNav/);
    expect(source).not.toMatch(/useAppShellCompactLayout/);
  });
});
