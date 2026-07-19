import { useEffect, useState } from "react";

import { apiClient } from "../api/apiClient.js";
import { resolveImageUrlForDisplay } from "./resolveUploadedImageUrl.js";

const PRIVATE_UPLOAD_PATH_RE = /\/upload\/private\/([^?#/]+)/i;
const LOAD_FAILED_URL = "__private_upload_failed__";

/**
 * @param {unknown} raw
 * @returns {string | null}
 */
export function resolvePrivateUploadApiPath(raw) {
  const url = String(raw ?? "").trim();
  if (!url) {
    return null;
  }
  const match = url.match(PRIVATE_UPLOAD_PATH_RE);
  if (!match?.[1]) {
    return null;
  }
  return `/upload/private/${match[1]}`;
}

/**
 * @param {unknown} data
 * @returns {Promise<Blob>}
 */
async function coerceToImageBlob(data) {
  if (typeof Blob !== "undefined" && data instanceof Blob) {
    return data;
  }
  if (data instanceof ArrayBuffer) {
    return new Blob([data]);
  }
  if (ArrayBuffer.isView(data)) {
    return new Blob([data.buffer]);
  }
  throw new Error("Unexpected private upload payload");
}

/**
 * @param {Blob} blob
 * @returns {Promise<void>}
 */
async function assertImageBlob(blob) {
  const type = String(blob.type ?? "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (type.startsWith("image/")) {
    return;
  }
  if (type === "application/json" || type === "text/html" || type === "text/plain") {
    const text = await blob.text();
    throw new Error(text.slice(0, 200) || "Private upload rejected");
  }
  // sendFile иногда отдаёт octet-stream — всё равно пробуем как image
  if (!type || type === "application/octet-stream") {
    return;
  }
  throw new Error(`Unsupported private upload type: ${type}`);
}

/**
 * Private selfie needs auth — `<img src>` alone gets 401.
 * Returns object URL (revoke on cleanup) or public display URL for legacy `/uploads/`.
 * Sentinel `__private_upload_failed__` when fetch failed (UI shows error).
 *
 * @param {string | null | undefined} rawUrl
 * @returns {string}
 */
export function usePrivateUploadDisplayUrl(rawUrl) {
  const [displayUrl, setDisplayUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    /** @type {string | null} */
    let objectUrl = null;

    const privatePath = resolvePrivateUploadApiPath(rawUrl);
    if (!privatePath) {
      setDisplayUrl(rawUrl ? resolveImageUrlForDisplay(rawUrl) : "");
      return undefined;
    }

    setDisplayUrl("");

    void (async () => {
      try {
        const response = await apiClient.get(privatePath, {
          responseType: "blob",
          headers: {
            Accept: "image/*,application/octet-stream",
          },
          transformRequest: [
            (data, headers) => {
              if (headers && typeof headers.delete === "function") {
                headers.delete("Content-Type");
              } else if (headers && typeof headers === "object") {
                delete headers["Content-Type"];
              }
              return data;
            },
          ],
        });
        if (cancelled) {
          return;
        }
        const blob = await coerceToImageBlob(response.data);
        await assertImageBlob(blob);
        const imageBlob =
          blob.type && blob.type.startsWith("image/")
            ? blob
            : new Blob([blob], { type: "image/jpeg" });
        objectUrl = URL.createObjectURL(imageBlob);
        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          objectUrl = null;
          return;
        }
        setDisplayUrl(objectUrl);
      } catch {
        if (!cancelled) {
          setDisplayUrl(LOAD_FAILED_URL);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [rawUrl]);

  return displayUrl;
}

export const PRIVATE_UPLOAD_LOAD_FAILED = LOAD_FAILED_URL;
