import "./ListPageFilterBar.css";

/**
 * @param {{ children: import('react').ReactNode; className?: string }} props
 */
export function ListPageFilterBar({ children, className = "" }) {
  return (
    <div
      className={["list-page-filter-bar", className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}

/**
 * @param {{
 *   label: string;
 *   children: import('react').ReactNode;
 *   className?: string;
 * }} props
 */
export function ListPageFilter({ label, children, className = "" }) {
  return (
    <label
      className={["list-page-filter-bar__label", className].filter(Boolean).join(" ")}
    >
      <span>{label}</span>
      {children}
    </label>
  );
}

/**
 * @param {import('react').SelectHTMLAttributes<HTMLSelectElement> & { className?: string }} props
 */
export function ListPageFilterSelect({ className = "", ...props }) {
  return (
    <select
      className={["list-page-filter-bar__control", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
