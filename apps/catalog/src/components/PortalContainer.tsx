import { createContext, useContext, type ReactNode, type RefObject } from "react";

const PortalContainerContext = createContext<RefObject<HTMLElement | null> | null>(null);

export function PortalContainerProvider({
  value,
  children,
}: {
  value: RefObject<HTMLElement | null>;
  children: ReactNode;
}) {
  return (
    <PortalContainerContext.Provider value={value}>{children}</PortalContainerContext.Provider>
  );
}

export function usePortalContainer(): RefObject<HTMLElement | null> {
  const container = useContext(PortalContainerContext);
  if (!container) throw new Error("PortalContainer がない");
  return container;
}
