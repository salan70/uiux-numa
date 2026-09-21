import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type ButtonAppearance = "primary" | "secondary" | "quiet" | "danger";
export type ButtonSize = "small" | "medium" | "large";

export type ButtonProps = Omit<ComponentPropsWithoutRef<"button">, "size"> & {
  appearance?: ButtonAppearance;
  size?: ButtonSize;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

export function Button({
  appearance = "primary",
  size = "medium",
  loading = false,
  leadingIcon,
  trailingIcon,
  type = "button",
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = ["button", `button--${appearance}`, `button--${size}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...props}
      type={type}
      className={classes}
      disabled={props.disabled || loading}
      aria-busy={loading || undefined}
    >
      <span className="button__leading" aria-hidden="true">
        {leadingIcon}
      </span>
      <span className="button__label">{children}</span>
      <span className="button__trailing" aria-hidden="true">
        {loading ? <span className="button__spinner" /> : trailingIcon}
      </span>
    </button>
  );
}
