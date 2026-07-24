/**
 * Копирует текст в буфер. Clipboard API только в secure context (https/localhost);
 * на LAN IP — fallback через execCommand.
 *
 * @param {string} text
 * @returns {Promise<void>}
 */
export async function copyTextToClipboard(text) {
  const value = String(text ?? "");
  if (!value) {
    throw new Error("Clipboard write failed");
  }

  const canUseClipboardApi =
    typeof window !== "undefined" &&
    window.isSecureContext === true &&
    typeof navigator !== "undefined" &&
    typeof navigator.clipboard?.writeText === "function";

  if (canUseClipboardApi) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // fall through to legacy
    }
  }

  copyTextViaExecCommand(value);
}

/**
 * @param {string} value
 */
function copyTextViaExecCommand(value) {
  if (typeof document === "undefined") {
    throw new Error("Clipboard write failed");
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.setAttribute("aria-hidden", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.width = "1px";
  textarea.style.height = "1px";
  textarea.style.padding = "0";
  textarea.style.border = "none";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);

  try {
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, value.length);
    const ok = document.execCommand("copy");
    if (!ok) {
      throw new Error("Clipboard write failed");
    }
  } finally {
    textarea.remove();
  }
}
