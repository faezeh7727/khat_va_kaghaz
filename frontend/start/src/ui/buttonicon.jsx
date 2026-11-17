import { forwardRef } from "react";

export const buttonIconVariants = ["primary", "secondary", "outline", "danger"];

const variantClasses = {
  primary: "button-icon--primary",
  secondary: "button-icon--secondary",
  outline: "button-icon--outline",
  danger: "button-icon--danger",
};

const ButtonIcon = forwardRef(function ButtonIcon({
  children,
  variant = "outline",
  className = "",
  type = "button",
  ...props
}, ref) {
  const safeVariant = buttonIconVariants.includes(variant) ? variant : "outline";
  const classes = [
    "button-icon",
    variantClasses[safeVariant],
    "[&>svg]:w-5 [&>svg]:h-5 [&>svg]:text-inherit",
    className,
  ].filter(Boolean).join(" ");

  return (
    <button ref={ref} type={type} className={classes} {...props}>
      {children}
    </button>
  );
});

export default ButtonIcon;
