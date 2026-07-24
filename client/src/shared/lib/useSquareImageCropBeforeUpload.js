import { useCallback, useState } from "react";

/**
 * Promise-мост: выбор файла → модалка кропа → File | null (cancel).
 *
 * @returns {{
 *   cropFile: File | null;
 *   transformFileBeforeUpload: (file: File) => Promise<File | null>;
 *   handleCropConfirm: (croppedFile: File) => void;
 *   handleCropCancel: () => void;
 * }}
 */
export function useSquareImageCropBeforeUpload() {
  const [session, setSession] = useState(
    /** @type {{ file: File; resolve: (file: File | null) => void } | null} */ (null),
  );

  const transformFileBeforeUpload = useCallback((file) => {
    return new Promise((resolve) => {
      setSession({ file, resolve });
    });
  }, []);

  const handleCropConfirm = useCallback((croppedFile) => {
    setSession((prev) => {
      prev?.resolve(croppedFile);
      return null;
    });
  }, []);

  const handleCropCancel = useCallback(() => {
    setSession((prev) => {
      prev?.resolve(null);
      return null;
    });
  }, []);

  return {
    cropFile: session?.file ?? null,
    transformFileBeforeUpload,
    handleCropConfirm,
    handleCropCancel,
  };
}
