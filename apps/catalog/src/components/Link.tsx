import type { ReactNode } from "react";
import { navigate } from "../router";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
  current?: boolean;
  /** 閉じたあとに focus を戻す先を探すために使う。 */
  id?: string;
  "aria-haspopup"?: "dialog";
  "aria-label"?: string;
  onNavigate?: () => void;
};

export function Link({ href, children, className, current, id, onNavigate, ...rest }: Props) {
  return (
    <a
      href={href}
      className={className}
      id={id}
      {...rest}
      aria-current={current ? "page" : undefined}
      onClick={(event) => {
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }
        event.preventDefault();
        navigate(href);
        onNavigate?.();
      }}
    >
      {children}
    </a>
  );
}
