/**
 * Внешнее хранилище (для useSyncExternalStore) множества «видимых» ключей
 * строк списка. Список сообщает сюда видимые ключи через onViewableItemsChanged,
 * а лёгкие подписчики (например, видео в карточке) узнают свою видимость,
 * не перерендеривая весь список на каждый кадр скролла.
 *
 * `active` — общий гейт видимости экрана (фокус вкладки / AppState). Когда экран
 * не в фокусе, видимыми не считается ничего → тяжёлый контент ставится на паузу.
 */
export type VisibleKeysStore = {
  subscribe: (listener: () => void) => () => void;
  isVisible: (key: string) => boolean;
  setVisibleKeys: (keys: Iterable<string>) => void;
  setActive: (active: boolean) => void;
};

export const createVisibleKeysStore = (): VisibleKeysStore => {
  let visibleKeys = new Set<string>();
  let active = true;
  const listeners = new Set<() => void>();

  const emit = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  const sameKeys = (next: Set<string>): boolean => {
    if (next.size !== visibleKeys.size) {
      return false;
    }
    for (const key of next) {
      if (!visibleKeys.has(key)) {
        return false;
      }
    }
    return true;
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    isVisible(key) {
      return active && visibleKeys.has(key);
    },
    setVisibleKeys(keys) {
      const next = new Set(keys);
      if (sameKeys(next)) {
        return;
      }
      visibleKeys = next;
      emit();
    },
    setActive(nextActive) {
      if (nextActive === active) {
        return;
      }
      active = nextActive;
      emit();
    },
  };
};
