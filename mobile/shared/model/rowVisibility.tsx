import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { ViewToken } from "react-native";

import { createVisibleKeysStore, type VisibleKeysStore } from "@/shared/model/visibleKeysStore";

/**
 * Видимость текущей строки списка. По умолчанию `true` — вне ленты (детальный
 * экран товара, розыгрыши, интро) тяжёлый контент ведёт себя как раньше и
 * играет сразу. Внутри ленты значение задаёт RowVisibilityBoundary.
 */
const RowVisibilityContext = createContext<boolean>(true);

export const useRowVisibility = (): boolean => useContext(RowVisibilityContext);

const VisibleRowsStoreContext = createContext<VisibleKeysStore | null>(null);

const NOOP_UNSUBSCRIBE = () => {};

type ViewableItemsInfo = { viewableItems: ViewToken[]; changed: ViewToken[] };

export type VisibleRowsController = {
  store: VisibleKeysStore;
  onViewableItemsChanged: (info: ViewableItemsInfo) => void;
  viewabilityConfig: { itemVisiblePercentThreshold: number };
};

/**
 * Возвращает стабильные (неизменные по ссылке) обработчики для FlatList —
 * RN запрещает менять onViewableItemsChanged/viewabilityConfig на лету.
 * `active` (фокус экрана) прокидывается в стор через эффект.
 */
const createController = (): VisibleRowsController => {
  const store = createVisibleKeysStore();
  return {
    store,
    onViewableItemsChanged: ({ viewableItems }) => {
      store.setVisibleKeys(viewableItems.map((token) => String(token.key)));
    },
    viewabilityConfig: { itemVisiblePercentThreshold: 15 },
  };
};

export const useVisibleRowsController = (active: boolean): VisibleRowsController => {
  const controllerRef = useRef<VisibleRowsController | null>(null);
  controllerRef.current ??= createController();
  const controller = controllerRef.current;

  useEffect(() => {
    controller.store.setActive(active);
  }, [active, controller]);

  return controller;
};

export const VisibleRowsProvider = ({
  store,
  children,
}: {
  store: VisibleKeysStore;
  children: ReactNode;
}) => (
  <VisibleRowsStoreContext.Provider value={store}>{children}</VisibleRowsStoreContext.Provider>
);

/**
 * Оборачивает контент строки: подписывается на видимость своего ключа и отдаёт
 * её вниз через RowVisibilityContext. Перерендеривается только сам boundary
 * (дёшево), memo-контент карточки при этом не пересобирается.
 */
export const RowVisibilityBoundary = ({
  rowKey,
  children,
}: {
  rowKey: string;
  children: ReactNode;
}) => {
  const store = useContext(VisibleRowsStoreContext);

  const visible = useSyncExternalStore(
    store ? store.subscribe : () => NOOP_UNSUBSCRIBE,
    store ? () => store.isVisible(rowKey) : () => true,
  );

  return <RowVisibilityContext.Provider value={visible}>{children}</RowVisibilityContext.Provider>;
};
