import {
  startTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  CATALOG_GRID_BLOCK_MOUNT_MARGIN_SCREENS,
  CATALOG_GRID_BLOCK_UNMOUNT_MARGIN_SCREENS,
} from "../lib/catalogGridVirtualizationConstants.js";

export const CATALOG_GRID_BLOCK_KEY_ATTRIBUTE = "data-catalog-block-key";

const MIN_VIEWPORT_HEIGHT_PX = 600;

/** @typedef {{ height: number; signature: string }} CollapsedCatalogGridBlock */

/**
 * Какие блоки ленты держать смонтированными, а какие свернуть в заглушку.
 *
 * Прокрутку никто не слушает и ничего не замеряет на кадре: решают два
 * IntersectionObserver. Ближний (экран сверху и снизу) разворачивает блок,
 * дальний (2,5 экрана) сворачивает. Разрыв между порогами не даёт блоку
 * дребезжать на границе.
 *
 * Заглушка получает ровно ту высоту, которую блок имел при сворачивании (из
 * записи наблюдателя, без принудительной раскладки), поэтому на экране ничего
 * не сдвигается. Сворачивание и разворачивание идут фоновым рендером
 * (startTransition): React монтирует карточки кусками между кадрами, пока
 * блок ещё за экраном.
 *
 * Прежнее окно с абсолютным сдвигом на каждом ряду перемонтировало карточки и
 * двигало всё окно целиком, и на iPhone лента дёргалась при глубокой
 * прокрутке (13.09.2026).
 *
 * @param {{ blocks: { key: string; signature: string }[] }} params
 *   signature — состав блока (ключи товаров): высота заглушки годится, только
 *   пока он не поменялся.
 */
export function useCatalogGridBlockWindow({ blocks }) {
  const [collapsed, setCollapsed] = useState(
    () => /** @type {Map<string, CollapsedCatalogGridBlock>} */ (new Map()),
  );
  // Намерение, а не отрисованное состояние: наблюдатели решают по нему, не
  // дожидаясь фонового рендера. Иначе блок, свёрнутый и тут же снова
  // понадобившийся, остался бы заглушкой.
  const collapsedRef = useRef(collapsed);
  const signaturesRef = useRef(/** @type {Map<string, string>} */ (new Map()));
  const elementsRef = useRef(/** @type {Map<string, Element>} */ (new Map()));
  const refCallbacksRef = useRef(
    /** @type {Map<string, (element: Element | null) => void>} */ (new Map()),
  );
  const observersRef = useRef(
    /** @type {{ near: IntersectionObserver; far: IntersectionObserver } | null} */ (
      null
    ),
  );

  const commitCollapsed = useCallback((next) => {
    collapsedRef.current = next;
    startTransition(() => {
      setCollapsed(next);
    });
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const viewportHeight = Math.max(window.innerHeight || 0, MIN_VIEWPORT_HEIGHT_PX);
    const toRootMargin = (screens) => `${Math.round(viewportHeight * screens)}px 0px`;

    const near = new IntersectionObserver(
      (entries) => {
        let next = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const key = entry.target.getAttribute(CATALOG_GRID_BLOCK_KEY_ATTRIBUTE);
          if (key == null || !collapsedRef.current.has(key)) continue;
          if (!next) next = new Map(collapsedRef.current);
          next.delete(key);
        }
        if (next) commitCollapsed(next);
      },
      { rootMargin: toRootMargin(CATALOG_GRID_BLOCK_MOUNT_MARGIN_SCREENS) },
    );

    const far = new IntersectionObserver(
      (entries) => {
        let next = null;
        for (const entry of entries) {
          if (entry.isIntersecting) continue;
          const target = entry.target;
          const key = target.getAttribute(CATALOG_GRID_BLOCK_KEY_ATTRIBUTE);
          if (key == null || collapsedRef.current.has(key)) continue;
          const height = entry.boundingClientRect.height;
          if (!(height > 0)) continue;
          // Лента под открытой карточкой товара скрыта (content-visibility):
          // для наблюдателя это «вне экрана», но сворачивать её нельзя — при
          // возврате карточки перемонтировались бы на глазах.
          if (
            typeof target.checkVisibility === "function" &&
            !target.checkVisibility()
          ) {
            continue;
          }
          if (!next) next = new Map(collapsedRef.current);
          next.set(key, { height, signature: signaturesRef.current.get(key) ?? "" });
        }
        if (next) commitCollapsed(next);
      },
      { rootMargin: toRootMargin(CATALOG_GRID_BLOCK_UNMOUNT_MARGIN_SCREENS) },
    );

    observersRef.current = { near, far };
    for (const element of elementsRef.current.values()) {
      near.observe(element);
      far.observe(element);
    }

    return () => {
      near.disconnect();
      far.disconnect();
      observersRef.current = null;
    };
  }, [commitCollapsed]);

  useLayoutEffect(() => {
    const signatures = new Map(blocks.map((block) => [block.key, block.signature]));
    signaturesRef.current = signatures;

    // Состав свёрнутого блока поменялся (дописались товары, переставились
    // баннеры): запомненная высота устарела. Блок уже отрисован целиком (см.
    // getCollapsedHeight), просим дальний наблюдатель пересмотреть его.
    let next = null;
    for (const [key, entry] of collapsedRef.current) {
      if (signatures.get(key) === entry.signature) continue;
      if (!next) next = new Map(collapsedRef.current);
      next.delete(key);
      const element = elementsRef.current.get(key);
      if (element && observersRef.current) {
        observersRef.current.far.unobserve(element);
        observersRef.current.far.observe(element);
      }
    }
    for (const key of refCallbacksRef.current.keys()) {
      if (!signatures.has(key)) refCallbacksRef.current.delete(key);
    }
    if (next) {
      collapsedRef.current = next;
      setCollapsed(next);
    }
  }, [blocks]);

  /** Стабильный ref-колбэк на ключ: иначе наблюдение пересоздавалось бы на каждый рендер. */
  const getBlockRef = useCallback((key) => {
    let callback = refCallbacksRef.current.get(key);
    if (!callback) {
      callback = (element) => {
        const observers = observersRef.current;
        const previous = elementsRef.current.get(key);
        if (previous && previous !== element) {
          observers?.near.unobserve(previous);
          observers?.far.unobserve(previous);
          elementsRef.current.delete(key);
        }
        if (element) {
          elementsRef.current.set(key, element);
          observers?.near.observe(element);
          observers?.far.observe(element);
        }
      };
      refCallbacksRef.current.set(key, callback);
    }
    return callback;
  }, []);

  /**
   * Высота заглушки или null, если блок нужно отрисовать с карточками.
   *
   * @param {string} key
   * @param {string} signature
   */
  const getCollapsedHeight = useCallback(
    (key, signature) => {
      const entry = collapsed.get(key);
      return entry && entry.signature === signature ? entry.height : null;
    },
    [collapsed],
  );

  return { getBlockRef, getCollapsedHeight };
}
