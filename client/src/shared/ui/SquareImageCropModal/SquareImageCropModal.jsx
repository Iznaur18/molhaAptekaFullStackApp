import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { SQUARE_IMAGE_CROP_UI } from "../../config/appUiCopy.js";
import {
  computeMaxPanOffset,
  computeSquareCropFromViewport,
  cropSquareImageToFile,
} from "../../lib/cropSquareImageFromViewport.js";

import "./SquareImageCropModal.css";

const FRAME_SIZE_PX = 280;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.05;
const OUTPUT_SIZE_PX = 1024;

/**
 * @param {{
 *   file: File | null;
 *   onConfirm: (croppedFile: File) => void;
 *   onCancel: () => void;
 * }} props
 */
export function SquareImageCropModal({ file, onConfirm, onCancel }) {
  const frameRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const imageRef = useRef(/** @type {HTMLImageElement | null} */ (null));
  const dragRef = useRef(
    /** @type {{ pointerX: number; pointerY: number; offsetX: number; offsetY: number } | null} */ (
      null
    ),
  );

  const [objectUrl, setObjectUrl] = useState("");
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!file) {
      setObjectUrl("");
      return undefined;
    }
    const nextUrl = URL.createObjectURL(file);
    setObjectUrl(nextUrl);
    setZoom(MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
    setImageSize({ width: 0, height: 0 });
    setErrorMessage("");
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  const clampOffset = useCallback(
    (nextX, nextY, nextZoom = zoom) => {
      const { maxX, maxY } = computeMaxPanOffset(
        imageSize.width,
        imageSize.height,
        FRAME_SIZE_PX,
        nextZoom,
      );
      return {
        x: Math.min(maxX, Math.max(-maxX, nextX)),
        y: Math.min(maxY, Math.max(-maxY, nextY)),
      };
    },
    [imageSize.height, imageSize.width, zoom],
  );

  const handleImageLoad = (event) => {
    const image = event.currentTarget;
    setImageSize({
      width: image.naturalWidth,
      height: image.naturalHeight,
    });
  };

  const handlePointerDown = (event) => {
    if (!imageSize.width || isExporting) return;
    event.preventDefault();
    dragRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
    setIsDragging(true);
    frameRef.current?.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const start = dragRef.current;
    if (!start || !isDragging) return;
    const next = clampOffset(
      start.offsetX + (event.clientX - start.pointerX),
      start.offsetY + (event.clientY - start.pointerY),
    );
    setOffset(next);
  };

  const endDrag = (event) => {
    if (frameRef.current?.hasPointerCapture(event.pointerId)) {
      frameRef.current.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    setIsDragging(false);
  };

  const handleZoomChange = (event) => {
    const nextZoom = Number(event.target.value);
    setZoom(nextZoom);
    setOffset((prev) => clampOffset(prev.x, prev.y, nextZoom));
  };

  const handleConfirm = async () => {
    const image = imageRef.current;
    if (!image || !imageSize.width || isExporting) return;

    setIsExporting(true);
    setErrorMessage("");
    try {
      const crop = computeSquareCropFromViewport({
        imageWidth: imageSize.width,
        imageHeight: imageSize.height,
        frameSize: FRAME_SIZE_PX,
        zoom,
        offsetX: offset.x,
        offsetY: offset.y,
      });
      const croppedFile = await cropSquareImageToFile(image, crop, {
        outputSize: OUTPUT_SIZE_PX,
        mimeType: file?.type?.startsWith("image/") ? file.type : "image/jpeg",
        fileName: buildCropFileName(file?.name),
      });
      onConfirm(croppedFile);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : SQUARE_IMAGE_CROP_UI.ERROR_GENERIC,
      );
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (!file) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !isExporting) onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [file, isExporting, onCancel]);

  if (!file || !objectUrl) return null;

  const coverScale =
    imageSize.width > 0
      ? Math.max(FRAME_SIZE_PX / imageSize.width, FRAME_SIZE_PX / imageSize.height)
      : 1;
  const scale = coverScale * zoom;

  return createPortal(
    <div className="square-image-crop-modal" role="dialog" aria-modal="true" aria-label={SQUARE_IMAGE_CROP_UI.TITLE}>
      <div className="square-image-crop-modal__backdrop" aria-hidden="true" />
      <div className="square-image-crop-modal__card">
        <h2 className="square-image-crop-modal__title">{SQUARE_IMAGE_CROP_UI.TITLE}</h2>
        <p className="square-image-crop-modal__hint">{SQUARE_IMAGE_CROP_UI.HINT}</p>

        <div
          ref={frameRef}
          className={
            isDragging
              ? "square-image-crop-modal__frame square-image-crop-modal__frame_dragging"
              : "square-image-crop-modal__frame"
          }
          style={{ width: FRAME_SIZE_PX, height: FRAME_SIZE_PX }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onWheel={(event) => {
            event.preventDefault();
            const delta = event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
            const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom + delta));
            setZoom(nextZoom);
            setOffset((prev) => clampOffset(prev.x, prev.y, nextZoom));
          }}
          role="presentation"
        >
          <img
            ref={imageRef}
            className="square-image-crop-modal__image"
            src={objectUrl}
            alt=""
            draggable={false}
            onLoad={handleImageLoad}
            style={{
              width: imageSize.width ? imageSize.width * scale : "100%",
              height: imageSize.height ? imageSize.height * scale : "100%",
              transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
            }}
          />
          <span className="square-image-crop-modal__mask" aria-hidden="true" />
        </div>

        <label className="square-image-crop-modal__zoom">
          <span>{SQUARE_IMAGE_CROP_UI.ZOOM}</span>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={ZOOM_STEP}
            value={zoom}
            onChange={handleZoomChange}
            disabled={isExporting || !imageSize.width}
          />
        </label>

        {errorMessage ? (
          <p className="square-image-crop-modal__error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <div className="square-image-crop-modal__actions">
          <button
            type="button"
            className="square-image-crop-modal__cancel"
            onClick={onCancel}
            disabled={isExporting}
          >
            {SQUARE_IMAGE_CROP_UI.CANCEL}
          </button>
          <button
            type="button"
            className="square-image-crop-modal__confirm"
            onClick={() => void handleConfirm()}
            disabled={isExporting || !imageSize.width}
          >
            {isExporting ? SQUARE_IMAGE_CROP_UI.CONFIRM_LOADING : SQUARE_IMAGE_CROP_UI.CONFIRM}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * @param {string | undefined} name
 */
function buildCropFileName(name) {
  const base = typeof name === "string" && name.trim() ? name.trim() : "avatar.jpg";
  const dot = base.lastIndexOf(".");
  if (dot <= 0) return `avatar-crop-${base}`;
  return `avatar-crop${base.slice(dot)}`;
}
