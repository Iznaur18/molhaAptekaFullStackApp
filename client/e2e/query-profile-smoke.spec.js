import { expect, test } from "./helpers/test.js";
import { E2E_API_ORIGIN } from "./helpers/urls.js";

import {
  countMyOrdersActionItemsFromOrders,
  countMySalesActionItemsFromOrders,
} from "../src/entities/order/lib/countOrderActionItems.js";
import { loginAndGetCookieHeader, loginViaApiCookies } from "./helpers/api.js";
import { E2E_BUYER, E2E_FIXTURE, E2E_SELLER } from "./helpers/fixtures.js";

const SERVER_URL = E2E_API_ORIGIN;

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} cookie
 * @param {string} path
 */
async function getJsonWithCookie(request, cookie, path) {
  const response = await request.get(`${SERVER_URL}${path}`, {
    headers: { Cookie: cookie },
  });
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.success).toBe(true);
  return body.data;
}

test("Query UI: профиль → вкладки на TanStack Query", async ({ page, request }) => {
  await loginViaApiCookies(page, request, E2E_BUYER);
  await page.goto("/me");
  await page.getByRole("button", { name: "Мои покупки", exact: true }).click();
  // Вкладка загрузилась: либо пусто, либо список покупок. Пустым он бывает
  // не всегда — checkout из query-mutations-smoke идёт раньше и оставляет
  // покупателю заказ с сид-товаром. Ждать «Загрузка…» нельзя: это мгновение.
  await expect(
    page
      .getByText("У вас пока нет покупок.", { exact: true })
      .or(page.getByText(E2E_FIXTURE.catalogProductName))
      .first(),
  ).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: "Премиум", exact: true }).click();
  // На странице два элемента с меткой «Премиум» (секция и hero «Премиум: N баллов»),
  // поэтому ищем именно секцию.
  await expect(page.getByRole("region", { name: "Премиум" })).toBeVisible({
    timeout: 15_000,
  });

  await page.goto("/catalog");
  await expect(page).toHaveURL(/\/catalog/);
});

test("derive badges: action-count совпадает с list API", async ({ request }) => {
  const buyerCookie = await loginAndGetCookieHeader(request, E2E_BUYER);
  const sellerCookie = await loginAndGetCookieHeader(request, E2E_SELLER);

  const buyerOrdersData = await getJsonWithCookie(request, buyerCookie, "/order");
  const buyerCountData = await getJsonWithCookie(
    request,
    buyerCookie,
    "/order/action-count",
  );
  expect(buyerCountData.count).toBe(
    countMyOrdersActionItemsFromOrders(buyerOrdersData.orders),
  );

  const sellerSalesData = await getJsonWithCookie(
    request,
    sellerCookie,
    "/order/sales",
  );
  const sellerCountData = await getJsonWithCookie(
    request,
    sellerCookie,
    "/order/sales/action-count",
  );
  expect(sellerCountData.count).toBe(
    countMySalesActionItemsFromOrders(sellerSalesData.orders),
  );
});
