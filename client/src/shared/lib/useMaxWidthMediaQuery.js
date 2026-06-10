import { useEffect, useState } from "react";

/**
 * @param {number} maxWidthPx
 * @returns {boolean}
 */
export function useMaxWidthMediaQuery(maxWidthPx) {
  const query = `(max-width: ${maxWidthPx}px)`;

  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    const handleChange = (event) => {
      setMatches(event.matches);
    };

    mediaQueryList.addEventListener("change", handleChange);
    setMatches(mediaQueryList.matches);

    return () => {
      mediaQueryList.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}
