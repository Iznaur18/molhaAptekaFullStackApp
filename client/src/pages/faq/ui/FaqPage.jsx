import { useMemo, useState } from "react";

import { useFaqItemLinksQuery } from "../../../entities/faq-item-link/model/useFaqItemLinksQuery.js";
import { useAuthSession } from "../../../entities/user/model/useAuthSession.js";
import { USER_ROLE_ADMIN } from "../../../entities/user/model/userConstants.js";
import { FAQ_UI } from "../../../shared/config/appUiCopy.js";
import { AppIcon, ChevronDown, ChevronUp } from "../../../shared/ui/icon/index.js";
import { LEGAL_CONTACT_EMAIL } from "../../legal/model/legalSharedConstants.js";
import { FAQ_SECTIONS, FAQ_UPDATED_AT } from "../model/faqContent.js";

import { FaqItemLinkAdminField } from "./FaqItemLinkAdminField.jsx";

import "./FaqPage.css";

export function FaqPage() {
  const [expandedId, setExpandedId] = useState(/** @type {string | null} */ (null));
  const { currentUserRole, isSessionReady } = useAuthSession();
  const isAdmin = isSessionReady && currentUserRole === USER_ROLE_ADMIN;
  const linksQuery = useFaqItemLinksQuery();

  const linksByItemId = useMemo(() => {
    const map = new Map();
    for (const row of linksQuery.data?.links ?? []) {
      if (row.href) {
        map.set(row.itemId, row.href);
      }
    }
    return map;
  }, [linksQuery.data?.links]);

  return (
    <section className="faq-page">
      <h1 className="faq-page__title">{FAQ_UI.TITLE}</h1>
      <p className="faq-page__meta">
        {FAQ_UI.UPDATED_PREFIX} {FAQ_UPDATED_AT}
      </p>
      {linksQuery.isError ? (
        <p className="faq-page__links-error" role="alert">
          {linksQuery.error instanceof Error
            ? linksQuery.error.message
            : FAQ_UI.LINKS_LOAD_ERROR}
        </p>
      ) : null}

      <div className="faq-page__sections">
        {FAQ_SECTIONS.map((section) => (
          <section
            key={section.id}
            className="faq-page__section"
            aria-labelledby={`faq-section-${section.id}`}
          >
            <h2 id={`faq-section-${section.id}`} className="faq-page__section-title">
              {section.title}
            </h2>
            <ul className="faq-page__list">
              {section.items.map((item) => {
                const expanded = expandedId === item.id;
                const href = linksByItemId.get(item.id) ?? null;

                return (
                  <li
                    key={item.id}
                    className={[
                      "faq-page__item",
                      expanded ? "faq-page__item--expanded" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <button
                      type="button"
                      className="faq-page__question"
                      aria-expanded={expanded}
                      aria-label={FAQ_UI.QUESTION_ARIA(item.question)}
                      onClick={() =>
                        setExpandedId((current) =>
                          current === item.id ? null : item.id,
                        )
                      }
                    >
                      <span className="faq-page__question-text">{item.question}</span>
                      <AppIcon icon={expanded ? ChevronUp : ChevronDown} size={22} />
                    </button>
                    {expanded ? (
                      <div className="faq-page__answer-block">
                        <p className="faq-page__answer">{item.answer}</p>
                        {href ? (
                          <a
                            className="faq-page__link"
                            href={href}
                            {...(/^https?:\/\//i.test(href)
                              ? { target: "_blank", rel: "noopener noreferrer" }
                              : {})}
                            aria-label={FAQ_UI.LINK_ARIA(href)}
                          >
                            {FAQ_UI.LINK_OPEN}
                          </a>
                        ) : null}
                        {isAdmin ? (
                          <FaqItemLinkAdminField itemId={item.id} href={href} />
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <p className="faq-page__contact">
        {FAQ_UI.CONTACT_PREFIX}{" "}
        <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>
      </p>
    </section>
  );
}
