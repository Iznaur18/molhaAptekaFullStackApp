import { useCallback, useEffect, useRef, useState } from "react";

import { downloadProductBulkImportTemplate } from "../api/downloadProductBulkImportTemplate.js";
import { fetchProductBulkImportJob } from "../api/fetchProductBulkImportJob.js";
import { submitProductBulkImport } from "../api/submitProductBulkImport.js";

const POLL_INTERVAL_MS = 1500;

/**
 * @typedef {"idle" | "validating" | "processing" | "completed" | "failed" | "validation_failed"} BulkImportPhase
 */

/**
 * @param {{
 *   isOpen: boolean;
 *   onCompleted?: () => void;
 * }} params
 */
export function useProductBulkImport({ isOpen, onCompleted }) {
  const [phase, setPhase] = useState(/** @type {BulkImportPhase} */ ("idle"));
  const [selectedFile, setSelectedFile] = useState(/** @type {File | null} */ (null));
  const [validationErrors, setValidationErrors] = useState(
    /** @type {Array<{ row: number; field: string; message: string }>} */ ([]),
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [jobId, setJobId] = useState("");
  const [totalRows, setTotalRows] = useState(0);
  const [processedRows, setProcessedRows] = useState(0);
  const [createdCount, setCreatedCount] = useState(0);
  const pollTimerRef = useRef(/** @type {ReturnType<typeof setInterval> | null} */ (null));

  const clearPollTimer = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearPollTimer();
    setPhase("idle");
    setSelectedFile(null);
    setValidationErrors([]);
    setErrorMessage("");
    setJobId("");
    setTotalRows(0);
    setProcessedRows(0);
    setCreatedCount(0);
  }, [clearPollTimer]);

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  useEffect(() => () => clearPollTimer(), [clearPollTimer]);

  const pollJob = useCallback(
    async (nextJobId) => {
      try {
        const status = await fetchProductBulkImportJob(nextJobId);
        setProcessedRows(status.processedRows);
        setTotalRows(status.totalRows);
        setCreatedCount(status.createdCount);

        if (status.status === "completed") {
          clearPollTimer();
          setPhase("completed");
          onCompleted?.();
          return;
        }

        if (status.status === "failed") {
          clearPollTimer();
          setPhase("failed");
          setErrorMessage(status.errorMessage || "Импорт не завершён");
        }
      } catch (error) {
        clearPollTimer();
        setPhase("failed");
        setErrorMessage(error instanceof Error ? error.message : "Импорт не завершён");
      }
    },
    [clearPollTimer, onCompleted],
  );

  const startPolling = useCallback(
    (nextJobId) => {
      clearPollTimer();
      pollTimerRef.current = setInterval(() => {
        void pollJob(nextJobId);
      }, POLL_INTERVAL_MS);
      void pollJob(nextJobId);
    },
    [clearPollTimer, pollJob],
  );

  const handleDownloadTemplate = useCallback(async () => {
    setErrorMessage("");
    try {
      await downloadProductBulkImportTemplate();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Не удалось скачать шаблон");
    }
  }, []);

  const handlePickFile = useCallback((file) => {
    setSelectedFile(file ?? null);
    setValidationErrors([]);
    setErrorMessage("");
    setPhase("idle");
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedFile) {
      return;
    }

    setPhase("validating");
    setValidationErrors([]);
    setErrorMessage("");

    try {
      const result = await submitProductBulkImport(selectedFile);
      if (!result.ok) {
        setPhase("validation_failed");
        setValidationErrors(result.errors);
        setErrorMessage(result.message);
        return;
      }

      setJobId(result.jobId);
      setTotalRows(result.totalRows);
      setProcessedRows(0);
      setPhase("processing");
      startPolling(result.jobId);
    } catch (error) {
      setPhase("failed");
      setErrorMessage(error instanceof Error ? error.message : "Не удалось импортировать товары");
    }
  }, [selectedFile, startPolling]);

  const isBusy = phase === "validating" || phase === "processing";

  return {
    phase,
    selectedFile,
    validationErrors,
    errorMessage,
    totalRows,
    processedRows,
    createdCount,
    jobId,
    isBusy,
    handleDownloadTemplate,
    handlePickFile,
    handleSubmit,
    reset,
  };
}
