"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PhotoIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Modal from "@/ui/Modal";
import SubmitButtun from "@/ui/SubmitButtun";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function formatFileSize(bytes) {
  if (!bytes) return "۰ کیلوبایت";
  return `${(bytes / 1024).toLocaleString("fa-IR", { maximumFractionDigits: 0 })} کیلوبایت`;
}

function clampOffset(value, renderedSize, frameSize) {
  const limit = Math.max(0, (renderedSize - frameSize) / 2);
  return Math.max(-limit, Math.min(limit, value));
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("ساخت تصویر برش‌خورده انجام نشد. دوباره تلاش کنید."));
    }, "image/jpeg", quality);
  });
}

export default function ImageCropDialog({
  open,
  onClose,
  onConfirm,
  title = "تنظیم تصویر",
  aspect = 1,
  busy = false,
  helpText = "تصویر را انتخاب کنید، سپس جای آن را تنظیم کنید.",
}) {
  const inputRef = useRef(null);
  const frameRef = useRef(null);
  const resizeHandlerRef = useRef(null);
  const dragRef = useRef(null);
  const [file, setFile] = useState(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [imageSize, setImageSize] = useState(null);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const attachFrame = useCallback((node) => {
    if (resizeHandlerRef.current) {
      window.removeEventListener("resize", resizeHandlerRef.current);
      resizeHandlerRef.current = null;
    }
    frameRef.current = node;
    if (!node) {
      setFrameSize({ width: 0, height: 0 });
      return;
    }

    const measure = () => {
      const nextSize = { width: node.clientWidth, height: node.clientHeight };
      setFrameSize((current) => (
        current.width === nextSize.width && current.height === nextSize.height
          ? current
          : nextSize
      ));
    };
    measure();
    resizeHandlerRef.current = measure;
    window.addEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (!open) return;
    setFile(null);
    setSourceUrl("");
    setImageSize(null);
    setFrameSize({ width: 0, height: 0 });
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setError("");
    setProcessing(false);
  }, [open]);

  useEffect(() => {
    if (!sourceUrl) return undefined;
    return () => URL.revokeObjectURL(sourceUrl);
  }, [sourceUrl]);

  function selectFile(selected) {
    if (!selected) return;
    setError("");
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setError("فرمت تصویر معتبر نیست. فایل JPG، PNG، WebP یا GIF انتخاب کنید.");
      return;
    }
    if (selected.size > MAX_IMAGE_BYTES) {
      setError("حجم تصویر باید حداکثر ۲ مگابایت باشد.");
      return;
    }

    setSourceUrl(URL.createObjectURL(selected));
    setFile(selected);
    setImageSize(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }

  function handlePointerDown(event) {
    if (!imageSize || busy || processing) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, offset };
  }

  function handlePointerMove(event) {
    if (!dragRef.current || !imageSize || !frameRef.current) return;
    const frame = frameRef.current;
    const baseScale = Math.max(
      frame.clientWidth / imageSize.width,
      frame.clientHeight / imageSize.height,
    ) * zoom;
    setOffset({
      x: clampOffset(
        dragRef.current.offset.x + event.clientX - dragRef.current.x,
        imageSize.width * baseScale,
        frame.clientWidth,
      ),
      y: clampOffset(
        dragRef.current.offset.y + event.clientY - dragRef.current.y,
        imageSize.height * baseScale,
        frame.clientHeight,
      ),
    });
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  function handleZoomChange(event) {
    const nextZoom = Number(event.target.value);
    setZoom(nextZoom);
    if (!imageSize || !frameRef.current) return;
    const frame = frameRef.current;
    const nextScale = Math.max(
      frame.clientWidth / imageSize.width,
      frame.clientHeight / imageSize.height,
    ) * nextZoom;
    setOffset((current) => ({
      x: clampOffset(current.x, imageSize.width * nextScale, frame.clientWidth),
      y: clampOffset(current.y, imageSize.height * nextScale, frame.clientHeight),
    }));
  }

  async function createCroppedFile() {
    const frame = frameRef.current;
    if (!file || !sourceUrl || !imageSize || !frame) {
      throw new Error("ابتدا یک تصویر انتخاب کنید.");
    }

    const image = new window.Image();
    image.src = sourceUrl;
    await image.decode();

    const frameWidth = frame.clientWidth;
    const frameHeight = frame.clientHeight;
    const cropScale = Math.max(
      frameWidth / imageSize.width,
      frameHeight / imageSize.height,
    ) * zoom;
    const imageLeft = (frameWidth - imageSize.width * cropScale) / 2 + offset.x;
    const imageTop = (frameHeight - imageSize.height * cropScale) / 2 + offset.y;
    const sourceX = Math.max(0, Math.min(imageSize.width, -imageLeft / cropScale));
    const sourceY = Math.max(0, Math.min(imageSize.height, -imageTop / cropScale));
    const sourceWidth = Math.min(imageSize.width - sourceX, frameWidth / cropScale);
    const sourceHeight = Math.min(imageSize.height - sourceY, frameHeight / cropScale);

    let outputWidth = aspect > 1 ? 1440 : 900;
    let outputHeight = Math.round(outputWidth / aspect);
    let blob;
    while (outputWidth >= 480) {
      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("مرورگر امکان پردازش تصویر را فراهم نکرد.");
      context.fillStyle = "#fff";
      context.fillRect(0, 0, outputWidth, outputHeight);
      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        outputWidth,
        outputHeight,
      );

      for (const quality of [0.9, 0.82, 0.74, 0.66, 0.58, 0.5]) {
        blob = await canvasToBlob(canvas, quality);
        if (blob.size <= MAX_IMAGE_BYTES) break;
      }
      if (blob.size <= MAX_IMAGE_BYTES) break;
      outputWidth = Math.floor(outputWidth * 0.82);
      outputHeight = Math.round(outputWidth / aspect);
    }

    if (!blob || blob.size > MAX_IMAGE_BYTES) {
      throw new Error("حجم تصویر پس از برش هنوز بیشتر از ۲ مگابایت است.");
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${baseName}-cropped.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  }

  async function confirmCrop() {
    if (!file || busy || processing) return;
    setProcessing(true);
    setError("");
    try {
      const croppedFile = await createCroppedFile();
      await onConfirm(croppedFile);
    } catch (cropError) {
      setError(cropError.message || "پردازش تصویر انجام نشد. دوباره تلاش کنید.");
    } finally {
      setProcessing(false);
    }
  }

  if (!open) return null;

  return (
    <Modal
      title={title}
      description={helpText}
      onClose={onClose}
      closeDisabled={busy || processing}
      size="lg"
      className="image-crop-dialog"
    >
      <div className="image-crop-guidance" role="note">
        <PhotoIcon aria-hidden="true" />
        <div>
          <strong>راهنمای انتخاب تصویر</strong>
          <p>{helpText} حجم فایل اصلی باید حداکثر ۲ مگابایت باشد.</p>
        </div>
      </div>

      {!sourceUrl ? (
        <button
          type="button"
          className="image-crop-dropzone"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            selectFile(event.dataTransfer.files?.[0]);
          }}
          disabled={busy || processing}
        >
          <span className="image-crop-plus"><PlusIcon aria-hidden="true" /></span>
          <strong>بارگذاری تصویر</strong>
          <span>یا تصویر را اینجا بکشید و رها کنید</span>
          <small>JPG، PNG، WebP یا GIF · حداکثر ۲ مگابایت</small>
        </button>
      ) : (
        <div className="image-crop-workspace">
          <div
            ref={attachFrame}
            className="image-crop-frame"
            style={{ aspectRatio: String(aspect), width: `min(100%, ${aspect > 1 ? 36 : 24}rem)` }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              selectFile(event.dataTransfer.files?.[0]);
            }}
          >
            {imageSize && frameSize.width > 0 && frameSize.height > 0 && (
              <img
                className="image-crop-source"
                src={sourceUrl}
                alt="پیش‌نمایش تصویر برای برش"
                draggable="false"
                style={{
                  width: `${imageSize.width * Math.max(frameSize.width / imageSize.width, frameSize.height / imageSize.height)}px`,
                  height: `${imageSize.height * Math.max(frameSize.width / imageSize.width, frameSize.height / imageSize.height)}px`,
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                }}
              />
            )}
            {(!imageSize || !frameSize.width || !frameSize.height) && (
              <img
                className="image-crop-source image-crop-source-measuring"
                src={sourceUrl}
                alt=""
                onLoad={(event) => setImageSize({
                  width: event.currentTarget.naturalWidth,
                  height: event.currentTarget.naturalHeight,
                })}
              />
            )}
            <span className="image-crop-frame-hint">برای تنظیم، تصویر را بکشید</span>
          </div>

          <label className="image-crop-zoom">
            <span>بزرگ‌نمایی</span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={handleZoomChange}
              disabled={busy || processing || !imageSize}
            />
            <span>{Math.round(zoom * 100).toLocaleString("fa-IR")}٪</span>
          </label>

          <div className="image-crop-file-info">
            <span>حجم تصویر انتخاب‌شده: <strong>{formatFileSize(file.size)}</strong></span>
            <span>حجم تصویر نهایی: حداکثر ۲ مگابایت</span>
          </div>
          <button
            type="button"
            className="image-crop-reselect"
            onClick={() => inputRef.current?.click()}
            disabled={busy || processing}
          >
            <XMarkIcon aria-hidden="true" /> انتخاب تصویر دیگر
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        className="image-crop-file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(event) => {
          selectFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {error && <p className="image-crop-error" role="alert">{error}</p>}

      <footer className="image-crop-actions">
        <button
          type="button"
          className="image-crop-cancel"
          onClick={onClose}
          disabled={busy || processing}
        >
          انصراف
        </button>
        <SubmitButtun
          className="image-crop-confirm"
          type="button"
          onClick={confirmCrop}
          pending={busy || processing}
          disabled={!file || !imageSize || !frameSize.width || !frameSize.height}
        >
          تأیید و استفاده از تصویر
        </SubmitButtun>
      </footer>
    </Modal>
  );
}
