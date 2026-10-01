import { useParams } from "react-router-dom";

import { ProductDetailsPage } from "../../pages/product-details/ui/ProductDetailsPage.jsx";

/**
 * `/product/:productId` — детали товара (полноэкран, как в приложении).
 *
 * `key` по товару: переход «товар → товар» (кнопка «назад» в карточке,
 * «назад/вперёд» браузера) должен давать свежую страницу. Без него React
 * Router оставлял тот же экземпляр, и «закрытие» прошлой карточки
 * переживало переход: страница стояла с opacity 0 (белый экран) и ещё раз
 * делала navigate(-1), пролетая историю (жалоба 29.09.2026).
 */
export function ProductRoutePage() {
  const { productId } = useParams();
  return <ProductDetailsPage key={productId ?? ""} />;
}
