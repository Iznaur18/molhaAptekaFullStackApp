import { useState } from "react";

import { UserPremiumAvatar } from "../../../entities/user/ui/UserPremiumAvatar.jsx";
import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";

import "./LinkedAccountAvatar.css";

/**
 * Аватар аккаунта из списка; без фото (или если не загрузилось) — первая буква ника.
 *
 * @param {{
 *   name: string;
 *   avatarUrl: string | null;
 *   isPremium: boolean;
 *   className?: string;
 * }} props
 */
export function LinkedAccountAvatar({ name, avatarUrl, isPremium, className = "" }) {
  const [failed, setFailed] = useState(false);
  if (avatarUrl && !failed) {
    return (
      <UserPremiumAvatar
        className={`linked-account-avatar ${className}`.trim()}
        src={resolveUploadedImageUrl(avatarUrl)}
        isPremium={isPremium}
        width={30}
        height={30}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <span
      className={`linked-account-avatar linked-account-avatar_letter ${className}`.trim()}
      aria-hidden="true"
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
