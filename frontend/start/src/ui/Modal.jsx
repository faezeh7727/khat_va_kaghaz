"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ButtonIcon from "@/ui/buttonicon";

export default function Modal({
  title,
  eyebrow,
  description,
  children,
  onClose,
  closeDisabled = false,
  size = "md",
  dir = "rtl",
  className = "",
}) {
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const onCloseRef = useRef(onClose);
  const closeDisabledRef = useRef(closeDisabled);
  onCloseRef.current = onClose;
  closeDisabledRef.current = closeDisabled;

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !closeDisabledRef.current) onCloseRef.current?.();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !closeDisabled) onClose?.();
      }}
    >
      <section
        className={`modal-panel modal-panel--${size} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        dir={dir}
      >
        <header className="modal-header">
          <div className="modal-heading">
            {eyebrow && <span className="modal-eyebrow"><span className="modal-eyebrow-dot" aria-hidden="true" />{eyebrow}</span>}
            <h2 id={titleId}>{title}</h2>
            {description && <p id={descriptionId}>{description}</p>}
          </div>
          <ButtonIcon
            className="mobile-menu-toggle modal-close"
            variant="outline"
            type="button"
            aria-label="بستن پنجره"
            onClick={onClose}
            disabled={closeDisabled}
          >
            <XMarkIcon aria-hidden="true" />
          </ButtonIcon>
        </header>
        <div className="modal-content">{children}</div>
      </section>
    </div>,
    document.body
  );
}
