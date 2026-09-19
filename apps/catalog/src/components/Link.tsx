import type { ReactNode } from "react";
import { navigate } from "../router";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
  current?: boolean;
  onNavigate?: () => void;
};

export function Link({ href, children, className, current, onNavigate }: Props) {
  return (
    <a
      href={href}
      className={className}
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
