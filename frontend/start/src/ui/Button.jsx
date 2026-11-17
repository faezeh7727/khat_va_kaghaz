/** @format */

export const buttonTypes = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outlinePrimary: "btn-outline-primary",
  outlineSecondary: "btn-outline-secondary",
  success: "btn-success",
  error: "btn-danger",
};

export default function Button({ children, onClick, variant = "primary", className = "", ...rest }) {
  const classes = ["btn", buttonTypes[variant] || buttonTypes.primary, className].filter(Boolean).join(" ");
  return <button onClick={onClick} className={classes} {...rest}>{children}</button>;
}
 
