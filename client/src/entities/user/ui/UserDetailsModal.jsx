import { useEffect } from 'react';

import { getUserProfileRows } from '../lib/getUserProfileRows.js';

import './UserDetailsModal.css';

function isAbsoluteHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {import('../model/types.js').UserPublicProfile} props.user
 */
export function UserDetailsModal({ isOpen, onClose, user }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const rows = getUserProfileRows(user);
  const title = user.userName ? `Профиль: ${user.userName}` : 'Профиль пользователя';

  return (
    <div className="user-details-modal__backdrop" role="presentation" onClick={onClose}>
      <div
        className="user-details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-details-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="user-details-modal__header">
          <h2 id="user-details-modal-title" className="user-details-modal__title">
            {title}
          </h2>
          <button type="button" className="user-details-modal__close" onClick={onClose}>
            Закрыть
          </button>
        </header>
        <dl className="user-details-modal__list">
          {rows.map((row) => (
            <div key={row.id} className="user-details-modal__row">
              <dt className="user-details-modal__label">{row.label}</dt>
              <dd className="user-details-modal__value">
                {isAbsoluteHttpUrl(row.value) ? (
                  <a href={row.value} target="_blank" rel="noreferrer">
                    {row.value}
                  </a>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
