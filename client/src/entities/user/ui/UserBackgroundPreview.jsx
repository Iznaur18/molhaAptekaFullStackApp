import { formatProfileImageObjectPosition } from "../lib/profileImageFocus.js";
import { resolveUserProfileBackground } from "../lib/userBackgroundValue.js";

import "./UserBackgroundPreview.css";

/**
 * @param {{
 *   presetId: string;
 *   imageUrl: string;
 *   mode: 'preset' | 'image' | 'admin';
 *   focus?: import('../lib/profileImageFocus.js').ProfileImageFocus;
 * }} props
 */
export function UserBackgroundPreview({ presetId, imageUrl, mode, focus }) {
  let resolved;
  try {
    if (mode === "image") {
      resolved = resolveUserProfileBackground({
        kind: "image",
        imageUrl,
      });
    } else if (mode === "admin") {
      const url = String(imageUrl ?? "").trim();
      if (/^https?:\/\//i.test(url)) {
        resolved = resolveUserProfileBackground({ kind: "image", imageUrl: url });
      } else {
        resolved = resolveUserProfileBackground({ kind: "preset", presetId });
      }
    } else {
      resolved = resolveUserProfileBackground({ kind: "preset", presetId });
    }
  } catch {
    resolved = resolveUserProfileBackground({
      kind: "preset",
      presetId: "mist",
    });
  }

  if (resolved.kind === "image") {
    return (
      <div
        className="user-background-preview user-background-preview_image"
        aria-hidden="true"
      >
        <img
          className="user-background-preview__img"
          src={resolved.url}
          alt=""
          loading="lazy"
          decoding="async"
          style={{
            objectPosition: formatProfileImageObjectPosition(focus),
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="user-background-preview user-background-preview_preset"
      style={{ backgroundColor: resolved.color }}
      aria-hidden="true"
    />
  );
}
