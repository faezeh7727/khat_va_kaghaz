/** @format */

export default function Spinner({ label = "در حال آماده‌سازی" }) {
  return (
    <div className="async-spinner" role="status" aria-live="polite">
      <span className="async-spinner-blob" aria-hidden="true">
        <span>WAIT</span>
      </span>
      <p className="async-spinner-label">{label}</p>
      <span className="async-spinner-hint">کمی صبر کنید</span>
    </div>
  );
}
