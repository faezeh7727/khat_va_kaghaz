import SpinnerMini from "@/ui/SpinnerMini";

export default function SubmitButtun({
  children,
  className = "",
  pending = false,
  disabled = false,
  type = "submit",
  ...props
}) {
  return (
    <button
      {...props}
      type={type}
      className={className}
      disabled={pending || disabled}
      aria-busy={pending || undefined}
    >
      {pending && <SpinnerMini />}
      {children}
    </button>
  );
}
