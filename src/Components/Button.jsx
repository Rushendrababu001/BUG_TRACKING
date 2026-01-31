import React from "react";

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold tracking-tight transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 disabled:pointer-events-none";

const variantStyles = {
  primary:
    "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-indigo-500",
  secondary:
    "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-slate-400",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:outline-slate-300",
  danger:
    "bg-rose-500 text-white hover:bg-rose-600 shadow-sm focus-visible:outline-rose-500",
};

const sizeStyles = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

const Button = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  loading = false,
  loadingText = "Please wait...",
  disabled,
  type = "button",
  ...props
}) => {
  const styles = [
    baseStyles,
    variantStyles[variant] || variantStyles.primary,
    sizeStyles[size] || sizeStyles.md,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={styles}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {!loading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
      <span className="truncate">{loading ? loadingText : children}</span>
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;
