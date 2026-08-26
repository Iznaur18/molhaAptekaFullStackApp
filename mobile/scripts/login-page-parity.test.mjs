import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT = join(ROOT, "../client/src");

const readMobile = (p) => readFileSync(join(ROOT, p), "utf8");
const readClient = (p) => readFileSync(join(CLIENT, p), "utf8");

test("login screen matches web AuthPage layout tokens", () => {
  const layout = readMobile("shared/lib/authPageLayout.ts");
  const styles = readMobile("shared/theme/formChromeStyles.ts");
  const login = readMobile("app/(auth)/login.tsx");
  const webCss = readClient("pages/auth/ui/AuthPage.css");
  const webHero = readClient("shared/ui/AuthHeroBanner/AuthHeroBanner.css");
  const webLogin = readClient("pages/auth/ui/LoginPage.jsx");

  assert.match(webCss, /--auth-page-column-max:\s*420px/);
  assert.match(webHero, /border-radius:\s*32px/);
  assert.match(layout, /columnMaxWidth: 420/);
  assert.match(layout, /heroRadius: 32/);
  assert.match(layout, /inputPaddingY: 12/);
  assert.match(layout, /inputPaddingX: 14/);
  assert.match(layout, /inputFontSize: 15/);
  assert.match(layout, /inputRadius: 10/);
  assert.match(layout, /backSize: 40/);

  assert.match(styles, /maxWidth: A\.columnMaxWidth/);
  assert.match(styles, /borderRadius: A\.heroRadius/);
  assert.match(styles, /backgroundColor: theme\.colors\.surfaceMuted/);
  assert.match(styles, /channelBtnActive/);
  assert.match(styles, /textDecorationLine: "underline"/);

  assert.match(login, /chevron-left/);
  assert.match(login, /AUTH_PAGE_LAYOUT/);
  assert.match(login, /channelBtn/);
  assert.match(login, /LOGIN_SUBMIT_LOADING/);
  assert.match(login, /LayoutAnimation/);
  assert.match(login, /router\.replace\("\/\(tabs\)\/me"\)/);
  assert.doesNotMatch(login, /ModalSectionTabs/);
  assert.match(webLogin, /navigate\("\/me"/);
});
