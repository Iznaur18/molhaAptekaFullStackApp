import { expect, test } from "@playwright/test";

import {
  countMyOrdersActionItemsFromOrders,
  countMySalesActionItemsFromOrders,
} from "../src/entities/order/lib/countOrderActionItems.js";
import { loginAndGetCookieHeader, loginViaApiCookies } from "./helpers/api.js";
import { E2E_BUYER, E2E_SELLER } from "./helpers/fixtures.js";

const SERVER_URL = "http://127.0.0.1:4444";

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
  await expect(
    page.getByText(/У вас пока нет покупок|Загрузка покупок/),
  ).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: "Премиум", exact: true }).click();
  await expect(page.getByLabel("Премиум")).toBeVisible({ timeout: 15_000 });

  await page.goto("/catalog");
  await expect(page).toHaveURL(/\/catalog/);
});

test("derive badges: action-count совпадает с list API", async ({ request }) => {
  const buyerCookie = await loginAndGetCookieHeader(request, E2E_BUYER);
  const sellerCookie = await loginAndGetCookieHeader(request, E2E_SELLER);

  const buyerOrdersData = await getJsonWithCookie(request, buyerCookie, "/order");
  const buyerCountData = await getJsonWithCookie(request, buyerCookie, "/order/action-count");
  expect(buyerCountData.count).toBe(
    countMyOrdersActionItemsFromOrders(buyerOrdersData.orders),
  );

  const sellerSalesData = await getJsonWithCookie(request, sellerCookie, "/order/sales");
  const sellerCountData = await getJsonWithCookie(
    request,
    sellerCookie,
    "/order/sales/action-count",
  );
  expect(sellerCountData.count).toBe(
    countMySalesActionItemsFromOrders(sellerSalesData.orders),
  );
});
