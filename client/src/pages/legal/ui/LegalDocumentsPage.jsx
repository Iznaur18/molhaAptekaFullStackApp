import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { LEGAL_UI } from "../../../shared/config/appUiCopy.js";
import {
  LEGAL_DOCUMENT_PRESETS,
  LEGAL_DOCUMENT_TABS,
} from "../model/legalDocumentPresets.js";

import "./LegalDocumentsPage.css";

const VALID_KINDS = new Set(Object.keys(LEGAL_DOCUMENT_PRESETS));

/**
 * @param {string | undefined} kindParam
 * @returns {import("../model/legalDocumentPresets.js").LegalDocumentKind}
 */
function resolveKind(kindParam) {
  if (kindParam && VALID_KINDS.has(kindParam)) {
    return /** @type {import("../model/legalDocumentPresets.js").LegalDocumentKind} */ (
      kindParam
    );
  }
  return "terms";
}

export function LegalDocumentsPage() {
  const { kind: kindParam } = useParams();
  const navigate = useNavigate();
  const [activeKind, setActiveKind] = useState(() => resolveKind(kindParam));
  const document = LEGAL_DOCUMENT_PRESETS[activeKind];

  useEffect(() => {
    setActiveKind(resolveKind(kindParam));
  }, [kindParam]);

  const handleKindChange = (kind) => {
    setActiveKind(kind);
    navigate(`/legal/${kind}`, { replace: true });
  };

  return (
    <section className="legal-docs-page">
      <div className="legal-docs-page__tabs" role="tablist" aria-label={LEGAL_UI.TERMS_TITLE}>
        {LEGAL_DOCUMENT_TABS.map((tab) => {
          const isActive = tab.id === activeKind;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={[
                "legal-docs-page__tab",
                isActive ? "legal-docs-page__tab--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleKindChange(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <h1 className="legal-docs-page__title">{document.title}</h1>
      <p className="legal-docs-page__meta">
        {LEGAL_UI.UPDATED_PREFIX} {document.updatedAt}
      </p>
      <p className="legal-docs-page__operator">{document.operatorPlaceholder}</p>

      {document.sections.map((section) => (
        <section key={section.title} className="legal-docs-page__section">
          <h2 className="legal-docs-page__section-title">{section.title}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="legal-docs-page__paragraph">
              {paragraph}
            </p>
          ))}
        </section>
      ))}

      <p className="legal-docs-page__contact">
        {LEGAL_UI.CONTACT_PREFIX}{" "}
        <a href={`mailto:${document.contactEmail}`}>{document.contactEmail}</a>
      </p>
    </section>
  );
}
