/** @typedef {{ id: string; container: HTMLElement; previousFocus: Element | null }} ModalFocusLayer */

/** @type {ModalFocusLayer[]} */
const layers = [];

/**
 * @param {string} id
 * @param {HTMLElement} container
 * @param {Element | null} previousFocus
 */
export function pushModalFocusLayer(id, container, previousFocus) {
  layers.push({ id, container, previousFocus });
}

/**
 * @param {string} id
 * @returns {ModalFocusLayer | null}
 */
export function popModalFocusLayer(id) {
  const index = layers.findLastIndex((layer) => layer.id === id);
  if (index < 0) {
    return null;
  }

  const [removed] = layers.splice(index, 1);
  return removed;
}

/**
 * @returns {ModalFocusLayer | null}
 */
export function getTopModalFocusLayer() {
  return layers.at(-1) ?? null;
}
