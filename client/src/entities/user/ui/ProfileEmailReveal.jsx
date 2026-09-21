import { useState } from "react";

import { USER_PROFILE_COPY } from "../../../shared/config/appUiCopy.js";
import { fetchUserEmail } from "../api/fetchUserEmail.js";

/**
 * Почта в чужом профиле: в самом профиле её нет, только кнопка. Так же, как
 * с телефоном, — чтобы адреса нельзя было собрать обходом профилей.
 *
 * @param {{ userId: string | null }} props
 */
export function ProfileEmailReveal({ userId }) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  if (email) {
    return (
      <a className="user-profile-info__detail-link" href={`mailto:${email}`}>
        {email}
      </a>
    );
  }

  return (
    <span className="user-profile-info__reveal-wrap">
      <button
        type="button"
        className="user-profile-info__reveal-phone"
        disabled={pending}
        onClick={async () => {
          if (!userId) {
            setError(USER_PROFILE_COPY.SHOW_EMAIL_ERROR);
            return;
          }
          setPending(true);
          setError("");
          try {
            setEmail(await fetchUserEmail(userId));
          } catch (caught) {
            setError(
              caught instanceof Error
                ? caught.message
                : USER_PROFILE_COPY.SHOW_EMAIL_ERROR,
            );
          } finally {
            setPending(false);
          }
        }}
      >
        {pending
          ? USER_PROFILE_COPY.SHOW_PHONE_NUMBER_PENDING
          : USER_PROFILE_COPY.SHOW_EMAIL}
      </button>
      {error ? (
        <span className="user-profile-info__reveal-error" role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}
