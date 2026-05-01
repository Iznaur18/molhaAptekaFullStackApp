import { mockProducts } from '../../../entities/product/model/mockProducts.js';
import { ProductCard } from '../../../entities/product/ui/ProductCard.jsx';

import './ProductCatalogPlaceholder.css';

export function ProductCatalogPlaceholder() {
  return (
    <section className="product-catalog-placeholder" aria-label="Каталог товаров">
      <h2 className="product-catalog-placeholder__title">Товары</h2>
      <p className="product-catalog-placeholder__hint">
        Заглушка: позже список придёт с <code>GET /product</code> в том же формате.
      </p>
      <div className="product-catalog-placeholder__grid">
        {mockProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
