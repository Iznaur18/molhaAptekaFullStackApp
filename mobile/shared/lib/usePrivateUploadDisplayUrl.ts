import { useEffect, useState } from "react";

import { apiClient } from "@/shared/api/apiClient";
import { getAccessToken } from "@/shared/api/mobile-auth-storage";
import { API_BASE_URL } from "@/shared/config";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";

const PRIVATE_UPLOAD_PATH_RE = /\/upload\/private\/([^?#/]+)/i;

export type PrivateUploadDisplayState = {
  status: "idle" | "loading" | "ready" | "error";
  url: string;
  error: string;
};

const INITIAL_STATE: PrivateUploadDisplayState = {
  status: "idle",
  url: "",
  error: "",
};

const bytesToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return globalThis.btoa(binary);
};

const assertImageMagicBytes = (buffer: ArrayBuffer): void => {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 4) {
    throw new Error("Пустой ответ вместо изображения");
  }
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47;
  const isGif = bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46;
  const isWebp =
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46;
  if (!isJpeg && !isPng && !isGif && !isWebp) {
    throw new Error("Ответ сервера не является изображением");
  }
};

const resolveMimeFromBuffer = (buffer: ArrayBuffer, headerMime: string): string => {
  const bytes = new Uint8Array(buffer);
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    return "image/jpeg";
  }
  if (bytes[0] === 0x89 && bytes[1] === 0x50) {
    return "image/png";
  }
  if (bytes[0] === 0x47 && bytes[1] === 0x49) {
    return "image/gif";
  }
  if (bytes[0] === 0x52 && bytes[1] === 0x49) {
    return "image/webp";
  }
  if (headerMime.startsWith("image/")) {
    return headerMime;
  }
  return "image/jpeg";
};

/**
 * @param {unknown} raw
 */
export const resolvePrivateUploadApiPath = (raw: unknown): string | null => {
  const url = String(raw ?? "").trim();
  if (!url) {
    return null;
  }
  const match = url.match(PRIVATE_UPLOAD_PATH_RE);
  if (!match?.[1]) {
    return null;
  }
  return `/upload/private/${match[1]}`;
};

const fetchPrivateUploadBuffer = async (
  privatePath: string,
): Promise<{ buffer: ArrayBuffer; mime: string }> => {
  if (!API_BASE_URL) {
    throw new Error("Не задан EXPO_PUBLIC_API_URL");
  }

  const requestOnce = async (): Promise<Response> => {
    const token = await getAccessToken();
    return fetch(`${API_BASE_URL}${privatePath}`, {
      method: "GET",
      headers: {
        Accept: "image/*,application/octet-stream",
        "X-Auth-Client": "mobile",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  };

  let response = await requestOnce();
  if (response.status === 401) {
    try {
      await apiClient.get("/auth/me");
    } catch {
      // refresh interceptor в apiClient; ниже повторим fetch
    }
    response = await requestOnce();
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const headerMime = String(response.headers.get("content-type") ?? "")
    .split(";")[0]
    ?.trim()
    .toLowerCase();
  if (
    headerMime === "application/json" ||
    headerMime === "text/html" ||
    headerMime === "text/plain"
  ) {
    throw new Error("Сервер вернул не изображение");
  }

  const buffer = await response.arrayBuffer();
  assertImageMagicBytes(buffer);
  return {
    buffer,
    mime: resolveMimeFromBuffer(buffer, headerMime || "image/jpeg"),
  };
};

/**
 * Private selfie: bearer fetch → data URL (без blob:/revoke гонок в Strict Mode).
 */
export const usePrivateUploadDisplayUrl = (
  rawUrl: string | null | undefined,
): PrivateUploadDisplayState => {
  const [state, setState] = useState<PrivateUploadDisplayState>(INITIAL_STATE);

  useEffect(() => {
    let cancelled = false;

    const privatePath = resolvePrivateUploadApiPath(rawUrl);
    if (!privatePath) {
      const legacyUrl = rawUrl ? resolveUploadedMediaUrl(rawUrl) : "";
      setState(
        legacyUrl
          ? { status: "ready", url: legacyUrl, error: "" }
          : INITIAL_STATE,
      );
      return undefined;
    }

    setState({ status: "loading", url: "", error: "" });

    void (async () => {
      try {
        const { buffer, mime } = await fetchPrivateUploadBuffer(privatePath);
        if (cancelled) {
          return;
        }
        setState({
          status: "ready",
          url: `data:${mime};base64,${bytesToBase64(buffer)}`,
          error: "",
        });
      } catch (error) {
        if (cancelled) {
          return;
        }
        setState({
          status: "error",
          url: "",
          error: error instanceof Error ? error.message : "Ошибка загрузки",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [rawUrl]);

  return state;
};

/** @deprecated use state.status === 'error' */
export const PRIVATE_UPLOAD_LOAD_FAILED = "__private_upload_failed__";
