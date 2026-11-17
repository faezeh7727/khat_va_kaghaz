/** @format */

function getDirection(value, fallback) {
  const firstLetter = value.match(/[A-Za-z\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/)?.[0];
  if (!firstLetter) return fallback;

  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(firstLetter) ? "rtl" : "ltr";
}

export default function TextField({
  type = "text",
  label,
  name,
  value = "",
  dir = "auto",
  className = "",
  onChange,
  placeholder,
  required = false,
  autoComplete,
  startAdornment,
  endAdornment,
}) {
  const inputDir = dir === "auto" ? getDirection(value, "auto") : dir;
  const id = `auth-${name}`;

  return (
    <div className="auth-field">
      <label className="auth-field-label" htmlFor={id}>
        {label}
      </label>
      <div className="auth-field-control">
        {startAdornment && (
          <span className="auth-field-adornment auth-field-adornment-start" aria-hidden="true">
            {startAdornment}
          </span>
        )}
        <input
          id={id}
          type={type}
          name={name}
          value={value}
          dir={inputDir}
          className={`auth-field-input ${className}`.trim()}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
        />
        {endAdornment && (
          <span className="auth-field-adornment auth-field-adornment-end">
            {endAdornment}
          </span>
        )}
      </div>
    </div>
  );
}
