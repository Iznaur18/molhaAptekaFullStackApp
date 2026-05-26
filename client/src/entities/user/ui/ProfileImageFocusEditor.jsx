import { useCallback, useEffect, useRef, useState } from "react";

import {
  DEFAULT_USER_AVATAR_FOCUS,
  DEFAULT_USER_BACKGROUND_FOCUS,
  formatProfileImageObjectPosition,
  normalizeProfileImageFocus,
} from "../lib/profileImageFocus.js";
import { PROFILE_IMAGE_FOCUS_EDITOR_UI } from "../../../shared/config/appUiCopy.js";

import "./ProfileImageFocusEditor.css";

/**
 * @param {{
 *   imageUrl: string;
 *   variant: 'avatar' | 'background';
 *   value: import('../lib/profileImageFocus.js').ProfileImageFocus;
 *   onChange: (next: import('../lib/profileImageFocus.js').ProfileImageFocus) => void;
 *   disabled?: boolean;
 * }} props
 */
export function ProfileImageFocusEditor({
  imageUrl,
  variant,
  value,
  onChange,
  disabled = false,
}) {
  const frameRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  /** @type {import('react').MutableRefObject<{ pointerX: number; pointerY: number; focus: import('../lib/profileImageFocus.js').ProfileImageFocus } | null>} */
  const dragStartRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const fallbackFocus =
    variant === "avatar" ? DEFAULT_USER_AVATAR_FOCUS : DEFAULT_USER_BACKGROUND_FOCUS;
  const focus = normalizeProfileImageFocus(value, fallbackFocus);
  const objectPosition = formatProfileImageObjectPosition(focus);

  const focusFromClientPoint = useCallback((clientX, clientY) => {
    const frame = frameRef.current;
    if (!frame) return null;
    const rect = frame.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    return {
      x: Math.round(
        Math.min(
          100,
          Math.max(0, ((clientX - rect.left) / rect.width) * 100),
        ),
      ),
      y: Math.round(
        Math.min(
          100,
          Math.max(0, ((clientY - rect.top) / rect.height) * 100),
        ),
      ),
    };
  }, []);

  const updateFromDrag = useCallback(
    (clientX, clientY) => {
      const frame = frameRef.current;
      const start = dragStartRef.current;
      if (!frame || !start || disabled) return;
      const rect = frame.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const dx = clientX - start.pointerX;
      const dy = clientY - start.pointerY;
      onChange({
        x: Math.round(
          Math.min(100, Math.max(0, start.focus.x - (dx / rect.width) * 100)),
        ),
        y: Math.round(
          Math.min(100, Math.max(0, start.focus.y - (dy / rect.height) * 100)),
        ),
      });
    },
    [disabled, onChange],
  );

  const handlePointerDown = (event) => {
    if (disabled) return;
    event.preventDefault();
    const nextFocus = focusFromClientPoint(event.clientX, event.clientY);
    if (!nextFocus) return;
    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      focus: nextFocus,
    };
    onChange(nextFocus);
    setIsDragging(true);
    frameRef.current?.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (disabled || !isDragging) return;
    updateFromDrag(event.clientX, event.clientY);
  };

  const endDrag = useCallback((event) => {
    if (frameRef.current?.hasPointerCapture(event.pointerId)) {
      frameRef.current.releasePointerCapture(event.pointerId);
    }
    dragStartRef.current = null;
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isDragging || disabled) return undefined;

    const onDocumentPointerMove = (event) => {
      updateFromDrag(event.clientX, event.clientY);
    };
    const onDocumentPointerUp = (event) => {
      endDrag(event);
    };

    document.addEventListener("pointermove", onDocumentPointerMove);
    document.addEventListener("pointerup", onDocumentPointerUp);
    document.addEventListener("pointercancel", onDocumentPointerUp);

    return () => {
      document.removeEventListener("pointermove", onDocumentPointerMove);
      document.removeEventListener("pointerup", onDocumentPointerUp);
      document.removeEventListener("pointercancel", onDocumentPointerUp);
    };
  }, [disabled, endDrag, isDragging, updateFromDrag]);

  const handlePointerUp = (event) => {
    endDrag(event);
  };

  const frameClass =
    variant === "avatar"
      ? "profile-image-focus-editor__frame profile-image-focus-editor__frame_avatar"
      : "profile-image-focus-editor__frame profile-image-focus-editor__frame_background";

  const hint =
    variant === "avatar"
      ? PROFILE_IMAGE_FOCUS_EDITOR_UI.HINT_AVATAR
      : PROFILE_IMAGE_FOCUS_EDITOR_UI.HINT_BACKGROUND;

  return (
    <div className="profile-image-focus-editor">
      <p className="profile-image-focus-editor__label">{hint}</p>
      <div
        ref={frameRef}
        className={frameClass}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={hint}
        aria-disabled={disabled}
      >
        <img
          className="profile-image-focus-editor__img"
          src={imageUrl}
          alt=""
          draggable={false}
          style={{ objectPosition }}
        />
        <span
          className="profile-image-focus-editor__marker"
          style={{ left: `${focus.x}%`, top: `${focus.y}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
