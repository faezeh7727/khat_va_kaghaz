"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import useMoveBack from "@/hooks/usemoveback";
import Button from "@/ui/Button";

export default function NotFoundModal() {
  const moveBack = useMoveBack();
  const [portalTarget, setPortalTarget] = useState(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  if (!portalTarget) return null;

  return createPortal(
    <div className="not-found-overlay" role="presentation">
      <section className="not-found-modal" role="alertdialog" aria-modal="true" aria-labelledby="not-found-title" aria-describedby="not-found-description">
        <div className="not-found-modal-content">
          <div className="not-found-status">
            <span className="not-found-status-dot" aria-hidden="true" />
            <span>خطای ۴۰۴، گم شده</span>
          </div>

          <div className="not-found-icon" aria-hidden="true">
            <span className="not-found-icon-paper">
              <span />
              <span />
            </span>
            <span className="not-found-icon-dot" />
          </div>

          <p className="not-found-code" aria-hidden="true">۴۰۴</p>
          <h1 id="not-found-title">صفحه‌ای که دنبالش بودید،</h1>
          <h2>در میان نوشته‌ها پیدا نشد</h2>
          <p id="not-found-description" className="not-found-description">
            ممکن است این بخش جابه‌جا شده باشد یا مسیر موردنظر دیگر وجود نداشته باشد. می‌توانید به صفحه‌ی قبلی برگردید و دوباره تلاش کنید.
          </p>

          <Button type="button" onClick={moveBack} variant="secondary" className="not-found-back-button">
            <span>بازگشت به صفحه قبل</span>
            <ArrowLeftIcon aria-hidden="true" />
          </Button>

        </div>

        <footer className="not-found-footer">
          <span>فصلنامه اندیشه و ادبیات خط و کاغذ</span>
          <span>پاییز ۱۴۰۵</span>
        </footer>
      </section>
    </div>,
    portalTarget,
  );
}
