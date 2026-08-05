import { parseProductDescriptionBlocks } from "@izibuy/shared-lib";

import "./ProductDescriptionContent.css";

/**
 * @param {{ text: string; className?: string }} props
 */
export function ProductDescriptionContent({ text, className = "" }) {
  const blocks = parseProductDescriptionBlocks(text);
  if (blocks.length === 0) {
    return null;
  }

  return (
    <div
      className={["product-description-content", className].filter(Boolean).join(" ")}
    >
      {blocks.map((block, index) =>
        block.type === "h1" ? (
          <h2 key={`h1-${index}`} className="product-description-content__h1">
            {block.text}
          </h2>
        ) : (
          <p key={`p-${index}`} className="product-description-content__p">
            {block.text}
          </p>
        ),
      )}
    </div>
  );
}
