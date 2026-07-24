import { useState } from "react";

import { FAQ_UI } from "../../../shared/config/appUiCopy.js";
import { AppIcon, ChevronDown, ChevronUp } from "../../../shared/ui/icon/index.js";
import { LEGAL_CONTACT_EMAIL } from "../../legal/model/legalSharedConstants.js";
import { FAQ_ITEMS, FAQ_UPDATED_AT } from "../model/faqContent.js";

import "./FaqPage.css";

export function FaqPage() {
  const [expandedId, setExpandedId] = useState(/** @type {string | null} */ (null));

  return (
    <section className="faq-page">
      <h1 className="faq-page__title">{FAQ_UI.TITLE}</h1>
      <p className="faq-page__meta">
        {FAQ_UI.UPDATED_PREFIX} {FAQ_UPDATED_AT}
      </p>

      <ul className="faq-page__list">
        {FAQ_ITEMS.map((item) => {
          const expanded = expandedId === item.id;

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
                  setExpandedId((current) => (current === item.id ? null : item.id))
                }
              >
                <span className="faq-page__question-text">{item.question}</span>
                <AppIcon icon={expanded ? ChevronUp : ChevronDown} size={22} />
              </button>
              {expanded ? <p className="faq-page__answer">{item.answer}</p> : null}
            </li>
          );
        })}
      </ul>

      <p className="faq-page__contact">
        {FAQ_UI.CONTACT_PREFIX}{" "}
        <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>
      </p>
    </section>
  );
}
