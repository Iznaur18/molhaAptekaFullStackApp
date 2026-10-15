/**
 * Страница товара — отдельный чанк: вместе с ней едут оформление заказа,
 * рассрочка, торг, отзывы и вопросы, и в entry это лишние сотни КБ для
 * каждого гостя. Чтобы карточка из ленты всё равно открывалась без паузы,
 * чанк подтягивается заранее, как только браузер простаивает.
 */
export const loadProductRoutePage = () => import("./ProductRoutePage.jsx");

let prefetchScheduled = false;

export function prefetchProductRoutePage() {
  if (prefetchScheduled || typeof window === "undefined") {
    return;
  }
  prefetchScheduled = true;
  const prefetch = () => {
    loadProductRoutePage().catch((error) => {
      // Не страшно: при переходе на товар lazy-загрузка повторит запрос сама.
      console.warn("Не удалось заранее загрузить страницу товара", error);
    });
  };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(prefetch, { timeout: 3000 });
  } else {
    window.setTimeout(prefetch, 1500);
  }
}
