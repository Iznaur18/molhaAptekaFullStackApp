let lockCount = 0;
let savedOverflow = "";

/**
 * Блокирует скролл `body`. Вложенные вызовы безопасны (ref counter).
 *
 * @returns {() => void} unlock
 */
export function lockBodyScroll() {
  if (lockCount === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      document.body.style.overflow = savedOverflow;
    }
  };
}
