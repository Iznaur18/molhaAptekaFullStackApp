import { useSyncExternalStore } from "react";

/**
 * Флаг «на вкладке index сейчас открыт список категории/фильтра, а не главная
 * лента». Живёт вне React-дерева, потому что выставляет его экран `CatalogScreen`
 * (app/(tabs)/index.tsx), а читает нижний навбар (`MobileBottomTabBar`) — они в
 * разных ветках дерева. Нужен, чтобы, пока открыта категория, навбар подсвечивал
 * «Каталог», а не «Домой».
 */
let isCategoryView = false;
const listeners = new Set<() => void>();

export const setCatalogCategoryView = (value: boolean): void => {
  if (isCategoryView === value) {
    return;
  }
  isCategoryView = value;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = (): boolean => isCategoryView;

export const useCatalogCategoryView = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
