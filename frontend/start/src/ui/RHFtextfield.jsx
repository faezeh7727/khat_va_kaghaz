/** @format */

export default function RHFTextField({
  type = "text",
  label,
  name,
  dir = "auto",
  register,
  errors,
  placeholder,
  autoComplete,
  inputMode,
  className = "",
  startAdornment,
  endAdornment,
}) {
  const id = `auth-${name}`;
  const error = errors?.[name];

  return (
    <div className="auth-field">
      <label className="auth-field-label" htmlFor={id}>{label}</label>
      <div className="auth-field-control">
        {startAdornment && <span className="auth-field-adornment auth-field-adornment-start" aria-hidden="true">{startAdornment}</span>}
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          dir={dir}
          className={`auth-field-input ${className}`.trim()}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...register(name)}
        />
        {endAdornment && <span className="auth-field-adornment auth-field-adornment-end" aria-hidden="true">{endAdornment}</span>}
      </div>
      {error?.message && <p className="auth-field-error" id={`${id}-error`} role="alert">{error.message}</p>}
    </div>
  );
}
